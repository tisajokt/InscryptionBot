
const card_models: Map<cardName, {}> = require("./data/game/cards.json");
const app_config = require("./config.json");
const game_config = require("./data/game/config.json");
const default_deck: cardName[] = ["stoat", "bullfrog", "wolf"];

const MAX_ENERGY = game_config.maxEnergy;
const BOT_TOKEN = app_config.botToken;

type cardName = string;
type cardClass = string;
type cardCost = "free"|"blood"|"bones"|"energy";
type sigil = string;
type playerIndex = 0|1;
type Totem = {class: cardClass, sigil: sigil};

async function sleep(t: number): Promise<void> {
	return await new Promise(resolve => setTimeout(resolve, t));
}

interface Drawable {
	draw(): Card;
}
class Card implements Drawable {
	name: cardName;
	stats: number[];
	sigils: Set<sigil>;
	constructor(model: Card|cardName) {
		if (typeof model == "string") {
			this.name = model;
			model = <Card>card_models[model];
		} else {
			this.name = model.name;
		}
		// stats: [power, health, cost]
		this.stats = model.stats ? [...model.stats] : [0,1,0];
		this.sigils = new Set(model.sigils ? [...model.sigils] : []);
	}
	static castCardName(card: Card|cardName): Card {
		return (typeof card == "string") ? new Card(card) : card;
	}
	static copyCard(card: Card|cardName): Card|cardName {
		return (typeof card == "string") ? card : new Card(card);
	}
	draw(): Card {
		return new Card(this);
	}
	onPlay(battle: Battle, owner: playerIndex): void {
		if (this.sigils.has("warren") && battle.isHuman(owner)) {
			const rabbit = new Card("rabbit");
			for (var sigil in this.sigils) {
				if (!card_models[this.name].sigils.has(sigil)) {
					rabbit.sigils.add(sigil);
				}
			}
			rabbit.sigils.delete("warren");
			battle.addToHand(rabbit, owner);
		}
		if (this.sigils.has("battery") && battle.isHuman(owner)) {
			const player = battle.getPlayer(owner);
			player.capacity = Math.min(MAX_ENERGY, player.capacity + 1);
			player.energy = Math.min(player.capacity, player.energy + 1);
		}
	}
	onHit(battle: Battle, attacker: Card, owner: playerIndex): void {
		battle.log.push(`Player ${owner ? 2 : 1}'s ${this.name} dies!`);
		if (this.sigils.has("beehive") && battle.isHuman(owner)) {
			const bee = new Card("bee");
			for (var sigil in this.sigils) {
				if (!card_models[this.name].sigils.has(sigil)) {
					bee.sigils.add(sigil);
				}
			}
			bee.sigils.delete("beehive");
			battle.addToHand(bee, owner);
		}
		if (this.sigils.has("spikey")) {
			attacker.stats[1]--;
		}
	}
	onDeath(battle: Battle, owner: playerIndex): void {
		battle.log.push(`Player ${owner+1}'s ${this.name} dies!`);
		const player = battle.getPlayer(owner);
		if (this.sigils.has("undying") && battle.isHuman(owner)) {
			battle.addToHand(this, owner);
		}
		var bones = 1;
		if (this.getClassProp("no_bones")) {
			bones = 0;
		} else if (this.sigils.has("four_bones")) {
			bones = 4;
		}
		if (bones > 0) {
			if (battle.isHuman(owner)) {
				player.bones += bones;
			}
			const other = (owner == 0) ? 1 : 0;
			if (battle.isHuman(other) && battle.field[other].filter(c => c?.sigils.has("scavenger")).length) {
				battle.getPlayer(other).bones += bones;
			}
		}
	}
	onKill(): void {
		if (this.sigils.has("wolverine")) {
			this.stats[0]++;
		}
	}
	onSetup(): void {
		if (this.sigils.has("fledgling")) {
			const base_model = card_models[this.name];
			const grows_into = base_model.grows_into;
			this.sigils.delete("fledgling");
			if (grows_into) {
				const grown_model = card_models[grows_into];
				this.name = grows_into;
				this.stats[0] += (grown_model.stats[0] - base_model.stats[0]);
				this.stats[1] += (grown_model.stats[1] - base_model.stats[1]);
				this.stats[2] = grown_model.stats[2];
				for (var sigil in base_model.sigils) {
					this.sigils.delete(sigil);
				}
				for (var sigil in grown_model.sigils) {
					this.sigils.add(sigil);
				}
			} else {
				if (typeof this.stats[0] == "number") {
					this.stats[0] += 1;
				}
				this.stats[1] += 2;
			}
		}
	}
	getClassProp(prop: string) {
		return card_models[this.name][prop];
	}
	get class(): cardClass {
		return card_models[this.name].class;
	}
	get cost(): cardCost {
		return card_models[this.name].cost || "free";
	}
}
class Deck implements Drawable {
	cards: (Card|cardName)[];
	constructor(cards: (Card|cardName)[] = default_deck) {
		this.cards = cards.map(c => Card.copyCard(c));
	}
	draw(): Card {
		if (this.cards.length > 0) {
			return Card.castCardName((this.cards.splice(Math.floor(Math.random() * this.cards.length), 1))[0]);
		} else {
			return null;
		}
	}
	pick(): Card {
		if (this.cards.length > 0) {
			return Card.castCardName(this.cards[(Math.floor(Math.random() * this.cards.length))]);
		} else {
			return null;
		}
	}
}

