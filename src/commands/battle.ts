import { Client, BaseCommandInteraction, MessageActionRow, MessageButton, ButtonInteraction, MessageButtonStyle, CommandInteraction, Interaction, MessageInteraction, InteractionResponseType, MessagePayload, InteractionReplyOptions, MessageSelectMenu, SelectMenuInteraction, Message } from "discord.js";
import { SlashCommand } from "../Command";
import { SoloBattle, DuelBattle, Battle, Player, Card, terrains, cardName, PlayerBattler, playerIndex } from "../Game";
import { Display } from "../Display";
import { User } from "../User";
import { generateRandomID, numberEmoji, pickRandom, sleep, toProperCase } from "../util";

type battleMode = "demo"|"solo"|"duel";
type battleAction = "draw"|"bell"|"play"|"activate"|"inspect"|"resign"|"blood";
export type BattleOptions = {
	candles?: number,
	fieldSize?: 4|5,
	goal?: number,
	scale?: number,
	terrain?: cardName|"none"|"random",
	sidedeck?: cardName|"random",
	deckSize?: number|"random"
};

class BattleInteraction {
	static list: Map<string, BattleInteraction> = new Map();
	id: string;
	battle: Battle;
	interaction: CommandInteraction;
	mode: battleMode;
	userID: string;
	playerIDs: string[];
	bellMutex: boolean;
	constructor(interaction: CommandInteraction) {
		this.id = generateRandomID(8);
		this.interaction = interaction;
		this.mode = <battleMode>interaction.options.getSubcommand();
		this.userID = interaction.user.id;
		this.playerIDs = [this.userID, interaction.options.getUser("user")?.id];
		BattleInteraction.list[this.id] = this;
	}
	static async create(interaction: CommandInteraction): Promise<BattleInteraction> {
		const battleInteraction = new BattleInteraction(interaction);
		await battleInteraction.init();
		await battleInteraction.reply();
		return battleInteraction;
	}
	makeSelectMenu(args: string): MessageSelectMenu {
		return new MessageSelectMenu().setCustomId(`battle.${this.id}.${args}`);
	}
	makeButton(action: battleAction, label?: string, args?: string[]): MessageButton {
		return new MessageButton().setCustomId(`battle.${this.id}.${action}${args?`.${args.join(".")}`:""}`).setLabel(label === undefined ? toProperCase(action) : label).setStyle("SECONDARY");
	}
	get options(): BattleOptions {
		let terrain = this.interaction.options.getString("terrain");
		if (!terrain || terrain == "random") terrain = pickRandom(terrains);
		else if (terrain == "none") terrain = "";
		return {
			candles: this.interaction.options.getInteger("candles") || 3,
			fieldSize: this.interaction.options.getBoolean("big_field") ? 5 : 4,
			goal: this.interaction.options.getInteger("goal") || 5,
			scale: this.interaction.options.getInteger("scale") || 0,
			terrain: terrain
		}
	}
	async init(): Promise<Battle> {
		const options = this.options;
		switch (this.mode) {
			case "demo":
				this.battle = this.interaction.options.getString("type") == "solo" ? new SoloBattle(new Player(), options) : new DuelBattle(new Player(), new Player(), options);
				break;
			case "solo":
				this.battle = new SoloBattle(User.get(this.userID).soloPlayer, options);
				break;
			case "duel":
				this.battle = new DuelBattle(User.get(this.playerIDs[0]).duelPlayer, User.get(this.playerIDs[1]).duelPlayer, options);
				break;
		}
		await this.battle.placeTerrain(this.battle.terrain);
		await this.battle.setupTurn();
		return this.battle;
	}
	static get(id: string): BattleInteraction {
		return this.list[id];
	}
	async receiveAction(interaction: ButtonInteraction, action: battleAction, args: string[]=[]): Promise<boolean> {
		switch (action) {
			case "draw":
				await this.chooseDraw(interaction, args);
				break;
			case "bell":
				await this.ringBell(interaction);
				break;
			case "play":
				await this.play(interaction, args);
				break;
			case "blood":
				await this.chooseBlood(interaction, args);
				break;
			case "activate":
				break;
			case "inspect":
				await this.inspect(interaction);
				break;
			case "resign":
				await this.resign(interaction, args);
				break;
		}
		return true;
	}
	async receiveMenu(interaction: SelectMenuInteraction, action: battleAction, args: string[]=[]): Promise<boolean> {
		switch (action) {
			case "play":
				await this.playCard(interaction, args);
				break;
			case "inspect":
				await this.inspectCard(interaction, args);
				break;
		}
		return true;
	}
	makeFieldButtons(action: battleAction, args: string[], field: Card[], disable: (c: Card) => boolean): MessageActionRow {
		const actions = new MessageActionRow();
		for (let i = 0; i < field.length; i++) {
			actions.addComponents(
				this.makeButton(action, "", args.concat([`${i}`]))
					.setDisabled(disable(field[i])).setEmoji(numberEmoji[i+1])
			)
		}
		return actions;
	}
	async chooseHammer(interaction: ButtonInteraction, arg: string): Promise<void> {
		console.log(`Hammering with arg: ${arg}`);
		const choice = parseInt(arg);
		const idx = this.getPlayerIdx(interaction.user.id);
		const field = this.battle.field[idx];
		if (arg && field[choice]) {
			const player = this.getPlayer(interaction.user.id);
			await player.useHammer(choice);
			await this.reply(interaction);
			return;
		}
		const actions = this.makeFieldButtons("draw", ["hammer"], field, (c) => !c);
		const message = {
			content: interaction.message.content,
			embeds: interaction.message.embeds,
			components: [actions]
		};
		await interaction.editReply(message);
	}
	async chooseDraw(interaction: ButtonInteraction, args: string[]): Promise<void> {
		const choice = args[0];
		if (!choice) {
			const actions = new MessageActionRow().addComponents(
				this.makeButton("draw", "", ["deck"]).setDisabled(!this.battle.hasDrawOption("deck")).setEmoji("🃏"),
				this.makeButton("draw", "", ["sidedeck"]).setDisabled(!this.battle.hasDrawOption("sidedeck")).setEmoji(this.battle.getPlayer(this.battle.actor).sidedeckIcon),
				this.makeButton("draw", "", ["hammer"]).setDisabled(!this.battle.hasDrawOption("hammer")).setEmoji("🔨")
			)
			const message = {
				content: interaction.message.content,
				embeds: interaction.message.embeds,
				components: [actions]
			};
			await interaction.editReply(message);
			return;
		}
		const player = this.battle.getPlayer(this.battle.actor);
		if (player.index != this.battle.actor) return;
		switch (choice) {
			case "deck":
				await player.drawFrom(player.deck);
				break;
			case "sidedeck":
				await player.drawFrom(player.sidedeck);
				break;
			case "hammer":
				await this.chooseHammer(interaction, args[1]);
				return;
		}
		await this.reply(interaction);
	}
	async ringBell(interaction: ButtonInteraction): Promise<void> {
		const battle = this.battle;
		if (this.bellMutex || !battle.mayRingBell && this.mode != "demo") return;
		this.bellMutex = true;
		if (this.mode == "demo") {
			while (await battle.players[battle.actor].performAction());
		}
		await battle.executeTurn();
		await battle.setupTurn();
		await this.reply(interaction);
		if (!battle.isHuman(battle.actor)) {
			await sleep(500);
			while (await battle.players[battle.actor].performAction());
			await battle.executeTurn();
			await battle.setupTurn();
			await this.reply(interaction);
		}
		this.bellMutex = false;
		if (this.battle.ended) {
			delete BattleInteraction[this.id];
		}
	}
	getPlayerIdx(userID: string): playerIndex {
		const idx = this.playerIDs.indexOf(userID);
		return idx > -1 ? <playerIndex>idx : this.battle.actor;
	}
	getPlayer(userID: string): PlayerBattler {
		return this.battle.getPlayer(this.getPlayerIdx(userID));
	}
	getInspectOptions(userID: string): MessageActionRow {
		const options = [];
		const _toOption = (field: number) => (card: Card, index: number) => {
			if (!card) return;
			options.push({
				label: card.nameSummary,
				description: field >= 0 ? `From player ${field+1}'s field, column ${index+1}` :
					`From your hand, card #${index+1}`,
				value: `${field}.${index}`
			})
		};
		this.battle.field[0].forEach(_toOption(0));
		this.battle.field[1].forEach(_toOption(1));
		this.getPlayer(userID).hand.forEach(_toOption(-1));
		return new MessageActionRow().addComponents(
			this.makeSelectMenu("inspect").setPlaceholder("Pick a card").addOptions(options)
		);
	}
	getHandOptions(userID: string): MessageActionRow {
		const options = this.getPlayer(userID).hand.sort((a,b) => ((a.isPlayable()?0:1) - (b.isPlayable()?0:1)))
			.map((card,i) => {
				return {
					label: card.nameSummary,
					description: `${card.costEmbedDisplay}${card.isPlayable() ? "" : " (can't play)"}`,
					value: `${i}`
				}
			});
		return options.length ? new MessageActionRow().addComponents(
			this.makeSelectMenu("play").setPlaceholder("Pick a card").addOptions(options)
		) : null;
	}
	async chooseBlood(interaction: ButtonInteraction, args: string[]): Promise<void> {
		console.log("Choose blood");
		if (args.length < 2) return;
		console.log("Enough args");
		const player = this.getPlayer(interaction.user.id);
		const field = this.battle.field[player.index];
		const card = player.hand[parseInt(args[0])];
		if (!card || card.cost != "blood") {
			console.log("Blood card doesn't exist!");
			return;
		}
		console.log("Blood card exists");
		const target = parseInt(args[1]);
		var sacrifices = [];
		if (!args[2]) {
			args[2] = field[target] ? `${target}` : "";
		}
		if (args[2]) {
			sacrifices = args[2].split("-").map(n => parseInt(n));
		}
		var blood = 0;
		sacrifices.map(k => field[k]?.blood || 0).forEach(n => {blood += n});
		if (player.blood + blood >= card.getCost()) {
			console.log("Sacrificial needs met, sacrificing...");
			sacrifices.forEach(k => {
				field[k]?.onSacrifice(k, card);
			});
			await this.play(interaction, args);
			return;
		}
		console.log(`Insufficient blood, select more...`);
		const actions = new MessageActionRow();
		for (let i = 0; i < field.length; i++) {
			const card = field[i];
			const pendingSacrifice = sacrifices.includes(i);
			actions.addComponents(
				this.makeButton("blood", "", [args[0], args[1], pendingSacrifice ? sacrifices.filter(v => v != i).join("-") : sacrifices.concat([i]).join("-")])
					.setDisabled(!card || card.noSacrifice || i == target)
					.setEmoji(pendingSacrifice ? "🩸" : numberEmoji[i+1])
			)
		}
		console.log("Editing reply");
		await interaction.editReply({
			embeds: [{
				title: `🩸 Sacrifice`,
				description: `Choose sacrifices to yield ${card.getCost()} blood`
			}],
			components: [actions]
		})
	}
	async play(interaction: ButtonInteraction, args: string[]): Promise<void> {
		if (args.length >= 2) {
			const index = parseInt(args[0]);
			const target = parseInt(args[1]);
			const player = this.getPlayer(interaction.user.id);
			const card = player.hand[index];
			if (!card?.isPlayable()) return;
			if (card.cost == "blood" && player.blood < card.getCost()) {
				await this.chooseBlood(interaction, args);
				return;
			} else {
				await player.playFromHand(index, target);
				player.blood = 0;
				await this.reply();
			}
		}
		const options = this.getHandOptions(interaction.user.id);
		const message: any = {
			embeds: [{
				title: ":hand_splayed: Play from hand",
				description: "Select a card from your hand to play"
			}],
			components: options ? [options] : []
		};
		if (args[0]) {
			interaction.editReply(message);
		} else {
			message.ephemeral = true;
			interaction.followUp(message);
		}
	}
	async playCard(interaction: SelectMenuInteraction, args: string[]): Promise<void> {
		if (!args[0]) return;
		const index = parseInt(args[0]);
		const player = this.getPlayer(interaction.user.id);
		const card = player.hand[index];
		if (!card?.isPlayable()) return;
		const actions = this.makeFieldButtons("play", [`${index}`], this.battle.field[player.index], (c) => {
			if (c) return card.cost != "blood" || c.noSacrifice || card.getCost() == 0 || c.sigils.has("many_lives");
			return false;
		});
		const cost = card.getCost() ? ` for ${card.getCost()}x${card.costEmoji}` : "";
		await interaction.editReply({
			embeds: [{
				title: ":hand_splayed: Play from hand",
				description: `Choose where to play the ${card.nameSummary}${cost}`
			}],
			components: [actions]
		});
	}
	async inspectCard(interaction: SelectMenuInteraction, args: string[]): Promise<void> {
		if (!args[0]) return;
		args = args[0].split(".");
		const field = parseInt(args[0]);
		const index = parseInt(args[1]);
		const card = (field >= 0 ? this.battle.field[field] : this.getPlayer(interaction.user.id).hand)[index];
		if (card) {
			await interaction.editReply({
				embeds: [{
					title: ":mag: Inspect",
					fields: [card.getEmbedDisplay(field >= 0 ? index : -1)]
				}],
				components: [this.getInspectOptions(interaction.user.id)]
			})
		}
	}
	async inspect(interaction: ButtonInteraction): Promise<void> {
		await interaction.followUp({
			embeds: [{
				title: ":mag: Inspect",
				description: "Select a card from the field or your hand to view full details on"
			}],
			components: [this.getInspectOptions(interaction.user.id)],
			ephemeral: true
		});
	}
	async resign(interaction: ButtonInteraction, args: string[]): Promise<void> {
		if (args[0] == "yes") {
			this.battle.ended = true;
			await this.reply();
		} else {
			const actions = new MessageActionRow().addComponents(
				this.makeButton("resign", "Resign", ["yes"]).setStyle("DANGER").setEmoji("🏳️")
			)
			await interaction.followUp({
				embeds: [{
					description: "Are you sure you want to resign?"
				}],
				components: [actions],
				ephemeral: true
			})
		}
	}
	makeReply(): InteractionReplyOptions {
		const disabled = !this.battle.isHuman(this.battle.actor);
		const bell = this.battle.mayRingBell || this.mode == "demo";
		const actions = new MessageActionRow().addComponents(
			this.makeButton(bell ? "bell" : "draw","").setStyle("PRIMARY").setDisabled(disabled).setEmoji(bell ? "🔔" : "🃏"),
			this.makeButton("play","").setDisabled(!bell || !this.battle.getPlayer(this.battle.actor).hand.length).setEmoji("🖐️"),
			this.makeButton("activate","").setDisabled(true).setEmoji("⚡"),
			this.makeButton("inspect","").setEmoji("🔍"),
			this.makeButton("resign","").setStyle("DANGER").setEmoji("🏳️")
		);
		return Display.displayBattle(this.battle, "mini-mono", this.battle.ended ? [] : [actions]);
	}
	async reply(interaction: CommandInteraction|ButtonInteraction|SelectMenuInteraction=this.interaction): Promise<void> {
		const reply = this.makeReply();
		if (this.mode == "duel") {
			reply.content = `<@${this.playerIDs[this.battle.actor]}>\n${reply.content||""}`;
		}
		await interaction.editReply(reply);
	}
	isAllowedUser(userID: string): boolean {
		return this.playerIDs.includes(userID) || this.mode == "demo";
	}
	isAllowedAction(userID: string, action: battleAction): boolean {
		switch (action) {
			case "bell":
				if (!this.bellMutex && this.mode == "demo") return true;
			case "draw":
			case "play":
			case "blood":
			case "activate":
				return userID == this.playerIDs[this.battle.actor];
			case "inspect":
			case "resign":
				return this.playerIDs.includes(userID);
		}
	}
}

