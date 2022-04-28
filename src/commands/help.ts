import { CommandInteraction, InteractionReplyOptions } from "discord.js";
import { SlashCommand } from "../Command";

const helpPages = new Map<string, InteractionReplyOptions>();

helpPages.set("credits", {
	embeds: [{
		fields: [
			{
				name: "Tisajokt",
				value: "Project creator & programmer"
			},
			{
				name: "Zak & Vidip",
				value: "Playtesting"
			},
			{
				name: "Daniel Mullins Games",
				value: "Used & distributed with permission"
			}
		]
	}]
});

helpPages.set("invite", {
	content: "https://discord.com/api/oauth2/authorize?client_id=968924687163859024&permissions=2147745792&scope=bot%20applications.commands"
});

export const help: SlashCommand = {
	name: "help",
	description: "Guide for using the bot",
	options: [
		{
			name: "page",
			description: "Which help page?",
			type: 3,
			choices: [
				{name: "Invite", value: "invite"},
				{name: "Credits", value: "credits"}
			]
		}
	],
	run: async(interaction: CommandInteraction) => {
		const page = interaction.options.getString("page") ?? "credits";
		if (helpPages.has(page)) {
			interaction.reply(helpPages[page]);
		} else {
			console.error(`Help page "${page}" not found`);
		}
	}
}
