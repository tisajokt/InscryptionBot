import { ChatInputApplicationCommandData, BaseCommandInteraction, MessageComponentInteraction, ButtonInteraction, MessageApplicationCommandData, CommandInteraction, TextBasedChannel, MessageButton, MessageSelectMenu, SelectMenuInteraction, DiscordAPIError } from "discord.js";
import { generateRandomID } from "./util";

export const DLM = ":"; // delimiter
export const MAX_OPTIONS = 25;
export interface SlashCommand extends ChatInputApplicationCommandData {
	run: (interaction: CommandInteraction) => Promise<void>;
	menu?: (interaction: MessageComponentInteraction, args?: string[]) => Promise<void>;
	button?: (interaction: ButtonInteraction, args?: string[]) => Promise<void>;
}

export interface MessageCommand extends MessageApplicationCommandData {
	run: (interaction: BaseCommandInteraction) => Promise<void>;
}

export type componentAction = (i: MessageComponentInteraction, args: string[])=>Promise<void>;
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
		return new MessageButton().setCustomId(`${this.cmd()}${DLM}${this.id}${DLM}${action}${args.length ? `${DLM}${args.join(DLM)}` : ""}`).setStyle("SECONDARY");
	}
	makeSelectMenu(action: string, options: any[]): MessageSelectMenu {
		// Discord API limitation: max 25 options
		return new MessageSelectMenu().setCustomId(`${this.cmd()}${DLM}${this.id}${DLM}${action}`).setOptions(options.slice(0, MAX_OPTIONS));
	}
	abstract isAllowedAction(userID: string, action: string): boolean;
	abstract receiveComponent(i: MessageComponentInteraction, action: string, args: string[]): Promise<void>;
	async _receiveComponent(interaction: MessageComponentInteraction, action: string, args: string[]): Promise<void> {
		if (!this?.isAllowedAction(interaction.user.id, action)) return;
		try {
			await interaction.deferUpdate();
			await this.receiveComponent(interaction, action, args);
		} catch (e) {
			console.error("Caught an error!");
			if (e instanceof DiscordAPIError) {
				await this.tokenExpired();
			} else {
				await this.internalError();
				throw e;
			}
		}
	}
	async receiveMenu(interaction: SelectMenuInteraction, action: string): Promise<void> {
		await this._receiveComponent(interaction, action, (interaction.values[0]||"").split(DLM).filter(s=>s));
	}
	async receiveButton(interaction: ButtonInteraction, action: string, args: string[]): Promise<void> {
		await this._receiveComponent(interaction, action, args.slice(2));
	}
	async editReply(interaction: MessageComponentInteraction, content): Promise<void> {
		await interaction.editReply(content);
	}
	abstract tokenExpired(): Promise<void>;
	async internalError(): Promise<void> {
		await (await this.textChannel)?.send(`Internal application error! Please report to a developer.`);
	}
}
