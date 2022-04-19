import { ChatInputApplicationCommandData, Client, BaseCommandInteraction, MessageComponentInteraction, ButtonInteraction, MessageApplicationCommandData, CommandInteraction, TextBasedChannel, MessageButton, MessageSelectMenu, MessageSelectOptionData } from "discord.js";
import { generateRandomID } from "./util";

export interface SlashCommand extends ChatInputApplicationCommandData {
	run: (client: Client, interaction: CommandInteraction) => Promise<void>;
	menu?: (client: Client, interaction: MessageComponentInteraction, args?: string[]) => Promise<void>;
	button?: (client: Client, interaction: ButtonInteraction, args?: string[]) => Promise<void>;
}

export interface MessageCommand extends MessageApplicationCommandData {
	run: (client: Client, interaction: BaseCommandInteraction) => Promise<void>;
}

export abstract class PersistentCommandInteraction {
	id: string;
	interaction: CommandInteraction;
	userID: string;
	constructor(interaction: CommandInteraction) {
		this.id = generateRandomID(8);
		this.interaction = interaction;
		this.userID = interaction.user.id;
		this.storeID();
	}
	abstract storeID(): void;
	abstract cmd(): string;
	get textChannel(): Promise<TextBasedChannel> {
		const interaction = this.interaction;
		return new Promise((resolve, reject) => {
			interaction.client.channels.fetch(interaction.channelId).then((channel) => {
				if (channel.isText()) resolve(channel);
				else reject();
			}).catch(reject);
		})
	}
	makeButton(action: string, args: string[]=[]): MessageButton {
		return new MessageButton().setCustomId(`${this.cmd()}.${this.id}.${action}${args.length ? `.${args.join(".")}` : ""}`).setStyle("SECONDARY");
	}
	makeSelectMenu(action: string, options): MessageSelectMenu {
		return new MessageSelectMenu().setCustomId(`${this.cmd()}.${this.id}.${action}`).setOptions(options);
	}
	async internalError(): Promise<void> {
		await (await this.textChannel)?.send(`Internal application error! Please report to a developer.`);
	}
}
