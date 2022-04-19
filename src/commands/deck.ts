import { ButtonInteraction, Client, CommandInteraction, MessageActionRow, MessageButton, MessageComponentInteraction, SelectMenuInteraction } from "discord.js";
import { PersistentCommandInteraction, SlashCommand } from "src/Command";
import { AppUser } from "src/User";

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
}

export const deck: SlashCommand = {
	name: "deck",
	description: "Manage your card decks for duels & sandbox battles",
	run: async(client: Client, interaction: CommandInteraction) => {
		await interaction.deferReply();
		await (new DeckInteraction(interaction)).reply();
	}
}