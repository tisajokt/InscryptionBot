import { Client, MessageActionRow, MessageButton, ButtonInteraction, CommandInteraction, InteractionReplyOptions, MessageSelectMenu, SelectMenuInteraction, MessageComponentInteraction, DiscordAPIError, TextBasedChannel } from "discord.js";
import { SlashCommand } from "../Command";
import { SoloBattle, DuelBattle, Battle, Player, Card, terrains, cardName, PlayerBattler, playerIndex, Item, sidedecks } from "../Game";
import { Display } from "../Display";
import { User } from "../User";
import { generateRandomID, numberEmoji, pickRandom, sleep, toProperCase, toProperFormat } from "../util";
import game_config from "../../data/game/config.json";

type battleMode = "demo"|"solo"|"duel";
type battleAction = "confirm"|"draw"|"bell"|"play"|"activate"|"inspect"|"resign"|"blood";
export type BattleOptions = {
	candles?: number,
	fieldSize?: number,
	goal?: number,
	scale?: number,
	terrain?: cardName|"none"|"random",
	sidedeck?: cardName|"random",
	deckSize?: number|"random",
	startKit?: cardName|"none"
};
const battleDefaults: BattleOptions = {
	candles: game_config.candlesDefault,
	fieldSize: 4,
	goal: game_config.goalDefault,
	scale: 0,
	terrain: "random",
	sidedeck: "random",
	deckSize: "random",
	startKit: "none"
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
		const other = interaction.options.getUser("user");
		this.playerIDs = [this.userID, other?.id];
		if (other?.bot) this.mode = "solo";
		BattleInteraction.list[this.id] = this;
	}
	static async create(interaction: CommandInteraction): Promise<BattleInteraction> {
		const battleInteraction = new BattleInteraction(interaction);
		if (battleInteraction.mode == "duel") {
			await battleInteraction.confirmation();
		} else {
			await battleInteraction.init();
			await battleInteraction.reply();
		}
		return battleInteraction;
	}
	makeSelectMenu(args: string): MessageSelectMenu {
		return new MessageSelectMenu().setCustomId(`battle.${this.id}.${args}`);
	}
	makeButton(action: battleAction, label?: string, args?: string[]): MessageButton {
		return new MessageButton().setCustomId(`battle.${this.id}.${action}${args?`.${args.join(".")}`:""}`).setLabel(label === undefined ? toProperCase(action) : label).setStyle("SECONDARY");
	}
	_rawOptions: BattleOptions;
	get rawOptions(): BattleOptions {
		if (this._rawOptions) return this._rawOptions;
		const opt = this.interaction.options;
		this._rawOptions = {
			candles: opt.getInteger("candles"),
			fieldSize: opt.getInteger("field_size"),
			goal: opt.getInteger("goal"),
			scale: opt.getInteger("scale"),
			startKit: opt.getString("start_kit"),
			terrain: opt.getString("terrain")
		};
		if (!this._rawOptions.candles) delete this._rawOptions.candles;
		if (!this._rawOptions.fieldSize) delete this._rawOptions.fieldSize;
		if (!this._rawOptions.goal) delete this._rawOptions.goal;
		if (this._rawOptions.scale === undefined) delete this._rawOptions.scale;
		if (!this._rawOptions.startKit) delete this._rawOptions.startKit;
		if (!this._rawOptions.terrain) delete this._rawOptions.terrain;
		return Object.freeze(this._rawOptions);
	}
	get options(): BattleOptions {
		const user = User.get(this.userID);
		Object.assign(user.battleOptions, this.rawOptions);
		const result = Object.assign(Object.create(battleDefaults), user.battleOptions);
		if (result.terrain == "random") result.terrain = pickRandom(terrains);
		else if (result.terrain == "none") result.terrain = "";
		if (result.sidedeck == "random") result.sidedeck = pickRandom(sidedecks);
		return result;
	}
	async init(): Promise<Battle> {
		if (this.battle) return this.battle;
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
		if (options.startKit != "none") {
			for (let k=0; k<2; k++) {
				if (!this.battle.isHuman(<playerIndex>k)) continue;
				const card = new Card(options.startKit);
				if (card.name == "cat") {
					card.sigils.add("repulsive");
				} else if (card.name == "rabbit") {
					card.sigils.add("undying");
					card.sigils.add("waterborne");
				} else if (card.name == "omni_squirrel") {
					card.sigils.add("item_bearer");
				}
				await this.battle.getPlayer(<playerIndex>k).addToHand(card);
			}
		}
		await this.battle.placeTerrain(this.battle.terrain);
		await this.battle.setupTurn();
		return this.battle;
	}
	async confirmation(): Promise<void> {
		if (this.mode != "duel") return;
		const actions = new MessageActionRow().addComponents(
			this.makeButton("confirm", "", ["accept", "0"]).setEmoji(numberEmoji[1]),
			this.makeButton("confirm", "", ["accept", "1"]).setEmoji(numberEmoji[2]),
			this.makeButton("confirm", "Decline", ["decline"]).setStyle("DANGER")
		)
		await this.interaction.editReply({
			embeds: [{
				title: "Battle request",
				description: `<@${this.userID}> vs. <@${this.playerIDs[1]}>`
			}],
			components: [actions]
		});
	}
	async confirmChoice(interaction: ButtonInteraction, args: string[]): Promise<void> {
		if (!args.length) return;
		if (args[0] == "decline") {
			delete BattleInteraction.list[this.id];
			await interaction.editReply({
				embeds: [{
					title: "Battle declined",
					color: "RED"
				}],
				components: []
			});
		} else if (args[0] == "accept" && args[1]) {
			if (args[1] == "0") {
				this.playerIDs = [this.playerIDs[1], this.playerIDs[0]];
			}
			await this.init();
			await this.reply();
		}
	}
	static get(id: string): BattleInteraction {
		return this.list[id];
	}
	async receiveAction(interaction: ButtonInteraction, action: battleAction, args: string[]=[]): Promise<boolean> {
		switch (action) {
			case "confirm":
				await this.confirmChoice(interaction, args);
				break;
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
				await this.activate(interaction);
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
			case "activate":
				await this.activateSelect(interaction, args);
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
			);
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
				const num = await player.drawFrom(player.deck);
				if (num) {
					const card = player.hand[player.hand.length-1];
					const actions = new MessageActionRow().addComponents(
						this.makeButton("play", "Play", [(player.hand.length-1).toString()])
							.setDisabled(!card.isPlayable())
					);
					await interaction.followUp({
						embeds: [{
							title: "🃏 Drew from deck:",
							fields: [card.getEmbedDisplay(-1)]
						}],
						components: card.isPlayable() ? [actions] : [],
						ephemeral: true
					})
				}
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
		if (args.length < 2) return;
		const player = this.getPlayer(interaction.user.id);
		const field = this.battle.field[player.index];
		const card = player.hand[parseInt(args[0])];
		if (!card || card.cost != "blood") return;
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
			sacrifices.forEach(k => {
				field[k]?.onSacrifice(k, card);
			});
			await this.play(interaction, args);
			return;
		}
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
		await interaction.editReply({
			embeds: [{
				title: `🩸 Sacrifice`,
				description: `Choose sacrifices to yield ${card.getCost()} blood`
			}],
			components: [actions]
		});
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
		else if (args[0] && args.length == 1) return await this.playCard(interaction, args);
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
	async playCard(interaction: MessageComponentInteraction, args: string[]): Promise<void> {
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
	async activateSelect(interaction: SelectMenuInteraction, args: string[]): Promise<void> {
		if (!args[0]) return;
		args = args[0].split(".");
		if (args.length == 2) {
			const type = args[0];
			const index = parseInt(args[1]);
			const player = this.getPlayer(interaction.user.id)
			if (type == "i") {
				const item = player.items[index];
				await item?.use(this.battle, player.index);
				player.items.splice(index, 1);
			} else if (type == "f") {
				const card = this.battle.field[player.index][index];
				await card.activate(index);
			}
		}
		await this.reply(interaction);
	}
	async activate(interaction: ButtonInteraction): Promise<void> {
		const options: any = [{
			label: "Return",
			value: "none"
		}];
		const player = this.getPlayer(interaction.user.id);
		player.items.forEach((item,i) => {
			options.push({
				label: toProperFormat(item.type),
				description: item.description,
				value: `i.${i}`
			})
		});
		this.battle.field[player.index].forEach((card,i) => {
			if (!card || !card.ability) return;
			options.push({
				label: `${card.nameSummary}: ${toProperFormat(card.ability)}`,
				description: `${card.abilityDescription}${card.canActivate(i) ? "" : " (can't activate)"}`,
				value: `f.${i}`
			})
		});
		const actions = new MessageActionRow().addComponents(
			this.makeSelectMenu("activate").setPlaceholder("Select ability to activate").addOptions(options)
		);
		await interaction.editReply({
			content: interaction.message.content,
			embeds: interaction.message.embeds,
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
		const actor = this.battle.getPlayer(this.battle.actor);
		const bell = this.battle.mayRingBell || this.mode == "demo";
		const hasActive = actor.items.length || this.battle.field[actor.index].filter(c => c?.ability).length;
		const actions = new MessageActionRow().addComponents(
			this.makeButton(bell ? "bell" : "draw","").setStyle("PRIMARY").setDisabled(disabled).setEmoji(bell ? "🔔" : "🃏"),
			this.makeButton("play","").setDisabled(!bell || !actor.hand.length).setEmoji("🖐️"),
			this.makeButton("activate","").setDisabled(!hasActive).setEmoji("⚡"),
			this.makeButton("inspect","").setEmoji("🔍"),
			this.makeButton("resign","").setStyle("DANGER").setEmoji("🏳️")
		);
		return Display.displayBattle(this.battle, "mini-mono", this.battle.ended ? [] : [actions]);
	}
	async reply(interaction: CommandInteraction|MessageComponentInteraction=this.interaction): Promise<void> {
		const reply = this.makeReply();
		if (this.mode == "duel") {
			reply.content = `<@${this.playerIDs[this.battle.actor]}>'s Turn\n${reply.content||""}`;
		}
		await interaction.editReply(reply);
	}
	isAllowedUser(userID: string): boolean {
		return this.playerIDs.includes(userID) || this.mode == "demo";
	}
	isAllowedAction(userID: string, action: battleAction): boolean {
		switch (action) {
			case "confirm":
				return !this.battle && userID == this.playerIDs[1];
			case "bell":
				if (!this.bellMutex && this.mode == "demo") return true;
			case "draw":
			case "play":
			case "blood":
			case "activate":
				return userID == this.playerIDs[this.battle.actor];
			case "inspect":
				return true;
			case "resign":
				return this.playerIDs.includes(userID);
		}
	}
	get textChannel(): Promise<TextBasedChannel> {
		const interaction = this.interaction;
		return new Promise((resolve, reject) => {
			interaction.client.channels.fetch(interaction.channelId).then((channel) => {
				if (channel.isText()) resolve(channel);
				else reject();
			}).catch(reject);
		})
	}
	async tokenExpired(): Promise<void> {
		await (await this.textChannel)?.send(`Interaction may have expired; try \`/battle continue id:${this.id}\` to resume.`);
	}
	async internalError(): Promise<void> {
		await (await this.textChannel)?.send(`Internal application error! Please report to a developer.`);
	}
	async resume(interaction: CommandInteraction): Promise<void> {
		try {
			await this.interaction.editReply({components: []});
		} catch (e) {};
		this.interaction = interaction;
		await this.reply();
	}
}

const universalOptions: any = [
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
		name: "field_size",
		description: `Columns on the field? (default ${battleDefaults.fieldSize})`,
		type: 4,
		min_value: 3,
		max_value: 5
	},
	{
		name: "candles",
		description: `Number of candles (default ${battleDefaults.candles})`,
		type: 4,
		min_value: 1,
		max_value: 5
	},
	{
		name: "goal",
		description: `Goal amount of damage (default ${battleDefaults.goal})`,
		type: 4,
		min_value: 3,
		max_value: 10
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
		description: `Terrain to place on the field at the start (default ${battleDefaults.terrain})`,
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
	},
	{
		name: "start_kit",
		description: `Card(s) to give players at the start (default ${battleDefaults.startKit})`,
		type: 3,
		choices: [
			{name: "None", value: "none"},
			{name: "Black Goat", value: "black_goat"},
			{name: "Rabbit w/ Undying & Waterborne", value: "rabbit"},
			{name: "Cat w/ Repulsive", value: "cat"},
			{name: "Mrs. Bomb", value: "mrs._bomb"},
			{name: "Omnisquirrel w/ Item Bearer", value: "omni_squirrel"}
		]
	}
];
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
				}
			].concat(universalOptions)
		},
		{
			name: "solo",
			description: "Play a one-off battle vs. the computer",
			type: 1,
			options: [
				{
					name: "difficulty",
					description: "Difficulty level (default normal)",
					type: 4,
					choices: [
						{name: "Easy", value: 1},
						{name: "Normal", value: 2},
						{name: "Advanced", value: 3},
						{name: "Challenging", value: 4}
					]
				}
			].concat(universalOptions)
		},
		{
			name: "duel",
			description: "Play a PvP duel vs. another user",
			type: 1,
			options: [
				{
					name: "user",
					description: "User to challenge",
					type: 6,
					required: true
				}
			].concat(universalOptions)
		},
		{
			name: "continue",
			description: "Continue a battle elsewhere or after it's expired",
			type: 1,
			options: [
				{
					name: "id",
					description: "ID of the battle",
					type: 3,
					required: true
				}
			]
		}
	],
	run: async(client: Client, interaction: CommandInteraction) => {
		// const user = User.get(interaction.user.id);
		const cmd = interaction.options.getSubcommand();
		if (cmd == "continue") {
			const battle = BattleInteraction.get(interaction.options.getString("id"));
			if (battle?.battle && battle.playerIDs.includes(interaction.user.id)
				&& !battle.battle.ended) {
				await interaction.deferReply();
				await battle.resume(interaction);
			}
		} else {
			await interaction.deferReply();
			await BattleInteraction.create(interaction);
		}
	},
	button: async(client: Client, interaction: ButtonInteraction, args: string[]) => {
		const battleInteraction = BattleInteraction.get(args[0]);
		const action = <battleAction>args[1];
		if (!battleInteraction?.isAllowedAction(interaction.user.id, action)) return;
		await interaction.deferUpdate();
		try {
			await battleInteraction.receiveAction(interaction, action, args.slice(2));
		} catch (e) {
			if (e instanceof DiscordAPIError) {
				console.error(e);
				await battleInteraction.tokenExpired();
			} else {
				await battleInteraction.internalError();
				throw e;
			}
		}
	},
	menu: async(client: Client, interaction: SelectMenuInteraction, args: string[]) => {
		const battleInteraction = BattleInteraction.get(args[0]);
		const action = <battleAction>args[1];
		if (!battleInteraction?.isAllowedAction(interaction.user.id, action)) return;
		await interaction.deferUpdate();
		try {
			await battleInteraction.receiveMenu(interaction, action, interaction.values);
		} catch (e) {
			if (e instanceof DiscordAPIError) {
				console.error(e);
				await battleInteraction.tokenExpired();
			} else {
				await battleInteraction.internalError();
				throw e;
			}
		}
	}
}
