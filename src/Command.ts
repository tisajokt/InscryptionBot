import { ChatInputApplicationCommandData, Client, BaseCommandInteraction, MessageComponentInteraction, ButtonInteraction } from "discord.js";

export interface Command extends ChatInputApplicationCommandData {
	run: (client: Client, interaction: BaseCommandInteraction) => Promise<void>;
	menu?: (client: Client, interaction: MessageComponentInteraction, id?: string) => Promise<void>;
	button?: (client: Client, interaction: ButtonInteraction, id?: string) => Promise<void>;
}