abstract class Battle {
	scale: number;
	goal: number;
	turn: number;
	candles: number[];
	fieldSize: number;
	field: Card[][];
	log: string[];
	ended: boolean = false;
	players: Battler[];
	constructor({candles=1, goal=5, scale=0, fieldSize=4}={}) {
		this.scale = scale;
		this.goal = goal;
		this.turn = 0;
		this.candles = [candles, candles];
		this.fieldSize = fieldSize;
		this.field = [Array(fieldSize).fill(null), Array(fieldSize).fill(null)];
		this.log = [];
	}
	get actor(): playerIndex {
		return <playerIndex>(this.turn % 2);
	}
	flushLog(): string {
		const log = this.log.join("\n");
		this.log = [];
		return log;
	}
	damage(amount: number): boolean {
		this.scale += amount * (this.actor ? 1 : -1);
		if (Math.abs(this.scale) >= this.goal) {
			return this.candleOut(this.scale > 0 ? 1 : 0);
		}
		return false;
	}
	candleOut(player: playerIndex): boolean {
		this.candles[player]--;
		this.scale = 0;
		return this.candles[player] == 0;
	}
	setupTurn(): void {
		const actor = this.actor;
		this.log.push(`Player ${actor+1} starts their turn.`);
		for (var i = 0; i < this.fieldSize; i++) {
			const card = this.field[actor][i];
			card?.onSetup();
		}
		this.players[actor].setupTurn(this.field[actor]);
	}
	attack(i: number, j: number): number {
		if (j < 0 || j >= this.fieldSize) return 0;
		const actor = this.actor;
		const other = (this.actor ? 0 : 1);
		var damage = 0;
	
		const card = this.field[actor][i];
		if (!card) return 0;
		const otherCard = this.field[other][j];
	
		var power: number = card.stats[0];
		const powerCalc: string = card.getClassProp("power_calc");
		switch (powerCalc) {
			case "ant":
				power = this.field[actor].filter(c => (c?.getClassProp("power_calc") == "ant")).length;
				break;
			case "mirror":
				power = otherCard ? otherCard.stats[0] : 0;
				break;
			case "bell":
				power = 4 - i;
				break;
			case "hand":
				power = this.getPlayer(actor).hand.length;
				break;
			case "bones":
				power = Math.floor(this.getPlayer(actor).bones / 2);
				break;
			case "sacrifices":
				power = this.getPlayer(actor).sacrifices;
				break;
		}
		if (this.field[actor][i-1]?.sigils.has("leader")) power++;
		if (this.field[actor][i+1]?.sigils.has("leader")) power++;
	
		if (otherCard?.sigils.has("stinky")) power--;
		if (power <= 0) return 0;
	
		if (otherCard && !otherCard.sigils.has("waterborne") &&
			(!card.sigils.has("flying") || otherCard.sigils.has("leaping"))) {
			otherCard.stats[1] -= power;
			otherCard.onHit(this, card, other);
			if (otherCard.stats[1] <= 0 || card.sigils.has("death_touch")) {
				if (card.sigils.has("piercing")) {
					damage = Math.max(0, -otherCard.stats[1]);
				}
				card.onKill();
				otherCard.onDeath(this, other);
				this.field[other][j] = null;
			}
		} else {
			damage = power;
		}
		if (card.sigils.has("fragile") || card.stats[1] <= 0) {
			card.onDeath(this, actor);
			this.field[actor][j] = null;
		}
		if (damage) {
			this.log.push(`${card.name} deals ${damage} damage!`);
		}
		return damage;
	}
	playCard(card: Card, i: number): boolean {
		const actor = this.actor;
		if (this.field[actor][i]) return false;
		this.log.push(`Player ${actor+1} plays ${card.name}!`);
		this.field[actor][i] = card;
		card.onPlay(this, actor);
	}
	executeTurn(): boolean {
		const actor = this.actor;
		var damage = 0;
		
		for (var i = 0; i < this.fieldSize; i++) {
			const card = this.field[actor][i];
			if (!card) continue;
			this.log.push(`Player ${actor+1}'s ${card.name} attacks!`);
			if (card.sigils.has("trifurcated")) {
				damage += this.attack(i, i-1) + this.attack(i, i) + this.attack(i, i+1);
			} else if (card.sigils.has("bifurcated")) {
				damage += this.attack(i, i-1) + this.attack(i, i+1);
			} else {
				damage += this.attack(i, i);
			}
			if (card.sigils.has("double_strike")) {
				damage += this.attack(i, i);
			}
		}
	
		if (this.damage(damage)) {
			this.ended = true;
			return true;
		} else {
			this.turn++;
			return false;
		}
	}
	addToHand(card: Card, player: playerIndex): void {
		this.getPlayer(player).hand.push(card);
	}
	async awaitCompletion(): Promise<playerIndex> {
		while (!this.ended) {
			this.setupTurn();
			while (await this.players[this.actor].performAction(this));
			this.executeTurn();
			console.log(this.flushLog());
		}
		return this.actor;
	}
	abstract getPlayer(player: playerIndex): PlayerBattler;
	abstract isHuman(player: playerIndex): boolean;
}
class AutoBattle extends Battle {
	player: PlayerBattler;
	constructor(player: Player, ai: AIBattler, options={}) {
		super(options);
		this.player = player.battlerInstance(this, 0);
		this.players = [this.player, ai];
		this.log.push(`Started AI battle!`);
	}
	getPlayer(): PlayerBattler {
		return this.player;
	}
	isHuman(player: playerIndex): boolean {
		return (player == 0);
	}
}
class DuelBattle extends Battle {
	players: PlayerBattler[];
	constructor(player1: Player, player2: Player, options={}) {
		super(options);
		this.players = [player1.battlerInstance(this, 0), player2.battlerInstance(this, 1)];
		this.log.push(`Started duel battle!`);
	}
	getPlayer(player: playerIndex): PlayerBattler {
		return this.players[player];
	}
	isHuman(player: playerIndex): boolean {
		return true;
	}
}

