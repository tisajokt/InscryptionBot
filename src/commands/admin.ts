import { Client, BaseCommandInteraction, MessageActionRow, MessageButton, ButtonInteraction } from "discord.js";
import { SlashCommand } from "../Command";

export const admin: SlashCommand = {
	name: "admin",
	description: "Admin commands",
	run: async(interaction: BaseCommandInteraction) => {
		await interaction.reply({
			ephemeral: true,
			content: `Admin!!`
		})
	},
	defaultPermission: false
}
