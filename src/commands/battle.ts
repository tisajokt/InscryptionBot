import { Client, BaseCommandInteraction, MessageActionRow, MessageButton, ButtonInteraction, MessageButtonStyle, CommandInteraction, Interaction, MessageInteraction, InteractionResponseType } from "discord.js";
import { SlashCommand } from "../Command";
import { SoloBattle, DuelBattle, Battle, Player, Card, terrains, cardName } from "../Game";
import { Display } from "../Display";
import { User } from "../User";
import { pickRandom, sleep, toProperCase } from "../util";

type battleMode = "demo"|"solo"|"duel";
type battleAction = "bell"|"inspect"|"hand"|"resign";
type BattleOptions = {
	candles: number,
	fieldSize: 4|5,
	goal: number,
	scale: number,
	terrain: cardName
};

class BattleInteraction {
	static nextId=0;
	static list: Map<string, BattleInteraction> = new Map();
	id: number;
	battle: Battle;
	interaction: CommandInteraction;
	mode: battleMode;
	edit: boolean=false;
	user: string;
	players: string[];
	bellMutex: boolean;
	constructor(interaction: CommandInteraction) {
		this.id = BattleInteraction.nextId++;
		this.interaction = interaction;
		this.mode = <battleMode>interaction.options.getSubcommand();
		this.user = interaction.user.id;
		BattleInteraction.list[this.id] = this;
	}
	makeButton(action: battleAction, label?: string, args?: string[]): MessageButton {
		return new MessageButton().setCustomId(`battle.${this.id}.${action}${args?`.${args.join(".")}`:""}`).setLabel(label || toProperCase(action)).setStyle("SECONDARY");
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
				this.battle = new SoloBattle(new Player(), options);
				break;
			case "duel":
				this.battle = new DuelBattle(new Player(), new Player(), options);
				break;
		}
		await this.battle.placeTerrain(this.battle.terrain);
		await this.battle.setupTurn();
		return this.battle;
	}
	static get(id: string): BattleInteraction {
		return this.list[id];
	}
	async inspect(interaction: ButtonInteraction, args: string[]): Promise<void> {
		var firstInspect = !args.length;
		if (firstInspect) {
			args = ["0", "0"];
		}
		const field = parseInt(args[0]);
		const nextField = (field+1)%3;
		const nextCard = (parseInt(args[1])+1)%(field < 2 ? this.battle.fieldSize : this.battle.getPlayer(this.battle.actor).hand.length);
		const actions = new MessageActionRow().addComponents(
			this.makeButton("inspect", "Next Card", [args[0], nextCard.toString()]),
			this.makeButton("inspect", "Next Field", [nextField.toString(), "0"])
		)
		const message = {
			embeds: [{
				title: "INSPECT: " + (field < 2 ? `Player ${field+1}'s Field` : "Hand")
			}],
			components: [actions],
			ephemeral: true
		};
		if (firstInspect) {
			interaction.followUp(message);
		} else {
			interaction.editReply(message);
		}
	}
	async receiveAction(interaction: ButtonInteraction, action: battleAction, args: string[]=[]): Promise<boolean> {
		switch (action) {
			case "bell":
				await this.ringBell(interaction);
				break;
			case "inspect":
				await this.inspect(interaction, args);
				break;
			case "hand":
				break;
			case "resign":
				this.battle.ended = true;
				await this.reply(interaction);
				break;
		}
		return true;
	}
	async ringBell(interaction: ButtonInteraction): Promise<void> {
		const battle = this.battle;
		if (this.bellMutex) return;
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
	async reply(interaction?: ButtonInteraction): Promise<void> {
		const disabled = !this.battle.isHuman(this.battle.actor);
		const actions = new MessageActionRow().addComponents(
			this.makeButton("bell").setStyle("PRIMARY").setDisabled(disabled),
			this.makeButton("hand").setDisabled(disabled),
			this.makeButton("inspect"),
			this.makeButton("resign").setStyle("DANGER")
		)
		if (this.edit) {
			await interaction.editReply(Display.displayBattle(this.battle, "mini-mono", this.battle.ended ? [] : [actions]));
		} else {
			await this.interaction.reply(Display.displayBattle(this.battle, "mini-mono", [actions]));
			this.edit = true;
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
				},
				{
					name: "auto_mulligan",
					description: "Automatically mulligan if hand is unplayable? (default yes)",
					type: 5
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
		const battleInteraction = new BattleInteraction(interaction);
		await battleInteraction.init();
		await battleInteraction.reply();
	},
	button: async(client: Client, interaction: ButtonInteraction, args: string[]) => {
		const battleInteraction = BattleInteraction.get(args[0]);
		if (!battleInteraction) return;
		await interaction.deferUpdate();
		await battleInteraction.receiveAction(interaction, <battleAction>args[1], args.slice(2));
	}
}
