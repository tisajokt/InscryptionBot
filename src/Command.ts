import { ChatInputApplicationCommandData, Client, BaseCommandInteraction, MessageComponentInteraction, ButtonInteraction, MessageApplicationCommandData } from "discord.js";

export interface SlashCommand extends ChatInputApplicationCommandData {
	run: (client: Client, interaction: BaseCommandInteraction) => Promise<void>;
	menu?: (client: Client, interaction: MessageComponentInteraction, args?: string[]) => Promise<void>;
	button?: (client: Client, interaction: ButtonInteraction, args?: string[]) => Promise<void>;
}

export interface MessageCommand extends MessageApplicationCommandData {
	run: (client: Client, interaction: BaseCommandInteraction) => Promise<void>;
}
