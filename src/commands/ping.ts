import { Client, BaseCommandInteraction, MessageActionRow, MessageButton, ButtonInteraction } from "discord.js";
import { SlashCommand } from "../Command";

export const ping: SlashCommand = {
	name: "ping",
	description: "Pings the bot",
	run: async(client: Client, interaction: BaseCommandInteraction) => {
		const actions = new MessageActionRow()
			.addComponents(
				new MessageButton().setCustomId("ping.hello").setLabel("Hello!").setStyle("SUCCESS"),
				new MessageButton().setCustomId("ping.goodbye").setLabel("Goodbye!").setStyle("DANGER")
			);
		const delay = Date.now() - interaction.createdTimestamp;
		await interaction.reply({
			ephemeral: true,
			//components: [actions],
			content: `Pong! (delay: ${delay}ms)`
		})
	},
	button: async(client: Client, interaction: ButtonInteraction, args: string[]) => {
		switch (args[0]) {
			case "hello":
				interaction.update({
					content: "Hello!!! :D",
					components: []
				})
				break;
			case "goodbye":
				interaction.update({
					content: "Awe, goodbye :c",
					components: []
				})
				break;
		}
	}
}
