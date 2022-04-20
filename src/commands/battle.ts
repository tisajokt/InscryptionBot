import { Client, MessageActionRow, MessageButton, ButtonInteraction, CommandInteraction, InteractionReplyOptions, MessageSelectMenu, SelectMenuInteraction, MessageComponentInteraction, DiscordAPIError, TextBasedChannel } from "discord.js";
import { PersistentCommandInteraction, SlashCommand } from "../Command";
import { SoloBattle, DuelBattle, Battle, Player, Card, terrains, cardName, PlayerBattler, playerIndex, Item, sidedecks, selectSource, modelSummary, sigil } from "../Game";
import { Display } from "../Display";
import { AppUser } from "../User";
import { generateRandomID, numberEmoji, pickRandom, sleep, toProperCase, toProperFormat } from "../util";
import game_config from "../../data/game/config.json";
import { jsonMember, jsonObject } from "typedjson";

type battleMode = "demo"|"solo"|"duel";
type battleAction = "confirm"|"draw"|"bell"|"play"|"activate"|"inspect"|"resign"|"blood"|"select";
@jsonObject
export class BattleOptions {
	@jsonMember
	candles?: number
	@jsonMember
	fieldSize?: number
	@jsonMember
	goal?: number
	@jsonMember
	scale?: number
	@jsonMember
	terrain?: cardName|"none"|"random"
	@jsonMember
	sidedeck?: cardName|"random"
	@jsonMember
	deckSize?: number|"random"
	@jsonMember
	startKit?: cardName|"none"

	withDefaults(): BattleOptions {
		const out = new BattleOptions();
		const _apply = (prop: string) => {
			if (this[prop] !== undefined) out[prop] = this[prop];
			else out[prop] = battleDefaults[prop];
		}
		//for (let i of ["candles", "fieldSize", "goal", "scale", "terrain", "sidedeck", "deckSize", "startKit"]) {
		for (let i in this) {
			_apply(i);
		}
		return out;
	}
};
const battleDefaults = {
	candles: game_config.candlesDefault,
	fieldSize: 4,
	goal: game_config.goalDefault,
	scale: 0,
	terrain: "random",
	sidedeck: "random",
	deckSize: "random",
	startKit: "none"
};

