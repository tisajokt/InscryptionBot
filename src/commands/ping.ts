import { Client, BaseCommandInteraction, MessageActionRow, MessageButton, ButtonInteraction } from "discord.js";
import { SlashCommand } from "../Command";

export const ping: SlashCommand = {
	name: "ping",
	description: "Pings the bot",
	run: async(interaction: BaseCommandInteraction) => {
		const delay = Date.now() - interaction.createdTimestamp;
		await interaction.reply({
			content: `Pong! (delay: ${delay}ms)`,
			ephemeral: true
		})
	}
}