interface Battler {
	performAction(battle: Battle): Promise<boolean>;
	setupTurn(field: Card[]): void;
}
class PlayerBattler implements Battler {
	battle: Battle;
	index: playerIndex;

	deck: Deck;
	sidedeck: Drawable;
	hand: Card[];
	totem: Totem;

	sacrifices: number = 0;
	bones: number = 0;
	energy: number = 1;
	capacity: number = 1;
	drawn: boolean = true;

	constructor(battle: Battle, index: playerIndex, deck: Deck, sidedeck: Drawable, hand: Card[], totem: Totem) {
		this.battle = battle;
		this.index = index;
		this.deck = deck;
		this.sidedeck = sidedeck;
		this.hand = hand;
		this.totem = totem;
	}
	setupTurn(field: Card[]): void {
		this.drawn = false;
		this.sacrifices = 0;
		this.capacity = Math.min(MAX_ENERGY, this.capacity + 1);
		this.energy = this.capacity;
		for (var card of field) {
			if (card?.sigils.has("digger")) {
				this.bones++;
			}
		}
	}
	drawFrom(src: Drawable, force: boolean=false, count: number=1): number {
		if (!force && this.drawn) return 0;
		var cardsDrawn = 0;
		while (count > 0) {
			const card = src.draw();
			if (!card) break;
			if (this.totem && card.class == this.totem.class) {
				card.sigils.add(this.totem.sigil);
			}
			this.hand.push(card);
			cardsDrawn++;
			count--;
		}
		this.drawn = true;
		return cardsDrawn;
	}
	useHammer(field: Card[], i: number): void {
		if (this.drawn || !field[i]) return;
		this.drawn = true;
		field[i].onDeath(this.battle, this.index);
		field[i] = null;
	}
	async performAction(battle: Battle): Promise<boolean> {
		await sleep(2000);
		return false;
	}
}
class AIBattler implements Battler {
	constructor() {
		
	}
	setupTurn(field: Card[]): void {
		
	}
	async performAction(battle: Battle): Promise<boolean> {
		battle.playCard(new Card("bullfrog"), Math.floor(Math.random() * battle.fieldSize));
		return false;
	}
}

class Player {
	deck: Deck;
	sidedeck: Drawable;
	totem: Totem;
	boonBones: number = 0;
	constructor() {
		this.deck = new Deck();
		this.sidedeck = new Card("squirrel");
	}
	battlerInstance(battle: Battle, index: playerIndex): PlayerBattler {
		var player = new PlayerBattler(battle, index, new Deck(this.deck.cards), this.sidedeck, [], this.totem);
		player.drawFrom(player.sidedeck, true);
		player.drawFrom(player.deck, true, 4);
		player.bones += this.boonBones;
		return player;
	}
}

async function testBattle(): Promise<void> {
	console.log("Testing battle...");
	var player = new Player();
	var ai = new AIBattler();
	var battle = new AutoBattle(player, ai);
	var superStoat: Card = new Card("stoat");
	superStoat.sigils.add("bifurcated");
	console.log(superStoat);
	battle.playCard(superStoat, 1);
	await battle.awaitCompletion();
	console.log("Battle over!");
}
testBattle();
