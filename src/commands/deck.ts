import { ButtonInteraction, CommandInteraction, MessageActionRow, MessageComponentInteraction, SelectMenuInteraction } from "discord.js";
import { DLM, MAX_OPTIONS, PersistentCommandInteraction, SlashCommand } from "../Command";
import { AppUser } from "../AppUser";
import { numberEmoji, sidedeckEmoji, toProperFormat } from "../util";
import { amorphousSigils, Card, cardName, Deck, getModel, MAX_NONRARE_DUPLICATES, MAX_RARE_DUPLICATES, MAX_TOTAL_RARES, modelSummary, Player, playerDeckCards, sidedecks } from "../Game";

type deckAction = "main"|"deck"|"card"|"special";
export function cardNameCount(cards: cardName[]): Map<cardName, number> {
	const map = new Map();
	cards.forEach((card) => {
		map.set(card, (map.get(card) ?? 0) + 1);
	});
	return map;
}

const cardNameSort = (a: cardName, b: cardName): number => {
	return getModel(a).sortIndex - getModel(b).sortIndex;
};
const sortedCards = playerDeckCards.sort(cardNameSort);

class DeckInteraction extends PersistentCommandInteraction {
	static list: Map<string, DeckInteraction> = new Map();
	user: AppUser;
	player: Player;
	page: number=0;
	lastMenu: "view"|"cards"|"sigils"="view";
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
	getCardOptions(): any[] {
		return this.getPagedOptions(sortedCards).map((name) => {
			return {
				label: `${getModel(name).rare?"✨ ":""}${modelSummary(name)} (${getModel(name).playerValue})`,
				value: `name${DLM}${name}`,
				_placeholder: toProperFormat(name)
			}
		});
	}
	getDeckOptions(deck: Deck): any[] {
		deck.beforeSerialization();
		const unmodifiedCards: Map<cardName, number> = cardNameCount(deck._cardNames);
		const modifiedCards: Card[] = deck._cardObjects;
		return this.getPagedOptions(modifiedCards.map((card) => {
			return {
				label: `${card.fullSummary()} (modified)`,
				value: `special${DLM}${deck.cards.indexOf(card)}`
			}
		}).concat([...unmodifiedCards.entries()].sort((a,b)=>cardNameSort(a[0],b[0])).map(([name, count]) => {
			return {
				label: `${count > 1 ? `x${count} ` : ""}${getModel(name).rare?"✨ ":""}${modelSummary(name)}`,
				value: `name${DLM}${name}`
			}
		})));
	}
	getSigilOptions(): any[] {
		return this.getPagedOptions(amorphousSigils).map((sigil) => {
			return {
				label: toProperFormat(sigil),
				value: sigil
			}
		});
	}
	getPagedOptions(options: any[]): any[] {
		const lastPage = Math.ceil(options.length / MAX_OPTIONS);
		this.page = this.page < 0 ? lastPage-1 : (this.page ?? 0) % lastPage;
		return options.slice(this.page * MAX_OPTIONS, (this.page+1) * MAX_OPTIONS);
	}
	async specialAction(args: string[]=[]): Promise<void> {
		// .special.totem
		// .special.totem.[tribe].[sigil]
		// .special.item
		// .special.item.[add|remove].[item]
		// .special.custom
		switch (args[0] ?? "menu") {
			case "menu":
				await this.interaction.editReply({
					embeds: [this.player.getEmbedDisplay()],
					components: [new MessageActionRow().addComponents(
						this.makeButton("deck").setEmoji("👈"),
						this.makeButton("special", ["totem"]).setEmoji("🗿"),
						this.makeButton("special", ["item"]).setEmoji("⌛"),
						this.makeButton("special", ["custom"]).setEmoji("🖨️")
					)]
				});
				break;
			case "totem":
				const tribe = args[1];
				if (!tribe) {
					await this.interaction.editReply({
						embeds: [this.player.getEmbedDisplay()],
						components: [new MessageActionRow().addComponents(
							this.makeButton("special", ["totem", "canine"]).setEmoji("🐺"),
							this.makeButton("special", ["totem", "hooved"]).setEmoji("🦌"),
							this.makeButton("special", ["totem", "insect"]).setEmoji("🐞"),
							this.makeButton("special", ["totem", "reptile"]).setEmoji("🐸"),
							this.makeButton("special", ["totem", "avian"]).setEmoji("🦉")
						)]
					})
					break;
				}
				break;
			case "item":
				break;
		}
	}
	async cardAction(args: string[]=[]): Promise<void> {
		if (args.length < 2 || args.length > 3 || !this.player) return;
		const deck = this.player.deck;
		const arg: string = args.pop();
		const count = args[0] === "name" ? deck._cardNames.filter(c => (c === arg)).length : 0;
		const rares = deck.cards.filter(c => {
			if (typeof c === "string") {
				return getModel(c).rare;
			} else {
				return c.rare;
			}
		}).length;
		switch (args.join(".")) {
			// .card.special.[card index]
			case "special":
				const card = <Card>deck.cards[arg];
				await this.interaction.editReply({
					embeds: [{
						title: `${toProperFormat(card.name)} (modified)`,
						fields: [card.getEmbedDisplay()]
					}],
					components: [new MessageActionRow().addComponents(
						this.makeButton("deck", [this.lastMenu]).setEmoji("👈"),
						this.makeButton("card", ["special", "remove", arg]).setEmoji("🗑️")
					)]
				});
				break;
			// .card.special.remove.[card index]
			case "special.remove":
				deck.cards.splice(parseInt(arg), 1);
				AppUser.saveUsersData();
				await this.deckAction(["cards"]);
				break;
			// .card.name.[card name]
			case "name":
				await this.interaction.editReply({
					embeds: [{
						title: `x${count} ${toProperFormat(arg)}`,
						fields: [(new Card(arg)).getEmbedDisplay()]
					}],
					components: [new MessageActionRow().addComponents(
						this.makeButton("deck", [this.lastMenu]).setEmoji("👈"),
						this.makeButton("card", ["name", "remove", arg]).setEmoji("⬇️"),
						this.makeButton("card", ["name", "add", arg]).setEmoji("⬆️")
					)]
				});
				break;
			// .card.name.add.[card name]
			case "name.add":
				const model = getModel(arg);
				if (count < (model.rare ? MAX_RARE_DUPLICATES : MAX_NONRARE_DUPLICATES) && (!model.rare || rares < MAX_TOTAL_RARES)) {
					deck.cards.push(arg);
					deck._cardNames.push(arg);
					AppUser.saveUsersData();
					await this.cardAction(["name", arg]);
				}
				break;
			// .card.name.remove.[card name]
			case "name.remove":
				if (count > 0) {
					deck.cards.splice(deck.cards.indexOf(arg), 1);
					deck._cardNames.splice(deck._cardNames.indexOf(arg), 1);
					AppUser.saveUsersData();
					if (count === 1) {
						await this.deckAction([this.lastMenu]);
					} else {
						await this.cardAction(["name", arg]);
					}
				}
				break;
		}
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
					this.player = this.user.createPlayer("squirrel", ["stoat", "bullfrog", "wolf", "stinkbug"]);
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
		switch (args.join(".") || "overview") {
			// .deck
			case "overview":
				const actions = new MessageActionRow().addComponents(
					this.makeButton("main").setEmoji("👈"),
					this.makeButton("deck", ["sidedeck"]).setEmoji(sidedeckEmoji[this.player.sidedeck] || sidedeckEmoji.squirrel),
					this.makeButton("deck", ["view"]).setEmoji("🗃️"),
					this.makeButton("special").setEmoji("✨"),
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
			case "view.next":
				this.page++;
			// .deck.view
			case "view":
				if (this.lastMenu !== "view") {
					this.lastMenu = "view";
					this.page = 0;
				}
				const components = [
					this.makeButton("deck").setEmoji("👈"),
					this.makeButton("deck", ["cards"]).setEmoji("🆕"),
					this.makeButton("deck", ["view", "next"]).setEmoji("▶️")
				];
				const deckCardsMenu = new MessageActionRow().addComponents(components);
				await this.interaction.editReply({
					embeds: [this.player.getEmbedDisplay()],
					components: this.player.deck.cards.length ? [
						new MessageActionRow().addComponents(
							this.makeSelectMenu("card", this.getDeckOptions(this.player.deck)).setPlaceholder("Select a card from your deck")
						),
						deckCardsMenu
					] : [deckCardsMenu]
				});
				break;
			// .deck.cards.prev
			case "cards.prev":
				this.page -= 2;
			// .deck.cards.next
			case "cards.next":
				this.page++;
			// .deck.cards.add
			case "cards":
				if (this.lastMenu !== "cards") {
					this.lastMenu = "cards";
					this.page = 0;
				}
				const options = this.getCardOptions();
				await this.interaction.editReply({
					embeds: [this.player.getEmbedDisplay()],
					components: [
						new MessageActionRow().addComponents(
							this.makeSelectMenu("card", options).setPlaceholder(
								`Add ${options[0]._placeholder}, ${options[1]?._placeholder}...`
							)
						),
						new MessageActionRow().addComponents(
							this.makeButton("deck", ["view"]).setEmoji("👈"),
							this.makeButton("deck", ["cards", "prev"]).setEmoji("◀️"),
							this.makeButton("deck", ["cards", "next"]).setEmoji("▶️")
						)
					]
				})
				break;
			// .deck.delete
			case "delete":
				await this.interaction.followUp({
					content: `Are you sure you want to delete deck #${idx+1}, "${this.player.name ?? "Unnamed Deck"}"?`,
					ephemeral: true,
					components: [
						new MessageActionRow().addComponents(this.makeButton("deck", ["delete", "yes"]).setLabel("Delete").setEmoji("🗑️").setStyle("DANGER"))
					]
				})
				break;
			// .deck.delete.yes
			case "delete.yes":
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
		switch (<deckAction>action) {
			case "main": await this.mainAction(args); break;
			case "card": await this.cardAction(args); break;
			case "deck": await this.deckAction(args); break;
			case "special": await this.specialAction(args); break;
		}
	}
	async tokenExpired(): Promise<void> {}
}

export const deck: SlashCommand = {
	name: "deck",
	description: "Custom deck commands",
	options: [
		{
			name: "select",
			description: "Choose which deck to use for battles",
			type: 1,
			options: [
				{
					name: "deck",
					description: "Deck index (1-5 to select, 0 to clear selection)",
					type: 4,
					min_value: 0,
					max_value: 5,
					required: true
				}
			]
		},
		{
			name: "rename",
			description: "Rename one of your card decks",
			type: 1,
			options: [
				{
					name: "name",
					description: "Name to give your deck",
					type: 3,
					required: true
				},
				{
					name: "deck",
					description: "Deck index (uses active deck by default)",
					type: 4,
					min_value: 1,
					max_value: 5
				}
			]
		},
		{
			name: "manage",
			description: "Manage your card decks for duels & sandbox battles",
			type: 1
		}
	],
	run: async(interaction: CommandInteraction) => {
		const user = AppUser.get(interaction.user.id);
		switch (interaction.options.getSubcommand()) {
			case "select":
				const active = interaction.options.getInteger("deck", true);
				if (active > 0 && active <= user.players.length) {
					user.activePlayer = active - 1;
				} else {
					delete user.activePlayer;
				}
				await interaction.reply({
					content: !!user.getActivePlayer() ? `Selected deck #${active}, "${user.getActivePlayer().name ?? "Unnamed Deck"}"` : "Unselected all decks",
					ephemeral: true
				})
				break;
			case "rename":
				const idx = interaction.options.getInteger("deck") ?? user.activePlayer+1;
				const player = user.players[idx-1];
				if (player) {
					player.name = interaction.options.getString("name", true);
					await interaction.reply({
						content: `Renamed deck #${idx} to "${player.name}"!`,
						ephemeral: true
					});
				}
				break;
			case "manage":
				await interaction.deferReply();
				await DeckInteraction.create(interaction);
				break;
		}
	},
	button: async(interaction: ButtonInteraction, args: string[]) => {
		await DeckInteraction.get(args[0])?.receiveButton(interaction, <deckAction>args[1], args);
	},
	menu: async(interaction: SelectMenuInteraction, args: string[]) => {
		await DeckInteraction.get(args[0])?.receiveMenu(interaction, <deckAction>args[1]);
	}
}