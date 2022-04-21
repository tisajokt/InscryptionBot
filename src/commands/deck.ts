import { ButtonInteraction, CommandInteraction, MessageActionRow, MessageComponentInteraction, SelectMenuInteraction } from "discord.js";
import { PersistentCommandInteraction, SlashCommand } from "../Command";
import { AppUser } from "../AppUser";
import { numberEmoji, sidedeckEmoji } from "../util";
import { Card, cardName, Deck, modelSummary, Player, sidedecks } from "../Game";
import { Embed } from "../Display";

type deckAction = "main"|"deck";
export function cardNameCount(cards: cardName[]): Map<cardName, number> {
	const map = new Map();
	cards.forEach((card) => {
		map.set(card, (map.get(card) ?? 0) + 1);
	});
	return map;
}

class DeckInteraction extends PersistentCommandInteraction {
	static list: Map<string, DeckInteraction> = new Map();
	user: AppUser;
	player: Player;
	constructor(interaction: CommandInteraction) {
		super(interaction);
		this.user = AppUser.get(this.userID);
	}
	static async create(interaction: CommandInteraction): Promise<DeckInteraction> {
		const deckInteraction = new DeckInteraction(interaction);
		await deckInteraction.mainAction();
		return deckInteraction;
	}
	storeID(): void {
		DeckInteraction.list[this.id] = this;
	}
	cmd(): string {
		return "deck";
	}
	getDeckOptions(action: deckAction, deck: Deck): any[] {
		deck.beforeSerialization();
		const unmodifiedCards: Map<cardName, number> = cardNameCount(deck._cardNames);
		const modifiedCards: Card[] = deck._cardObjects;
		return modifiedCards.map((card) => {
			return {
				label: `${card.fullSummary()}`,
				value: `${action}.special.${deck.cards.indexOf(card)}`
			}
		}).concat([...unmodifiedCards.entries()].map(([name, count]) => {
			return {
				label: `${modelSummary(name)}${count > 1 ? ` x${count}` : ""}`,
				value: `${action}.name.${name}`
			}
		}))
	}
	getPlayerDisplay(player: Player): Embed {
		return {
			title: "",
			description: ""
		};
	}
	async mainAction(args: string[]=[]): Promise<void> {
		switch (args.length) {
			// .main, or on init
			case 0:
				await this.interaction.editReply({
					embeds: [{
						title: "🃏 Decks",
						description: "View, edit, and create your custom decks"
					}],
					components: [this.makeDeckButtons("main", true)]
				});
				break;
			// .main.create
			case 1:
				if (args[0] == "create" && this.user.players.length < 5) {
					this.player = this.user.createPlayer();
					await this.deckAction();
				}
				break;
			// .main.select.[deck index]
			case 2:
				if (args[0] == "select" && args[1]) {
					const idx = parseInt(args[1]);
					this.player = this.user.players[idx];
					await this.deckAction();
				}
				break;
		}
	}
	async deckAction(args: string[]=[]): Promise<void> {
		if (!this.player) return;
		const idx = this.user.players.indexOf(this.player);
		switch (args[0] ?? "overview") {
			// .deck
			case "overview":
				const actions = new MessageActionRow().addComponents(
					this.makeButton("main", []).setEmoji("👈"),
					this.makeButton("deck", ["sidedeck"]).setEmoji(sidedeckEmoji[this.player.sidedeck] || sidedeckEmoji.squirrel),
					this.makeButton("deck", ["cards"]).setEmoji("🗃️"),
					this.makeButton("deck", ["special"]).setEmoji("✨"),
					this.makeButton("deck", ["delete"]).setEmoji("🗑️").setStyle("DANGER"),
				);
				await this.interaction.editReply({
					embeds: [this.player.getEmbedDisplay()],
					components: [actions]
				});
				break;
			// .deck.sidedeck
			case "sidedeck":
				this.player.sidedeck = sidedecks[(sidedecks.indexOf(this.player.sidedeck) + 1) % sidedecks.length];
				await this.deckAction();
				break;
			// .deck.delete
			case "delete":
				if (this.user.activePlayer == idx) {
					delete this.user.activePlayer;
				} else if (this.user.activePlayer > idx) {
					this.user.activePlayer--;
				}
				this.user.players.splice(idx, 1);
				delete this.player;
				await this.mainAction();
				break;
		}
	}
	makeDeckButtons(action: deckAction, showCreateButton?: boolean): MessageActionRow {
		const row = new MessageActionRow();
		const user = this.user;
		this.user.players.slice(0,5).forEach((player, i) => {
			row.addComponents(
				this.makeButton(action, ["select", `${i}`]).setStyle("SECONDARY").setEmoji(user.activePlayer === i ? "✅" : numberEmoji[i+1])
			);
		});
		if (this.user.players.length < 5 && showCreateButton) {
			row.addComponents(this.makeButton(action, ["create"]).setStyle("PRIMARY").setEmoji("🆕"));
		}
		return row;
	}
	static get(id: string): DeckInteraction {
		return this.list[id];
	}
	isAllowedAction(userID: string, action: string): boolean {
		switch (action) {
			default:
				return userID == this.userID;
		}
	}
	async receiveComponent(i: MessageComponentInteraction, action: string, args: string[]): Promise<void> {
		switch (action) {
			case "main": this.mainAction(args); break;
			case "deck": this.deckAction(args); break;
		}
	}
	async tokenExpired(): Promise<void> {}
}

export const deck: SlashCommand = {
	name: "deck",
	description: "Manage your card decks for duels & sandbox battles",
	run: async(interaction: CommandInteraction) => {
		await interaction.deferReply();
		await DeckInteraction.create(interaction);
	},
	button: async(interaction: ButtonInteraction, args: string[]) => {
		await DeckInteraction.get(args[0])?.receiveButton(interaction, <deckAction>args[1], args);
	},
	menu: async(interaction: SelectMenuInteraction, args: string[]) => {
		await DeckInteraction.get(args[0])?.receiveMenu(interaction, <deckAction>args[1]);
	}
}