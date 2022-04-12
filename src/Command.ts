import { ChatInputApplicationCommandData, Client, BaseCommandInteraction, MessageComponentInteraction, ButtonInteraction, MessageApplicationCommandData } from "discord.js";

export interface SlashCommand extends ChatInputApplicationCommandData {
	run: (client: Client, interaction: BaseCommandInteraction) => Promise<void>;
	menu?: (client: Client, interaction: MessageComponentInteraction, id?: string) => Promise<void>;
	button?: (client: Client, interaction: ButtonInteraction, id?: string) => Promise<void>;
}

export interface MessageCommand extends MessageApplicationCommandData {
	run: (client: Client, interaction: BaseCommandInteraction) => Promise<void>;
}