class BattleInteraction extends PersistentCommandInteraction {
	static list: Map<string, BattleInteraction> = new Map();
	battle: Battle;
	mode: battleMode;
	playerIDs: string[];
	bellMutex: boolean;
	constructor(interaction: CommandInteraction) {
		super(interaction);
		this.mode = <battleMode>interaction.options.getSubcommand();
		const other = interaction.options.getUser("user");
		this.playerIDs = [this.userID, other?.id];
		if (other?.bot) this.mode = "solo";
	}
	storeID(): void {
		BattleInteraction.list[this.id] = this;
	}
	cmd(): string {
		return "battle";
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
	_rawOptions;
	get rawOptions() {
		if (this._rawOptions) return this._rawOptions;
		const opt = this.interaction.options;
		const _rawOptions = {
			sidedeck: opt.getString("sidedeck"),
			candles: opt.getInteger("candles"),
			fieldSize: opt.getInteger("field_size"),
			goal: opt.getInteger("goal"),
			scale: opt.getInteger("scale"),
			startKit: opt.getString("start_kit"),
			terrain: opt.getString("terrain")
		};
		if (!_rawOptions.sidedeck) delete _rawOptions.sidedeck;
		if (!_rawOptions.candles) delete _rawOptions.candles;
		if (!_rawOptions.fieldSize) delete _rawOptions.fieldSize;
		if (!_rawOptions.goal) delete _rawOptions.goal;
		if (_rawOptions.scale === undefined) delete _rawOptions.scale;
		if (!_rawOptions.startKit) delete _rawOptions.startKit;
		if (!_rawOptions.terrain) delete _rawOptions.terrain;
		return this._rawOptions = _rawOptions;
	}
	_options: BattleOptions;
	get options(): BattleOptions {
		if (this._options) return this._options;
		const user = AppUser.get(this.userID);
		Object.assign(user.battleOptions, this.rawOptions);
		if (Object.keys(this.rawOptions).length) {
			AppUser.saveUsersData();
		}
		const result = user.battleOptions.withDefaults();
		if (result.sidedeck == "random") result.sidedeck = pickRandom(sidedecks);
		if (result.terrain == "random") result.terrain = pickRandom(terrains);
		else if (result.terrain == "none") result.terrain = "";
		return this._options = result;
	}
	getFieldOptions(filter: (card: Card)=>boolean = (c)=>!!c) {
		return this.battle.field[0].map((card, i) => {
			return card ? {
				card: card,
				label: card.fullSummary(i),
				description: `From player 1's field, column ${i+1}`,
				value: `${card.absoluteIndex(i)}`
			} : null;
		}).concat(this.battle.field[1].map((card, i) => {
			return card ? {
				card: card,
				label: card.fullSummary(i),
				description: `From player 2's field, column ${i+1}`,
				value: `${card.absoluteIndex(i)}`
			} : null;
		})).filter(option => filter(option?.card));
	}
	select: (value: number)=>void;
	selectingPlayer: playerIndex;
	async uponSelect(source: selectSource, player: playerIndex, defaultVal?: number, args: string[]=[]): Promise<number> {
		var title: string;
		var description: string;
		const actions = new MessageActionRow();
		const other = player ? 0 : 1;
		switch (source) {
			case "magpie":
				title = "🔍 Magpie's Eye";
				description = "Choose a card to draw from your deck";
				actions.addComponents(this.makeSelectMenu("select", this.battle.getPlayer(player).deck.cards.map((card, i) => {
					return {
						label: typeof card == "string" ? modelSummary(card) : card.fullSummary(-1),
						value: `${i}`
					};
				}).slice(0, 25))); // Discord API limitation
				break;
			case "sniper":
				title = "🎯 Sniper";
				description = "Choose where to strike";
				this.makeFieldButtons("select", [], this.battle.field[other], () => false, actions);
				break;
			case "hammer":
				title = "🔨 Hammer";
				description = "Choose a card of yours to hammer";
				this.makeFieldButtons("select", [], this.battle.field[player], (c) => !c, actions);
				break;
			case "latch":
				title = `💫 ${toProperFormat(args[0])} Latch`;
				description = `Choose a card to receive the ${args[0].replaceAll("_", " ")} sigil`;
				actions.addComponents(this.makeSelectMenu("select", this.getFieldOptions(c => c && !c.sigils.has(<sigil>args[0]))));
				break;
			case "skinning_knife":
				title = "🔪 Skinning Knife";
				description = "Choose a card on the field to skin";
				actions.addComponents(this.makeSelectMenu("select", this.getFieldOptions()));
				break;
			default:
				return defaultVal;
		}
		await this.interaction.followUp({
			embeds: [{
				title: title,
				description: description
			}],
			components: [actions]
		});
		this.selectingPlayer = player;
		return await new Promise((resolve) => {
			this.select = (value: number) => {
				delete this.select;
				resolve(value);
			}
		});
	}
	async init(): Promise<Battle> {
		if (this.battle) return this.battle;
		const options = this.options;
		const player = new Player(options.sidedeck);
		switch (this.mode) {
			case "demo":
				this.battle = this.interaction.options.getString("type") == "solo" ? new SoloBattle(player, 2, options) : new DuelBattle(player, player, options);
				break;
			case "solo":
				this.battle = new SoloBattle(player/*User.get(this.userID).soloPlayer*/, this.interaction.options.getInteger("difficulty") || 2, options);
				break;
			case "duel":
				const player2 = new Player(options.sidedeck);
				console.log("Sidedecks:", player.sidedeck.name, player2.sidedeck.name);
				this.battle = new DuelBattle(player/*User.get(this.playerIDs[0]).duelPlayer*/, player2/*User.get(this.playerIDs[1]).duelPlayer*/, options);
				break;
		}
		this.battle.uponSelect = this.uponSelect.bind(this);
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
			this.makeButton("confirm", ["accept", "0"]).setEmoji(numberEmoji[1]),
			this.makeButton("confirm", ["accept", "1"]).setEmoji(numberEmoji[2]),
			this.makeButton("confirm", ["decline"]).setLabel("Decline").setStyle("DANGER")
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
	async receiveButton(interaction: ButtonInteraction, action: battleAction, args: string[]=[]): Promise<boolean> {
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
			case "select":
				this.select && this.select(parseInt(args[0]));
				await interaction.deleteReply();
				await this.reply();
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
			case "select":
				this.select && this.select(parseInt(args[0]));
				await interaction.deleteReply();
				await this.reply();
				break;
		}
		return true;
	}
	makeFieldButtons(action: battleAction, args: string[], field: Card[], disable: (c: Card) => boolean, row?: MessageActionRow): MessageActionRow {
		const actions = row || new MessageActionRow();
		for (let i = 0; i < field.length; i++) {
			actions.addComponents(
				this.makeButton(action, args.concat([`${i}`]))
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
				this.makeButton("draw", ["deck"]).setDisabled(!this.battle.hasDrawOption("deck")).setEmoji("🃏"),
				this.makeButton("draw", ["sidedeck"]).setDisabled(!this.battle.hasDrawOption("sidedeck")).setEmoji(this.battle.getPlayer(this.battle.actor).sidedeckIcon),
				this.makeButton("draw", ["hammer"]).setDisabled(!this.battle.hasDrawOption("hammer")).setEmoji("🔨"),
				this.makeButton("inspect").setEmoji("🔍")
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
						this.makeButton("play", [(player.hand.length-1).toString()]).setLabel("Play")
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
				label: card.fullSummary(field >= 0 ? index : -1),
				description: field >= 0 ? `From player ${field+1}'s field, column ${index+1}` :
					(field == -1 ? `From your hand, card #${index+1}` : `From opponent's backfield, column ${index+1}`),
				value: `${field}.${index}`
			})
		};
		this.getPlayer(userID).hand.forEach(_toOption(-1));
		if (this.battle.isSolo()) (<SoloBattle>this.battle).bot.backfield.forEach(_toOption(-2));
		this.battle.field[0].forEach(_toOption(0));
		this.battle.field[1].forEach(_toOption(1));
		return new MessageActionRow().addComponents(
			this.makeSelectMenu("inspect", options).setPlaceholder("Pick a card")
		);
	}
	getHandOptions(userID: string): MessageActionRow {
		const options = this.getPlayer(userID).hand.sort((a,b) => ((a.isPlayable()?0:1) - (b.isPlayable()?0:1)))
			.map((card,i) => {
				return {
					label: `${card.nameSummary} [${card.stats[0]}/${card.stats[1]}]`,
					description: `${card.costEmbedDisplay}${card.isPlayable() ? "" : " (can't play)"}`,
					value: `${i}`
				}
			});
		return options.length ? new MessageActionRow().addComponents(
			this.makeSelectMenu("play", options).setPlaceholder("Pick a card")
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
				field[k]?.onSacrifice(k, card, target);
			});
			await this.play(interaction, args);
			return;
		}
		const actions = new MessageActionRow();
		for (let i = 0; i < field.length; i++) {
			const card = field[i];
			const pendingSacrifice = sacrifices.includes(i);
			actions.addComponents(
				this.makeButton("blood", [args[0], args[1], pendingSacrifice ? sacrifices.filter(v => v != i).join("-") : sacrifices.concat([i]).join("-")])
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
			if (player.items.length > 0 || this.battle.field[player.index].some((c,i) => c?.ability && c.canActivate(i))) {
				return await this.activate(interaction);
			}
		}
		await this.reply(interaction);
	}
	async activate(interaction: MessageComponentInteraction): Promise<void> {
		const options: any = [{
			label: "Return",
			value: "none"
		}];
		const player = this.getPlayer(interaction.user.id);
		player.items.forEach((item,i) => {
			options.push({
				label: toProperFormat(item.type),
				description: `${item.description}${item.isUsable(this.battle, player.index) ? "" : " (can't use)"}`,
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
			this.makeSelectMenu("activate", options).setPlaceholder("Select ability to activate")
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
		const card = (field >= 0 ? this.battle.field[field] : (field == -1 ? this.getPlayer(interaction.user.id).hand : (<SoloBattle>this.battle).bot.backfield))[index];
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
		if (this.battle.turn < 2) {
			this.battle.ended = true;
			await this.interaction.deleteReply();
		} else if (args[0] == "yes") {
			this.battle.ended = true;
			await this.reply();
		} else {
			const actions = new MessageActionRow().addComponents(
				this.makeButton("resign", ["yes"]).setStyle("DANGER").setEmoji("🏳️").setLabel("Resign")
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
			this.makeButton(bell ? "bell" : "draw").setStyle("PRIMARY").setDisabled(disabled).setEmoji(bell ? "🔔" : "🃏"),
			this.makeButton("play").setDisabled(!bell || !actor.hand.length).setEmoji("🖐️"),
			this.makeButton("activate").setDisabled(!hasActive).setEmoji("⚡"),
			this.makeButton("inspect").setEmoji("🔍"),
			this.makeButton("resign").setStyle("DANGER").setEmoji("🏳️")
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
			case "select":
				return this.select && userID == this.playerIDs[this.selectingPlayer];
			case "inspect":
				return true;
			case "resign":
				return this.playerIDs.includes(userID);
		}
	}
	async tokenExpired(): Promise<void> {
		await (await this.textChannel)?.send(`Interaction may have expired; try \`/battle continue id:${this.id}\` to resume.`);
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
			{name: "Mox Crystals", value: "mox_crystal"},
			{name: "Omnisquirrels", value: "omni_squirrel"}
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
			{name: "Mrs. Bomb", value: "mrs._bomb"},
			{name: "Magpie", value: "magpie"},
			{name: "Omnisquirrel w/ Item Bearer", value: "omni_squirrel"},
			{name: "Rabbit w/ Undying & Waterborne", value: "rabbit"},
			{name: "Cat w/ Repulsive", value: "cat"}
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
						{name: "Hard", value: 4},
						{name: "Challenging", value: 5}
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
		if (action == "resign" && !battleInteraction) {
			//await interaction.message.
			return;
		}
		if (!battleInteraction?.isAllowedAction(interaction.user.id, action)) return;
		await interaction.deferUpdate();
		try {
			await battleInteraction.receiveButton(interaction, action, args.slice(2));
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
