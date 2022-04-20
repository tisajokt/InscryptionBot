import { ButtonInteraction, CacheType, Client, CommandInteraction, MessageActionRow, MessageButton, MessageComponentInteraction, SelectMenuInteraction } from "discord.js";
import { PersistentCommandInteraction, SlashCommand } from "src/Command";
import { AppUser } from "src/AppUser";

type deckAction = "reset"|"create"|"edit"|"view";

class DeckInteraction extends PersistentCommandInteraction {
	static list: Map<string, DeckInteraction> = new Map();
	user: AppUser;
	constructor(interaction: CommandInteraction) {
		super(interaction);
		this.user = AppUser.get(this.userID);
	}
	storeID(): void {
		DeckInteraction.list[this.id] = this;
	}
	cmd(): string {
		return "deck";
	}
	static get(id: string): DeckInteraction {
		return this.list[id];
	}
	async viewCard(interaction: MessageComponentInteraction, args: string[]): Promise<void> {
		if (args.length != 2) return;
		const deckNum = parseInt(args[0]);
		const cardNum = parseInt(args[0]);
	}
	async viewDeck(interaction: MessageComponentInteraction, args: string[]): Promise<void> {
		if (args.length < 1) return;
		const deckNum = parseInt(args[0]);
		const mode = args[1];
		const actions = new MessageActionRow().addComponents(
			this.makeButton("view")
		);
		await interaction.editReply({
			components: [actions]
		})
	}
	async receiveButton(interaction: ButtonInteraction, action: deckAction, args: string[]=[]): Promise<void> {

	}
	async receiveMenu(interaction: SelectMenuInteraction, action: deckAction, args: string[]=[]): Promise<void> {
		
	}
	async reply(): Promise<void> {
		await this.interaction.editReply({
			embeds: [],
			components: []
		});
	}
	isAllowedAction(userID: string, action: string): boolean {
		return true;
	}
	async receiveComponent(i: MessageComponentInteraction<CacheType>, action: string, args: string[]): Promise<void> {
		
	}
	async tokenExpired(): Promise<void> {
		
	}
}

export const deck: SlashCommand = {
	name: "deck",
	description: "Manage your card decks for duels & sandbox battles",
	run: async(interaction: CommandInteraction) => {
		await interaction.deferReply();
		await (new DeckInteraction(interaction)).reply();
	},
	button: async(interaction: ButtonInteraction, args: string[]) => {
		DeckInteraction.get(args[0])?.receiveButton(interaction, <deckAction>args[1], args);
	},
	menu: async(interaction: SelectMenuInteraction, args: string[]) => {
		DeckInteraction.get(args[0])?.receiveMenu(interaction, <deckAction>args[1]);
	}
}