import { Client, BaseCommandInteraction, MessageActionRow, MessageButton, ButtonInteraction } from "discord.js";
import { SlashCommand } from "../Command";
import { SoloBattle, DuelBattle, Battle, Player, terrains } from "../Game";
import { User } from "../User";
import { pickRandom } from "../util";

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
	run: async(client: Client, interaction: BaseCommandInteraction) => {
		const actions = new MessageActionRow().addComponents(
			new MessageButton().setCustomId("battle.exit").setLabel("Exit").setStyle("SECONDARY"),
			new MessageButton().setCustomId("battle.new").setLabel("New").setStyle("PRIMARY").setDisabled()
		);
		
		const player1 = new Player();
		let terrain = interaction.options.get("terrain")?.value;
		if (!terrain || terrain == "random") terrain = pickRandom(terrains);
		else if (terrain == "none") terrain = "";
		const battleOptions = {
			candles: interaction.options.get("candles")?.value || 3,
			fieldSize: interaction.options.get("big_field")?.value ? 5 : 4,
			goal: interaction.options.get("goal")?.value || 5,
			scale: interaction.options.get("scale")?.value || 0,
			terrain: terrain
		};
		const battle: Battle = interaction.options.get("type")?.value == "solo" ? new SoloBattle(player1, battleOptions) : new DuelBattle(player1, new Player(), battleOptions);

		await interaction.reply({
			content: `\`\`\`${battle.display}\`\`\``
		});
		await battle.awaitCompletion(async(display) => {
			await interaction.editReply({
				content: `\`\`\`${display}\`\`\``
			})
		})
	},
	button: async(client: Client, interaction: ButtonInteraction, id: string) => {
		
	}
}
