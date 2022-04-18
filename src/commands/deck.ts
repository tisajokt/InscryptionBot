import { BaseCommandInteraction, Client } from "discord.js";
import { PersistentCommandInteraction, SlashCommand } from "src/Command";

type deckAction = "reset";

class DeckInteraction extends PersistentCommandInteraction {
	static list: Map<string, DeckInteraction> = new Map();
	storeID(): void {
		DeckInteraction.list[this.id] = this;
	}
}

export const deck: SlashCommand = {
	name: "deck",
	description: "Manage your card decks",
	run: async(client: Client, interaction: BaseCommandInteraction) => {

	}
}