import { Client, BaseCommandInteraction, MessageActionRow, MessageButton, ButtonInteraction } from "discord.js";
import { Command } from "../Command";

export const admin: Command = {
	name: "admin",
	description: "Admin commands",
	run: async(client: Client, interaction: BaseCommandInteraction) => {
		await interaction.reply({
			ephemeral: true,
			content: `Admin`
		})
	},
	defaultPermission: false
}