export const battle: SlashCommand = {
	name: "battle",
	description: "Battling commands",
	options: [
		{
			name: "demo",
			description: "View a demo battle",
			type: 1,
			options: [
				{
					name: "type",
					description: "Type of simulated battle",
					type: 3,
					choices: [{name: "Solo", value: "solo"}, {name: "PvP", value: "duel"}],
					required: true
				},
				{
					name: "auto",
					description: "Automatically run the battle? (default true)",
					type: 5
				},
				{
					name: "candles",
					description: "Number of candles (default 3)",
					type: 4,
					min_value: 1,
					max_value: 5
				},
				{
					name: "big_field",
					description: "Field has 5 spaces instead of 4?",
					type: 5
				},
				{
					name: "goal",
					description: "Goal amount of damage (default 5)",
					type: 4,
					min_value: 3,
					max_value: 20
				},
				{
					name: "scale",
					description: "Starting damage (+N is player 1 advantage, -N is AI/player 2 advantage)",
					type: 4,
					min_value: -2,
					max_value: 2
				},
				{
					name: "terrain",
					description: "Terrain to place on the field at the start (default random)",
					type: 3,
					choices: [
						{name: "None", value: "none"},
						{name: "Random", value: "random"},
						{name: "Boulder (0/5, stone)", value: "boulder"},
						{name: "Stump (0/3)", value: "stump"},
						{name: "Grand Fir (0/5, mighty leap)", value: "grand_fir"},
						{name: "Frozen Opossum (0/5, frozen away)", value: "frozen_opossum"},
						{name: "Moleman (0/6, burrowing, mighty leap)", value: "moleman"},
						{name: "Broken Bot (0/1, detonator)", value: "broken_bot"}
					]
				}
			]
		},
		{
			name: "solo",
			description: "Play a one-off battle vs. the computer (NOT IMPLEMENTED)",
			type: 1,
			options: [
				{
					name: "sidedeck",
					description: "Sidedeck to use (default random)",
					type: 3,
					choices: [
						{name: "Random", value: "random"},
						{name: "Squirrels", value: "squirrel"},
						{name: "Empty Vessels", value: "empty_vessel"},
						{name: "Skeletons", value: "skeleton"},
						{name: "Mox Crystals", value: "mox_crystal"}
					]
				},
				{
					name: "deck_size",
					description: "Size of the deck to auto-generate (default 30)",
					type: 4,
					min_value: 20,
					max_value: 50
				}
			]
		},
		{
			name: "duel",
			description: "Play a PvP duel vs. another user (NOT IMPLEMENTED)",
			type: 1,
			options: [
				{
					name: "user",
					description: "User to challenge",
					type: 6,
					required: true
				}
			]
		}
	],
	run: async(client: Client, interaction: CommandInteraction) => {
		const user = User.get(interaction.user.id);
		await interaction.deferReply();
		const battleInteraction = await BattleInteraction.create(interaction);
	},
	button: async(client: Client, interaction: ButtonInteraction, args: string[]) => {
		const battleInteraction = BattleInteraction.get(args[0]);
		const action = <battleAction>args[1];
		if (!battleInteraction?.isAllowedAction(interaction.user.id, action)) return;
		await interaction.deferUpdate();
		await battleInteraction.receiveAction(interaction, action, args.slice(2));
	},
	menu: async(client: Client, interaction: SelectMenuInteraction, args: string[]) => {
		const battleInteraction = BattleInteraction.get(args[0]);
		const action = <battleAction>args[1];
		if (!battleInteraction?.isAllowedAction(interaction.user.id, action)) return;
		await interaction.deferUpdate();
		await battleInteraction.receiveMenu(interaction, action, interaction.values);
	}
}
