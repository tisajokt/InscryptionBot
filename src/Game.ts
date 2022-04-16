
import sigil_data from "../data/game/sigils.json";
import card_models from "../data/game/cards.json";
import game_config from "../data/game/config.json";
import { padTrim, pickRandom, sleep, randomSelectionFrom, toProperCase, abbreviate } from "./util";
import { EmbedField, Embed } from "src/Display";
import { jsonArrayMember, jsonMember, jsonObject, jsonSetMember } from "typedjson";

const default_deck: cardName[] = [];
const default_auto: cardName[] = [];

for (let p = 0; p < sigil_data.__powers.length; p++) {
	for (let i = 0; i < sigil_data.__powers[p].length; i++) {
		sigil_data[sigil_data.__powers[p][i]] = {
			power: p-3
		}
	}
}

export const terrains: cardName[] = ["", "boulder", "stump", "grand_fir", "frozen_opossum", "moleman", "broken_bot"];
export const sidedecks: cardName[] = ["squirrel", "empty_vessel", "skeleton", "mox_crystal"];

export const MAX_ENERGY: number = game_config.maxEnergy;
export const ITEM_LIMIT: number = game_config.itemLimit;
export const FECUNDITY_NERF: boolean = game_config.fecundityNerf;

export const slow_mode = false;
export const AI_SPEED: number = slow_mode ? 500 : 0;

export type CardModel = {
	name?: string,
	abbrev?: string,
	stats?: number[],
	cost?: cardCost,
	sigils?: sigil[],
	mox?: moxColor[],
	tribe?: cardTribe,
	grows_into?: cardName,
	rare?: boolean,
	no_sacrifice?: boolean,
	no_bones?: boolean,
	is_conduit?: boolean,
	playerValue?: number,
	nonplayerValue?: number,
	modded?: boolean|string,
	event?: string
};
export type cardName = string;
export type cardTribe = "canine"|"insect"|"reptile"|"avian"|"hooved"|"squirrel"|"all";
export type cardCost = "free"|"blood"|"bones"|"energy"|"mox";
export type itemType = "squirrel"|"black_goat"|"boulder"|"frozen_opossum"|"bones"|"battery"|"armor"|"pliers"|"hourglass"|"fan"|"wiseclock"|"skinning_knife"|"lens";
export type moxColor = "blue"|"green"|"orange"|"any";
export type sigil = "rabbit_hole"|"fecundity"|"battery"|"item_bearer"|"dam_builder"|"bellist"|"beehive"|"spikey"|"swapper"|"corpse_eater"|"undying"|"steel_trap"|"four_bones"|"scavenger"|"blood_lust"|"fledgling"|"armored"|"death_touch"|"stone"|"piercing"|"leader"|"annoying"|"stinky"|"mighty_leap"|"waterborne"|"flying"|"brittle"|"sentry"|"trifurcated"|"bifurcated"|"double_strike"|"looter"|"many_lives"|"worthy_sacrifice"|"gem_animator"|"gemified"|"random_mox"|"digger"|"morsel"|"amorphous"|"blue_mox"|"green_mox"|"orange_mox"|"repulsive"|"cuckoo"|"guardian"|"sealed_away"|"sprinter"|"scholar"|"gem_dependent"|"gemnastics"|"stimulate"|"enlarge"|"energy_gun"|"haunter"|"blood_guzzler"|"disentomb"|"powered_buff"|"powered_trifurcated"|"buff_conduit"|"gems_conduit"|"factory_conduit"|"gem_guardian"|"sniper"|"transformer"|"burrower"|"vessel_printer"|"bonehorn"|"skeleton_crew"|"rampager"|"detonator"|"bomb_spewer"|"power_dice"|"gem_detonator"|"brittle_latch"|"bomb_latch"|"shield_latch"|"hefty"|"jumper"|"hydra_egg"|"loose_tail"|"hovering"|"energy_conduit"|"magic_armor"|"handy"|"double_death"|"hoarder"|"gift_bearer";
export type playerIndex = 0|1;
export type Totem = {tribe: cardTribe, sigil: sigil};

function getModel(card: cardName): CardModel {
	return card_models[card];
}

export interface Drawable {
	draw(): Card;
}
@jsonObject
export class Card {
	/* Assigned for all cards */
	@jsonMember
	name: cardName; // many card properties (tribe, etc.) are deferred to a card model lookup
	@jsonArrayMember(Number)
	stats: number[];
	@jsonSetMember(String)
	sigils: Set<sigil>;

	/* Assigned for any card upon being drawn in a battle or played to the backfield */
	battle: Battle;
	owner: playerIndex;
	humanOwner: boolean;

	/* Assigned upon being played to the field */
	baseHP: number;

	/* Assigned under certain circumstances */
	cooldown?: number;
	_ability?: sigil;
	target?: number;
	sprintToLeft?: boolean;
	awakened?: boolean;
	sacrifices?: number;

	/* Assigned temporarily */
	moved?: boolean;
	sigilActivations?: number;
	constructor(model: Card|cardName) {
		if (typeof model == "string") {
			this.name = model;
			model = <Card>card_models[model];
		} else {
			this.name = model.name;
		}
		if (!model) {
			console.log(`ERROR! ${this.name} model not found`);
		}
		// stats: [power, health, cost]
		this.stats = [...model.stats];
		this.sigils = new Set([...model.sigils]);
	}
	toString(): string {
		return JSON.stringify({
			name: this.name,
			stats: this.stats,
			sigils: [...this.sigils]
		});
	}
	static castCardName(card: Card|cardName): Card {
		return (typeof card == "string") ? new Card(card) : card;
	}
	static copyCard(card: Card|cardName): Card|cardName {
		return (typeof card == "string") ? card : new Card(card);
	}
	static openSlot: string[] =
`          
          
    ..    
    ..    
          
          `.split("\n");
	getDisplay(i: number): string[] {
		const size = 8;
		const name = this.name.replace("_", " ");
		const name1 = padTrim(name.length <= size ? name : name.split(" ")[0], size);
		const name2 = padTrim(name.length <= size ? "" : name.split(" ")[1] || "", size);
		const sigils = [...this.sigils].map(s => (s == this.ability ? "@" : (getModel(this.name).sigils.includes(s) ? "*" : "+")));
		//const sigil = padTrim((this.ability ? "@" : "").padEnd([...this.sigils].length, "*"), size, this.isConduit ? "~-" : " ");
		const sigil = padTrim(sigils.join(""), size, this.isConduit ? "~―" : " ");
		//const sigil = padTrim([...this.sigils].map(s => sigilSymbols[s] || "*").join(""), size);
		const cost = this.costDisplay.padEnd(size, " ");
		const stats = this.costDisplay/*`${this.cardRawValue}`.padEnd(4, " ")*/ + (`${this.getPower(i)}/${this.stats[1]}`).padStart(4, " ");
		const final = cost.substring(0, size-stats.length) + stats;
		const border = this.getModelProp("rare") ? "#========#" : "+――――――――+";
		var display;
		if (this.noSacrifice) {
			display =
`+~~~~~~~~+
:${name1}:
:${name2}:
:${sigil}:
:${final}:
+~~~~~~~~+`;
		} else {
			display =
`${border}
|${name1}|
|${name2}|
|${sigil}|
|${final}|
${border}`;
		}
		return display.split("\n");
	}
	get nameSummary(): string {
		return this.name.split("_").map(s => toProperCase(s)).join(" ") + (this.isModified ? "*" : "");
	}
	getEmbedDisplay(i: number, inline: boolean=false): EmbedField {
		const stats = `Stats: \`${i >= 0 ? this.getPower(i) : this.stats[0]}/${this.stats[1]}\``;
		var arr = [stats];
		arr.push(this.costEmbedDisplay);
		if (this.tribe) arr.push(`Tribe: ${this.tribe}`);
		if (this.noSacrifice) arr.push("Cannot be sacrificed");
		if (this.isConduit) arr.push("Acts as a conduit");
		this.sigils.forEach(s => {
			arr.push(`_${s.split("_").join(" ")}_`)
		});
		return {
			name: `${this.nameSummary}`,
			value: arr.join("\n"),
			inline: inline
		}
	}
	get fullDisplay(): string[] {
		var display = ["", this.name.replace("_", " "), this.stats[2] ? `${this.stats[2]} ${this.cost}` : "free", this.getModelProp("tribe") || "no tribe"];
		for (const sigil of this.sigils) {
			display.push(sigil.replace("_", " "));
		}
		display.push(`${this.stats[0]}/${this.stats[1]}`);
		var size = this.name.length;
		for (let i = 2; i < display.length; i++) {
			size = Math.max(size, display[i].length);
		}
		const sides = this.noSacrifice ? ":" : "|";
		const top = this.noSacrifice ? "~" : (this.getModelProp("rare") ? "=" : "―");
		const corners = this.getModelProp("rare") ? "#" : "+";
		for (let i = 1; i < display.length; i++) {
			display[i] = `${sides}${display[i].padEnd(size, " ")}${sides}`
		}
		display[0] = `${corners}${"".padEnd(size, top)}${corners}`;
		display.push(display[0]);
		return display;
	}
	get ability(): sigil {
		if (!this._ability) {
			const abilities: sigil[] = ["scholar", "stimulate", "enlarge", "energy_gun", "disentomb", "sniper", "bonehorn", "power_dice", "hovering", "energy_conduit"];
			for (const ability of abilities) {
				if (this.sigils.has(ability)) {
					this._ability = ability;
					break;
				}
			}
		}
		return this._ability;
	}
	get player(): PlayerBattler {
		return this.battle.getPlayer(this.owner);
	}
	newOwner(owner: playerIndex) {
		this.owner = owner;
		this.humanOwner = this.battle.isHuman(owner);
	}
	activeSigil(sigil: sigil): boolean {
		return this.sigils.has(sigil) && this.checkSigilLoop();
	}
	checkSigilLoop(): boolean {
		return (this.sigilActivations = (this.sigilActivations || 0) + 1) < 10;
	}
	resetSigilLoop(): void {
		delete this.sigilActivations;
	}
	canActivate(i: number): boolean {
		if (this.cooldown >= 3) return false;
		switch (this.ability) {
			case "stimulate":
				return this.player.energy >= 2;
			case "scholar":
				return this.battle.hasMoxColor(this.owner, "blue");
			case "enlarge":
				return this.player.bones >= 2;
			case "energy_gun":
				const other = (this.owner ? 0 : 1);
				return this.battle.field[other][i] && this.player.energy >= 1;
			case "disentomb":
				return this.player.bones >= 1;
			case "bonehorn":
			case "power_dice":
				return this.player.energy >= 1;
			case "energy_conduit":
				return this.battle.hasCircuit(this.owner) && this.player.energy < this.player.capacity;
			case "handy":
				return this.player.hand.length > 0;
			case "sniper":
			case "hovering":
			default:
				return false;
		}
	}
	async activate(i: number): Promise<void> {
		if (!this.canActivate(i)) return;
		switch (this.ability) {
			case "stimulate":
				this.player.energy -= 2;
				this.stats[0]++;
				break;
			case "scholar":
				await this.onDeath(i);
				this.player.drawFrom(this.player.deck, true, 3);
				break;
			case "enlarge":
				this.player.bones -= 2;
				this.stats[0]++;
				this.stats[1]++;
				break;
			case "energy_gun":
				const other = (this.owner ? 0 : 1);
				this.battle.attackCard(this, this.battle.field[other][i], 1, other, i);
				this.player.energy -= 1;
				break;
			case "disentomb":
				await this.player.addToHand(new Card("skeleton"));
				this.player.bones--;
				break;
			case "bonehorn":
				this.player.energy--;
				this.player.bones += 3;
				break;
			case "power_dice":
				this.player.energy--;
				this.stats[0] = Math.ceil(Math.random() * 6);
				break;
			case "energy_conduit":
				this.player.energy = this.player.capacity;
				break;
			case "sniper":
				this.target = (this.target + 1) % this.battle.fieldSize;
				this.cooldown = 0;
				break;
			case "hovering":
				if (this.sigils.has("flying")) this.sigils.delete("flying");
				else this.sigils.add("flying");
				this.cooldown = 0;
				break;
			case "handy":
				const discards = this.player.hand;
				this.player.hand = [];
				this.player.drawFrom(this.player.deck, true, discards.length);
				this.player.deck.cards = this.player.deck.cards.concat(discards.filter(c => c.name != (<SideDeck>this.player.sidedeck).card));
				delete this._ability;
				this.sigils.delete("handy");
				break;
		}
		this.cooldown++;
	}
	async move(from: number, to: number, force: boolean=false): Promise<boolean> {
		if (this.battle.field[this.owner][to] && !force) return false;
		this.battle.field[this.owner][from] = null;
		this.battle.field[this.owner][to] = this;
		await this.onMovement(to);
		return true;
	}
	async takeDamage(i: number, damage: number): Promise<boolean> {
		if (!this.stats[1]) return false;
		if (this.sigils.has("armored")) {
			this.sigils.delete("armored");
			return false;
		} else {
			this.stats[1] -= (damage == Infinity ? this.stats[1] : damage);
			if (this.stats[1] <= 0) {
				await this.onDeath(i);
			}
			return true;
		}
	}
	async onDraw(battle: Battle, owner: playerIndex): Promise<void> {
		this.battle = battle;
		this.owner = owner;
		this.humanOwner = battle.isHuman(owner);
		if (this.sigils.has("amorphous")) {
			const possibleSigils: sigil[] = ["rabbit_hole", "fecundity", "battery", "item_bearer", "dam_builder", "bellist", "beehive", "spikey", "swapper", "corpse_eater", "undying", "steel_trap", "four_bones", "scavenger", "blood_lust", "fledgling", "armored", "death_touch", "stone", "piercing", "leader", "annoying", "stinky", "mighty_leap", "waterborne", "flying", "brittle", "sentry", "trifurcated", "bifurcated", "double_strike", "looter", "many_lives", "worthy_sacrifice", "gem_animator", "gemified", "random_mox", "digger", "morsel", "repulsive", "cuckoo", "guardian", "sealed_away", "sprinter", "scholar", "gemnastics", "stimulate", "enlarge", "energy_gun", "disentomb", "powered_buff", "powered_trifurcated", "gem_guardian", "sniper", "transformer", "burrower", "vessel_printer", "bonehorn", "skeleton_crew", "rampager", "detonator", "bomb_spewer", "power_dice", "gem_detonator", "brittle_latch", "bomb_latch", "shield_latch", "hefty", "jumper", "loose_tail", "hovering", "energy_conduit", "magic_armor", "handy", "double_death"];
			do {
				this.sigils.add(pickRandom(possibleSigils));
			} while (Math.random() < 0.1);
			this.sigils.delete("amorphous");
		}
		if (this.sigils.has("random_mox")) {
			const possibleSigils: sigil[] = ["blue_mox", "orange_mox", "green_mox"];
			this.sigils.add(pickRandom(possibleSigils));
			this.sigils.delete("random_mox");
		}
		this.hydraCheck();
		if (this.name == "mox_crystal") {
			const possibleMox: cardName[] = ["emerald_mox", "ruby_mox", "sapphire_mox"];
			this.transformInto(pickRandom(possibleMox));
		}
		//console.log(this.fullDisplay.join("\n"));
	}
	async onMovement(i: number): Promise<void> {
		const other = (this.owner ? 0 : 1);
		const otherCard = this.battle.field[other][i];
		if (otherCard) {
			if (otherCard.activeSigil("sentry")) {
				this.battle.attackCard(otherCard, this, 1, this.owner, i);
				if (this.stats[1] <= 0) {
					await this.onDeath(i);
				}
			}
		} else {
			for (let j = 0; j < this.battle.fieldSize; j++) {
				const card = this.battle.field[other][j];
				if (card?.activeSigil("guardian")) {
					this.battle.field[other][i] = card;
					this.battle.field[other][j] = null;
				}
			}
		}
	}
	async onPlay(i: number): Promise<void> {
		if (this.humanOwner) {
			if (this.sigils.has("rabbit_hole")) {
				const rabbit = new Card("rabbit");
				for (const sigil of this.sigils) {
					if (getModel(this.name).sigils.indexOf(sigil) < 0) {
						rabbit.sigils.add(sigil);
					}
				}
				rabbit.sigils.delete("rabbit_hole");
				await this.battle.addToHand(rabbit, this.owner);
			}
			if (this.sigils.has("fecundity")) {
				const clone = new Card(this);
				if (FECUNDITY_NERF) {
					clone.sigils.delete("fecundity");
				}
				await this.battle.addToHand(clone, this.owner);
			}
			if (this.sigils.has("battery")) {
				this.player.capacity = Math.min(MAX_ENERGY, this.player.capacity + 1);
				this.player.energy = Math.min(this.player.capacity, this.player.energy + 1);
			}
			if (this.sigils.has("item_bearer") && this.player.items.length < ITEM_LIMIT) {
				const possibleItems: itemType[] = ["squirrel", "black_goat", "boulder", "frozen_opossum", "bones", "battery", "armor", "pliers", "hourglass", "fan"];
				this.player.items.push(new Item(pickRandom(possibleItems)));
			}
			if (this.sigils.has("gemnastics")) {
				this.player.drawFrom(this.player.deck, true, this.battle.countMox(this.owner));
			}
			if (this.getModelProp("pelt_value") && this.battle.hasFreeSpace(this.owner)) {
				for (let j = 0; j < this.player.hand.length; j++) {
					const lice = this.player.hand[j];
					if (lice && lice.getModelProp("is_pelt_lice")) {
						while (!(await this.battle.playCard(lice, Math.floor(Math.random() * this.battle.fieldSize), this.owner)));
						break;
					}
				}
			}
		}
		const other = (this.owner ? 0 : 1);
		if (this.sigils.has("magic_armor") && !this.battle.field[other][i]) {
			this.sigils.add("armored");
			this.sigils.delete("magic_armor");
		}
		if (this.activeSigil("dam_builder")) {
			await this.battle.playCard(this.createWithExtraSigils("dam", "dam_builder"), i-1, this.owner);
			await this.battle.playCard(this.createWithExtraSigils("dam", "dam_builder"), i+1, this.owner);
		}
		if (this.activeSigil("bellist")) {
			await this.battle.playCard(new Card("chime"), i-1, this.owner);
			await this.battle.playCard(new Card("chime"), i+1, this.owner);
		}
		if (this.activeSigil("cuckoo")) {
			await this.battle.playCard(new Card("broken_egg"), i, other);
		}
		this.baseHP = this.stats[1];
		if (this.sigils.has("gemified") && this.battle.hasMoxColor(this.owner, "green")) this.stats[1] += 2;
		if (this.sigils.has("gem_guardian")) {
			for (let j = 0; j < this.battle.fieldSize; j++) {
				const card = this.battle.field[this.owner][j];
				if (card && card.getModelProp("is_mox")) {
					card.sigils.add("armored");
				}
			}
		}
		if (this.sigils.has("sniper")) {
			this.target = this.battle.isHuman(this.owner) ? i : Math.floor(Math.random() * this.battle.fieldSize);
		}
		if (this.activeSigil("bomb_spewer")) {
			for (let k of [this.owner, 1-this.owner]) {
				for (let j = 0; j < this.battle.fieldSize; j++) {
					if (!this.battle.field[k][j]) {
						await this.battle.playCard(new Card("explode_bot"), j, <playerIndex>k);
					}
				}
			}
		}
		await this.onMovement(i);
	}
	async onHit(attacker: Card): Promise<void> {
		this.battle.log.push(`Player ${this.owner ? 2 : 1}'s ${this.name} dies!`);
		if (this.humanOwner) {
			if (this.activeSigil("beehive")) {
				await this.battle.addToHand(this.createWithExtraSigils("bee", "beehive"), this.owner);
			}
			if (this.activeSigil("vessel_printer")) {
				await this.battle.addToHand(this.createWithExtraSigils("empty_vessel", "vessel_printer"), this.owner);
			}
		}
		if (this.activeSigil("spikey")) {
			attacker.stats[1]--;
			if (this.sigils.has("death_touch") && !attacker.sigils.has("stone")) {
				attacker.stats[1] = 0;
			}
		}
		if (this.sigils.has("swapper") && this.stats[1]) {
			this.stats = [this.stats[1], this.stats[0], this.stats[2]];
		}
		const chime_trigger = this.getModelProp("chime_trigger");
		if (chime_trigger) {
			for (let i = 0; i < this.battle.fieldSize; i++) {
				const daus = this.battle.field[this.owner][i];
				if (daus && daus.name == chime_trigger && daus.checkSigilLoop()) {
					if (attacker.sigils.has("armored")) {
						attacker.sigils.delete("armored");
					} else if (daus.sigils.has("death_touch") && !attacker.sigils.has("stone")) {
						attacker.stats[1] = 0;
					} else {
						attacker.stats[1] -= daus.getPower(i);
					}
				}
			}
		}
	}
	async onDeath(i: number): Promise<void> {
		this.battle.log.push(`Player ${this.owner+1}'s ${this.name} dies!`);
		this.battle.field[this.owner][i] = null;
		this.stats[1] = Math.min(this.stats[1], 0);
		const player = this.player;
		const other = (this.owner == 0) ? 1 : 0;
		let deaths = 1 + this.battle.getCardsWithSigil(this.owner, "double_death").length;
		if (this.activeSigil("sealed_away")) {
			deaths = 1;
			await this.battle.playCard(this.createWithExtraSigils(this.getModelProp("sealed_away") || "opossum", "sealed_away"), i, this.owner);
		} else if (this.battle.isHuman(this.owner)) {
			for (let j = 0; j < player.hand.length; j++) {
				if (player.hand[j].activeSigil("corpse_eater")) {
					deaths = 1;
					const card = player.hand.splice(j,1)[0];
					await this.battle.playCard(card, i);
					break;
				}
			}
			if (this.sigils.has("gift_bearer")) {
				await this.battle.addToHand(new Card(pickRandom(default_deck)), this.owner);
			}
			if (this.sigils.has("haunter")) {
				this.name = "spirit";
				this.stats = [...getModel("spirit").stats];
				await this.battle.addToHand(this, this.owner);
				deaths = 1;
			} else if (this.sigils.has("undying")) {
				this.stats[1] = this.baseHP || getModel(this.name).stats[1];
				if (this.getModelProp("undying_powerup")) {
					this.stats[0] += deaths;
					this.stats[1] += deaths;
				}
				await this.battle.addToHand(this, this.owner);
				deaths = 1;
			}
		}
		while (deaths--) {
			if (this.activeSigil("steel_trap")) {
				const otherCard = this.battle.field[other][i];
				Item.skinningKnife(otherCard, i);
			}
			if (!this.noBones) {
				const bones = this.sigils.has("four_bones") ? 4 : 1;
				if (this.humanOwner) {
					player.bones += bones;
				}
				if (this.battle.isHuman(other) && this.battle.getCardsWithSigil(other, "scavenger").length) {
					this.battle.getPlayer(other).bones += bones;
				}
			}
			this.tryLatch("brittle_latch", other);
			this.tryLatch("bomb_latch", other);
			this.tryLatch("shield_latch", this.owner);
			if (this.activeSigil("detonator") || this.getModelProp("is_mox") &&
			this.battle.getCardsWithSigil(this.owner, "gem_detonator").length + this.battle.getCardsWithSigil(other, "gem_detonator").length > 0) {
				// shouldn't be necessary to delete the sigil, but just in case, to avoid infinite loop
				this.sigils.delete("detonator");
				if (this.battle.field[other][i]) await this.battle.field[other][i].takeDamage(i, Infinity);
				if (i-1 >= 0 && this.battle.field[this.owner][i-1]) await this.battle.field[this.owner][i-1].takeDamage(i-1, Infinity);
				if (i+1 < this.battle.fieldSize && this.battle.field[this.owner][i+1]) await this.battle.field[this.owner][i+1].takeDamage(i+1, Infinity);
			}
		}
		// Last green mox is destroyed, update health of gemified cards
		/*if (this.sigils.has("green_mox") && !battle.hasMoxColor(owner, "green")) {
			for (let j = 0; j < battle.fieldSize; j++) {
				const card = battle.field[owner][j];
				if (!card) continue;
				if (card.sigils.has("gemified")) {
					card.stats[1] -= 2;
				}
			}
		}*/
	}
	async onSacrifice(i: number, card: Card): Promise<void> {
		if (!this.blood) return;
		this.player.blood += this.blood;
		this.player.sacrifices++;
		if (this.sigils.has("morsel")) {
			card.stats[0] += this.stats[0];
			card.stats[1] += this.stats[1];
		}
		if (this.sigils.has("haunter")) {
			for (const sigil of this.sigils) {
				card.sigils.add(sigil);
			}
			this.sigils.delete("haunter");
		}
		if (!this.sigils.has("many_lives")) {
			await this.onDeath(i);
		}
		if (this.name == "child_13") {
			this.awakened = !this.awakened;
			if (this.awakened) {
				this.stats[0] += 2;
				this.sigils.add("flying");
			} else {
				this.stats[0] = Math.max(0, this.stats[0] - 2);
				this.sigils.delete("flying");
			}
		}
		if (this.getModelProp("9lives")) {
			this.sacrifices = (this.sacrifices || 0) + 1;
			if (this.sacrifices == 9) {
				this.name = this.getModelProp("9lives");
				this.stats = [...getModel(this.name).stats];
				this.sigils.delete("many_lives");
			}
		}
	}
	async onKill(): Promise<void> {
		if (this.sigils.has("blood_lust")) {
			this.stats[0]++;
		}
	}
	async onSetup(): Promise<void> {
		if (this.sigils.has("waterborne") && this.getModelProp("kraken")) {
			const tentacles = ["bell_tentacle", "hand_tentacle", "mirror_tentacle"];
			this.name = pickRandom(tentacles);
			this.stats = [...getModel(this.name).stats];
			this.sigils.delete("waterborne");
		}
		if (this.sigils.has("fledgling")) {
			const base_model = getModel(this.name);
			const grows_into = base_model.grows_into;
			this.sigils.delete("fledgling");
			if (grows_into) {
				this.transformInto(grows_into);
			} else {
				this.stats[0] += 1;
				this.stats[1] += 2;
			}
		}
		if (this.sigils.has("transformer")) {
			this.awakened = !this.awakened;
			if (this.awakened) {
				this.stats[0] += this.getModelProp("transformer_attack") || 0;
				if (this.getModelProp("transformer_sigil")) this.sigils.add(this.getModelProp("transformer_sigil"));
			} else {
				this.stats[0] -= this.getModelProp("transformer_attack") || 0;
				if (this.getModelProp("transformer_sigil")) this.sigils.delete(this.getModelProp("transformer_sigil"));
			}
		}
		if (this.humanOwner && this.sigils.has("digger")) {
			this.player.bones++;
		}
		this.cooldown = Math.max(0, this.cooldown-1);
		this.moved = false;
	}
	transformInto(card: cardName): void {
		const old_model = getModel(this.name);
		const new_model = getModel(card);
		this.name = card;
		this.stats[0] += (new_model.stats[0] - old_model.stats[0]);
		this.stats[1] += (new_model.stats[1] - old_model.stats[1]);
		this.stats[2] = new_model.stats[2];
		for (const sigil of old_model.sigils) {
			this.sigils.delete(sigil);
		}
		for (const sigil of new_model.sigils) {
			this.sigils.add(sigil);
		}
	}
	hydraCheck(): void {
		if (this.sigils.has("hydra_egg")) {
			const tribes = {
				canine: 0,
				insect: 0,
				reptile: 0,
				avian: 0,
				hooved: 0,
				squirrel: 0,
				all: 0
			}
			for (let k = 0; k <= 1; k++) {
				this.battle.field[k].forEach(c => {
					if (!c) return;
					if (c.tribe == "all") tribes.all++;
					else if (c.tribe) tribes[c.tribe] = 1;
				})
			}
			
			if (tribes.canine + tribes.insect + tribes.reptile + tribes.avian + tribes.hooved + tribes.all >= 5) {
				this.transformInto("hydra");
			}
		}
	}
	createWithExtraSigils(cardName: cardName, sigil: sigil=null): Card {
		const card = new Card(cardName);
		this.copyExtraSigils(card);
		if (sigil) card.sigils.delete(sigil);
		return card;
	}
	copyExtraSigils(target: Card): void {
		for (const sigil of this.sigils) {
			if (!getModel(this.name).sigils.includes(sigil)) {
				target.sigils.add(sigil);
			}
		}
	}
	latchEffect(field: Card[], sigil: sigil): boolean {
		const options = field.filter(c => c && !c.sigils.has(sigil));
		if (options.length) {
			pickRandom(options).sigils.add(sigil);
			return true;
		}
		return false;
	}
	tryLatch(sigil: sigil, player: playerIndex): void {
		if (this.sigils.has(sigil)) {
			this.latchEffect(this.battle.field[player], sigil) || this.latchEffect(this.battle.field[player ? 0 : 1], sigil);
		}
	}
	getCost(): number {
		var cost = this.stats[2];
		if (this.sigils.has("gemified") && this.battle.hasMoxColor(this.owner, "blue")) {
			cost -= (this.cost == "bones" ? 2 : 1);
		}
		return Math.max(0, cost);
	}
	getPower(i: number): number {
		if (!this.battle) {
			console.log(this.fullDisplay.join("\n"));
		}

		const other = (this.owner ? 0 : 1);
		var power: number = this.stats[0];
		const powerCalc: string = this.getModelProp("power_calc");
		switch (powerCalc) {
			case "ant":
				power = this.battle.field[this.owner].filter(c => (c?.getModelProp("power_calc") == "ant")).length;
				break;
			case "mirror":
				const otherCard = this.battle.field[other][i];
				if (otherCard && otherCard.getModelProp("power_calc") != "mirror") {
					power = otherCard.getPower(i);
				}
				break;
			case "bell":
				power = 4 - i;
				break;
			case "hand":
				power = this.player.hand.length;
				break;
			case "bones":
				power = Math.floor(this.player.bones / 2);
				break;
			case "sacrifices":
				power = this.player.sacrifices;
				break;
			case "mox":
				power = this.battle.countMox(this.owner);
				break;
			case "sigils":
				power = [...this.sigils].length;
				break;
			case "damage":
				power = Math.max(0, (this.baseHP || getModel(this.name).stats[1]) - this.stats[1]);
				break;
		}
		if (powerCalc) power += getModel(this.name).stats[0]; // in all vanilla cases, this does nothing
		if (this.battle.field[this.owner][i-1]?.sigils.has("leader")) power++;
		if (this.battle.field[this.owner][i+1]?.sigils.has("leader")) power++;
		if (this.battle.field[other][i]?.sigils.has("annoying")) power++;
		if (this.battle.field[other][i]?.sigils.has("stinky") && !this.sigils.has("stone")) power--;
		if (this.sigils.has("gemified") && this.battle.hasMoxColor(this.owner, "orange")) power++;
		if (this.getModelProp("is_mox")) power += this.battle.getCardsWithSigil(this.owner, "gem_animator").length;
		const circuit = this.battle.getCircuit(this.owner, i);
		if (circuit) {
			if (circuit[0].sigils.has("buff_conduit")) power++;
			if (circuit[1].sigils.has("buff_conduit")) power++;
			if (this.sigils.has("powered_buff")) power += 2;
		}
		return Math.max(0, power);
	}
	getModelProp(prop: string) {
		return getModel(this.name)[prop];
	}
	isPlayable(maxRawValue: number=Infinity): boolean {
		const cost = this.getCost();
		switch (this.cost) {
			case "free":
				return this.battle.hasFreeSpace(this.owner);
			case "blood":
				return this.battle.hasFreeSpace(this.owner, true) && this.player.blood + this.battle.countBlood(this.owner, maxRawValue) >= cost;
			case "bones":
				return this.battle.hasFreeSpace(this.owner) && this.player.bones >= cost;
			case "energy":
				return this.battle.hasFreeSpace(this.owner) && this.player.energy >= cost;
			case "mox":
				if (!this.battle.hasFreeSpace(this.owner)) return false;
				for (const mox of this.mox) {
					if (mox == "any") {
						if (this.battle.countMox(this.owner) == 0) return false;
					} else if (!this.battle.hasMoxColor(this.owner, mox)) {
						return false;
					}
				}
				return true;
		}
	}
	get hasModifiedSigils(): boolean {
		const model = getModel(this.name);
		for (const sigil of this.sigils) {
			if (!model.sigils.includes(sigil)) return true;
		}
		for (const sigil of model.sigils) {
			if (!this.sigils.has(sigil)) return true;
		}
		return false;
	}
	get isModified(): boolean {
		const model = getModel(this.name);
		if (this.stats[0] != model.stats[0] || this.stats[1] != model.stats[1]) return true;
		return this.hasModifiedSigils;
	}
	get abbrev(): string {
		if (this.getModelProp("abbrev")) return this.getModelProp("abbrev");
		return this.getModelProp("abbrev") || (this.name.match(" ") ? this.name.split(" ").map(c => c[0]).join("") : this.name.substring(0, 3));
	}
	get rare(): boolean {
		return !!getModel(this.name).rare;
	}
	get blood(): number {
		if (this.noSacrifice) return 0;
		else if (this.sigils.has("worthy_sacrifice")) return 3;
		else return 1;
	}
	get noBones(): boolean {
		return !!getModel(this.name).no_bones;
	}
	get noSacrifice(): boolean {
		return !!getModel(this.name).no_sacrifice;
	}
	get isConduit(): boolean {
		return !!getModel(this.name).is_conduit;
	}
	get mox(): moxColor[] {
		return getModel(this.name).mox;
	}
	get tribe(): cardTribe {
		return getModel(this.name).tribe;
	}
	get tail(): cardName {
		switch (this.tribe) {
			case "reptile":
				return "wriggling_tail";
			case "avian":
				return "tail_feathers";
			case "insect":
				return "wriggling_leg";
			case "canine":
			case "hooved":
				return "furry_tail";
			default:
				return "tail";
		}
	}
	get pelt(): cardName {
		switch (this.tribe) {
			case "canine":
				return "wolf_pelt";
			default:
				return this.rare ? "golden_pelt" : "rabbit_pelt";
		}
	}
	get cost(): cardCost {
		return getModel(this.name).cost || "free";
	}
	get sidedeckIcon(): string {
		switch (this.name) {
			case "skeleton":
				return "☠️";
			case "mox_crystal":
				return "💠";
			case "empty_vessel":
				return "📟";
			case "squirrel":
			default:
				return "🐿️";
		}
	}
	get costEmoji(): string {
		switch (this.cost) {
			case "blood":
				return "🩸";
			case "bones":
				return "🦴";
			case "mox":
				return "💎";
			case "energy":
				return "🔋";
		}
		return "";
	}
	get costDisplay(): string {
		switch (this.cost) {
			case "blood":
				return `${"".padEnd(this.stats[2], "&")}`.padEnd(4, " ");
			case "bones":
				return `${this.stats[2]}//`.padEnd(4, " ");
			case "energy":
				return `[${this.stats[2]}]`.padEnd(4, " ");
			case "mox":
				return `m${this.mox.map(m => m[0].toUpperCase()).join("")}`.padEnd(4, " ");
			case "free":
				return "".padEnd(4, " ");
		}
	}
	get costEmbedDisplay(): string {
		switch (this.cost) {
			case "blood":
			case "bones":
			case "energy":
				return `Costs: ${this.getCost()}x${this.costEmoji}${this.cost}`;
			case "mox":
				return `Requires: ${this.mox.join(", ")} ${this.costEmoji}mox`;
			case "free":
				return "Free to play";
		}
	}
	get cardPlayerSigilValue(): number {
		return [...this.sigils].map(c => {
			return sigil_data.__player_sigils.includes(c) ? sigil_data[c].power : 0;
		}).reduce((acc, cur) => (acc + cur), 0);
	}
	get cardNonplayerValue(): number {
		return this.cardRawValue - this.cardPlayerSigilValue;
	}
	get cardRawValue(): number {
		const statsValue = this.stats[0] * 2 + this.stats[1];
		const sigilsValue = [...this.sigils].map(c => {
			if (!sigil_data[c]) { console.log(`Unrecognized sigil ${c}`) }
			return sigil_data[c].power;
		}).reduce((acc, cur) => (acc + cur), 0);
		var extraValue = 0;
		if (this.isConduit) extraValue += 1;
		if (this.getModelProp("power_calc")) extraValue += 3;
		return statsValue + sigilsValue + extraValue;
	}
	get sacrificePriority(): number {
		return this.sigils.has("many_lives") ? -Infinity : (this.cardRawValue - (this.sigils.has("worthy_sacrifice") ? 10 : 0) - (this.sigils.has("haunter") ? 5 : 0));
	}
	get cardPlayerValue(): number {
		var costValue = 0;
		if (this.noSacrifice) costValue++;
		switch (this.cost) {
			case "blood":
				costValue = this.stats[2] * 3;
				break;
			case "energy":
				costValue = this.stats[2] * 2;
				break;
			case "bones":
				costValue = this.stats[2];
				break;
			case "mox":
				for (let mox of this.mox) {
					if (mox == "any") costValue += 3;
					else costValue += 5;
				}
				break;
		}
		return this.cardRawValue - costValue;
	}
}
export class Deck implements Drawable {
	cards: (Card|cardName)[];
	constructor(cards: (Card|cardName)[] = []) {
		this.cards = cards.map(c => Card.copyCard(c));
	}
	draw(): Card {
		if (this.cards.length > 0) {
			return Card.castCardName((this.cards.splice(Math.floor(Math.random() * this.cards.length), 1))[0]);
		} else {
			return null;
		}
	}
	drawFromFilter(filter: (card: Card|cardName) => boolean): Card {
		const filtered = this.cards.filter(filter);
		if (!filtered.length) return this.draw();
		const card = pickRandom(filtered);
		this.cards.splice(this.cards.indexOf(card), 1);
		return Card.castCardName(card);
	}
	pick(): Card {
		if (this.cards.length > 0) {
			return Card.castCardName(pickRandom(this.cards));
		} else {
			return null;
		}
	}
}
export class SideDeck implements Drawable {
	card: Card|cardName;
	count: number;
	constructor(card: Card|cardName, count: number=20) {
		this.card = card;
		this.count = count;
	}
	draw(): Card {
		if (this.count > 0) {
			this.count--;
			return new Card(this.card);
		} else {
			return null;
		}
	}
}

export class Item {
	type: itemType;
	constructor(type: itemType) {
		this.type = type;
	}
	isUsable(battle: Battle, player: playerIndex): boolean {
		return true;
	}
	static async skinningKnife(card: Card, i: number): Promise<void> {
		if (card && card.stats[1] > 0) {
			await card.takeDamage(i, Infinity);
			if (card.humanOwner) {
				// steel trap/skinning knife now retains the killed card's extra sigils, gives gold pelts for rares, and rabbit pelts for non-canines
				await card.battle.addToHand(card.createWithExtraSigils(card.pelt), card.owner);
			}
		}
	}
	static async wiseclock(battle: Battle): Promise<void> {
		let traitor1 = battle.field[1][battle.fieldSize-1];
		let traitor2 = battle.field[0][0];
		for (let i = 0; i < battle.fieldSize-1; i++) {
			battle.field[1][i+1] = battle.field[1][i];
		}
		for (let i = battle.fieldSize-1; i > 0; i--) {
			battle.field[0][i-1] = battle.field[0][i];
		}
		battle.field[0][battle.fieldSize-1] = traitor1;
		battle.field[1][0] = traitor2;
		traitor1?.newOwner(0);
		traitor2?.newOwner(1);
	}
	static async magpieLens(battle: Battle, player: PlayerBattler): Promise<void> {
		await player.addToHand(player.deck.draw());
	}
	async use(battle: Battle, player: playerIndex): Promise<boolean> {
		if (!this.isUsable(battle, player)) return false;
		switch (this.type) {
			case "squirrel":
			case "black_goat":
			case "boulder":
			case "frozen_opossum":
				await battle.addToHand(new Card(this.type), player);
				break;
			case "bones":
				battle.getPlayer(player).bones += 4;
				break;
			case "battery":
				battle.getPlayer(player).energy = battle.getPlayer(player).capacity;
				break;
			case "armor":
				battle.field[player].forEach(c => c?.sigils.add("armored"));
				break;
			case "pliers":
				await battle.damage(1);
				break;
			case "fan":
				battle.getPlayer(player).fanUsed = true;
				break;
			case "hourglass":
				battle.getPlayer(player).hourglassUsed = true;
				break;
			case "wiseclock":
				await Item.wiseclock(battle);
				break;
			case "skinning_knife":
				//await Item.skinningKnife(battle);
				break;
			case "lens":
				await Item.magpieLens(battle, battle.getPlayer(player));
				break;
		}
		return true;
	}
}

export abstract class Battle {
	scale: number;
	goal: number;
	turn: number;
	candles: number[];
	fieldSize: number;
	field: Card[][];
	log: string[];
	ended: boolean = false;
	players: Battler[];
	starvation: number;
	terrain: cardName;
	constructor({candles=1, goal=5, scale=0, fieldSize=4, terrain=""}={}) {
		this.scale = scale;
		this.goal = goal;
		this.turn = 0;
		this.candles = [candles, candles];
		this.fieldSize = fieldSize;
		this.field = [Array(this.fieldSize).fill(null), Array(this.fieldSize).fill(null)];
		this.log = [];
		this.terrain = terrain;
	}
	async placeTerrain(terrain: cardName): Promise<void> {
		if (!terrain) return;
		await this.playCard(new Card(terrain), Math.floor(Math.random() * this.fieldSize), 0);
		await this.playCard(new Card(terrain), Math.floor(Math.random() * this.fieldSize), 1);
	}
	get actor(): playerIndex {
		return <playerIndex>(this.turn % 2);
	}
	flushLog(): string {
		const log = this.log.join("\n");
		this.log = [];
		return log;
	}
	async damage(amount: number, player: playerIndex=this.actor): Promise<boolean> {
		this.scale += amount * (player ? 1 : -1);
		if (Math.abs(this.scale) >= this.goal) {
			return await this.candleOut(this.scale > 0 ? 0 : 1);
		}
		return false;
	}
	async candleOut(player: playerIndex): Promise<boolean> {
		this.candles[player]--;
		if (this.candles[player] <= 0) {
			return true;
		} else {
			this.scale = 0;
			if (this.isHuman(1)) {
				await this.getPlayer(player).addToHand(new Card("greater_smoke"));
			}
			return false;
		}
	}
	async setupTurn(): Promise<void> {
		const actor = this.actor;
		this.log.push(`Player ${actor+1} starts their turn.`);
		for (var i = 0; i < this.fieldSize; i++) {
			const card = this.field[actor][i];
			if (!card) continue;
			await card.onSetup();
		}
		await this.players[actor].setupTurn();
	}
	async attackCard(attacker: Card, target: Card, power: number, owner: playerIndex, j: number): Promise<number> {
		var damage = 0;
		if (await target.takeDamage(j, attacker.sigils.has("death_touch") && !target.sigils.has("stone") ? Infinity : power)) {
			await target.onHit(attacker);
			if (target.stats[1] <= 0) {
				if (attacker.sigils.has("piercing")) {
					damage = Math.max(0, -target.stats[1]);
				} else if (target.stats[1] < 0) {
					this.players[owner].overkillDamage(-target.stats[1], j);
				}
				await attacker.onKill();
			}
		}
		return damage;
	}
	async attackField(i: number, j: number, player: playerIndex=this.actor): Promise<number> {
		const card = this.field[player][i];
		if (!card) return 0;
		if (card.sigils.has("sniper")) j = card.target;

		if (!(j >= 0 && j < this.fieldSize)) return 0;
		var damage = 0;

		const other = (player ? 0 : 1);
		var otherCard = this.field[other][j];
	
		const power = card.getPower(i);
		if (power <= 0) return 0;
	
		if (!otherCard) {
			for (let k = 0; k < this.fieldSize; k++) {
				const burrower = this.field[other][k];
				if (burrower && burrower.sigils.has("burrower") && (!card.sigils.has("flying") || burrower.sigils.has("mighty_leap"))) {
					await burrower.move(k, j);
					otherCard = burrower;
					break;
				}
			}
		}
		if (otherCard && !otherCard.sigils.has("waterborne") &&
			(otherCard.sigils.has("mighty_leap") || !(card.sigils.has("flying") || this.isHuman(player) && this.getPlayer(player).fanUsed))) {
			if (!otherCard.sigils.has("repulsive")) {
				if (otherCard.sigils.has("loose_tail")) {
					let d = (j+1 < this.fieldSize && !this.field[other][j+1]) ? 1 : -1;
					if (j+d > 0 && !this.field[other][j+d]) {
						await otherCard.move(j, j+d);
						otherCard.sigils.delete("loose_tail");
						await this.playCard(otherCard.createWithExtraSigils(otherCard.tail, "loose_tail"), j, other);
						otherCard = this.field[other][j];
					}
				}
				if (otherCard) {
					damage = await this.attackCard(card, otherCard, power, other, j);
				} else {
					damage = power;
				}
			}
		} else {
			damage = power;
		}
		if (card.sigils.has("brittle") || card.stats[1] <= 0) {
			await card.onDeath(i);
		}
		if (damage) {
			this.log.push(`${card.name} deals ${damage} damage!`);
		}
		return damage;
	}
	async playCard(card: Card, i: number, player: playerIndex=this.actor): Promise<boolean> {
		await card.onDraw(this, player);
		if (i < 0 || i >= this.fieldSize || this.field[player][i]) return false;
		this.log.push(`Player ${player+1} plays ${card.name}!`);
		this.field[player][i] = card;
		await card.onPlay(i);
		return true;
	}
	emptySpaceInDirection(player: playerIndex, i: number, d: number): number {
		for (let j = i; j >= 0 && j < this.fieldSize; j += d) {
			if (!this.field[player][j]) return j;
		}
		return -1;
	}
	async executeTurn(): Promise<boolean> {
		const actor = this.actor;
		var damage = 0;
		for (let i = 0; i < this.fieldSize; i++) {
			const card = this.field[actor][i];
			if (!card) continue;
			card.resetSigilLoop();
			if (card.sigils.has("gem_dependent") && this.countMox(actor) <= 0) {
				await card.onDeath(i);
				continue;
			}
			if (card.getPower(i) > 0) {
				let subdamage = 0;
				if (card.sigils.has("trifurcated") || card.sigils.has("powered_trifurcated") && this.getCircuit(actor, i)) {
					subdamage += await this.attackField(i, i-1) + await this.attackField(i, i) + await this.attackField(i, i+1);
				} else if (card.sigils.has("bifurcated")) {
					subdamage += await this.attackField(i, i-1) + await this.attackField(i, i+1);
				} else {
					subdamage += await this.attackField(i, i);
				}
				if (card.sigils.has("double_strike")) {
					subdamage += await this.attackField(i, i);
				}
				if (card.sigils.has("looter") && subdamage > 0 && this.isHuman(actor)) {
					const player = this.getPlayer(actor);
					player.drawFrom(player.deck, true, subdamage);
				}
				damage += subdamage;
			}
		}
		for (let i = 0; i < this.fieldSize; i++) {
			const card = this.field[actor][i];
			if (!card || card.moved) continue;
			const rampager = card.sigils.has("rampager");
			const hefty = card.sigils.has("hefty");
			const jumper = card.sigils.has("jumper");
			const trail = card.getModelProp("trail");
			if (card.sigils.has("sprinter") || card.sigils.has("skeleton_crew") || rampager || hefty || jumper) {
				let d = (card.sprintToLeft ? -1 : 1);
				let t = i + d;
				if (t < 0 || t >= this.fieldSize || (this.field[actor][t] && !rampager && !(jumper && this.emptySpaceInDirection(actor, i, d) > -1))) {
					card.sprintToLeft = !card.sprintToLeft;
					d = -d;
					t = i + d;
				}
				if (jumper) {
					t = this.emptySpaceInDirection(actor, i, d);
					if (t > -1) {
						card.moved = true;
						await card.move(i, t);
					}
				} else if (hefty) {
					t = this.emptySpaceInDirection(actor, i, d);
					if (t > -1) {
						card.moved = true;
						for (let j = t; j != i; j -= d) {
							this.field[actor][j] = this.field[actor][j-d];
							this.field[actor][j-d] = null;
							this.field[actor][j] && await this.field[actor][j].onMovement(j);
						}
					}
				} else if (!this.field[actor][t] || rampager) {
					this.field[actor][i] = this.field[actor][t] || (trail ? new Card(trail) : null);
					this.field[actor][t] = card;
					if (this.field[actor][i]) {
						await this.field[actor][i].onDraw(this, actor);
						await this.field[actor][i].onMovement(i);
					}
					card.moved = true;
					await card.onMovement(t);
					i = t;
				}
			}
		}
		if (!this.getPlayer(actor).deck.cards.length) {
			this.starvation = (this.starvation || 0) + 1;
			if (this.candles[0] != this.candles[1]) {
				this.scale += (this.candles[0] > this.candles[1] ? -1 : 1) * this.starvation;
			} else if (this.scale != 0) {
				this.scale += (this.scale < 0 ? -1 : 1) * this.starvation;
			} else if (!damage) {
				damage -= this.starvation;
			}
		}

		if (this.getCardsWithSigil(actor, "factory_conduit").length) {
			for (let i = 1; i+1 < this.fieldSize; i++) {
				if (this.field[actor][i]) continue;
				const circuit = this.getCircuit(actor, i);
				if (circuit && (circuit[0].sigils.has("factory_conduit") || circuit[1].sigils.has("factory_conduit"))) {
					await this.playCard(new Card("l33pb0t"), i, actor);
				}
			}
		}

		if (await this.damage(damage)) {
			this.ended = true;
			return true;
		} else {
			if (!this.isHuman(actor) || !this.getPlayer(actor).hourglassUsed) {
				this.turn++;
			}
			return false;
		}
	}
	async addToHand(card: Card, player: playerIndex=this.actor): Promise<void> {
		await this.getPlayer(player).addToHand(card);
	}
	hasMoxColor(player: playerIndex, mox: moxColor): boolean {
		if (mox == "any") {
			for (let i = 0; i < this.fieldSize; i++) {
				const card = this.field[player][i];
				if (!card) continue;
				if (card.sigils.has(`green_mox`) || card.sigils.has("blue_mox") || card.sigils.has("orange_mox")) return true;
			}
		} else {
			for (let i = 0; i < this.fieldSize; i++) {
				if (this.field[player][i]?.sigils.has(`${mox}_mox`)) return true;
			}
		}
		return false;
	}
	hasFreeSpace(player: playerIndex, sacrificeIsFree: boolean=false): boolean {
		for (let i = 0; i < this.fieldSize; i++) {
			const card = this.field[player][i];
			if (!card || sacrificeIsFree && card.blood > 0 && !card.sigils.has("many_lives")) {
				return true;
			}
		}
		return false;
	}
	getCardsWithSigil(player: playerIndex, sigil: sigil): Card[] {
		var arr = [];
		for (let i = 0; i < this.fieldSize; i++) {
			if (this.field[player][i]?.sigils.has(sigil)) {
				arr.push(this.field[player][i]);
			}
		}
		return arr;
	}
	countBlood(player: playerIndex, maxRawValue: number=Infinity): number {
		const sacrifices = this.field[player].filter(c => c && c.blood).sort((a,b) => a.sacrificePriority - b.sacrificePriority);
		var blood = 0;
		var valueTotal = 0;
		for (const card of sacrifices) {
			valueTotal += card.cardRawValue;
			if (valueTotal >= maxRawValue) continue;
			blood += card.blood || 0;
		}
		return blood;
	}
	countMox(player: playerIndex): number {
		var count = 0;
		for (let i = 0; i < this.fieldSize; i++) {
			const card = this.field[player][i];
			if (!card) continue;
			if (card.sigils.has("blue_mox")) count++;
			if (card.sigils.has("green_mox")) count++;
			if (card.sigils.has("orange_mox")) count++;
		}
		return count;
	}
	hasCircuit(player: playerIndex): boolean {
		var count = 0;
		for (let i = 0; i < this.fieldSize; i++) {
			if (this.field[player][i]?.isConduit) {
				if (++count >= 2) return true;
			}
		}
		return false;
	}
	getCircuit(player: playerIndex, i: number): Card[] {
		var leftCard: Card;
		for (let j = i-1; j >= 0; j--) {
			if (this.field[player][j]?.isConduit) {
				leftCard = this.field[player][j];
				break;
			}
		}
		var rightCard: Card;
		for (let k = i+1; k < this.fieldSize; k++) {
			if (this.field[player][k]?.isConduit) {
				rightCard = this.field[player][k];
				break;
			}
		}
		return leftCard && rightCard ? [leftCard, rightCard] : null;
	}
	get mayRingBell(): boolean {
		return this.getPlayer(this.actor).drawn;
	}
	hasDrawOption(option: "deck"|"sidedeck"|"hammer"): boolean {
		const player = this.getPlayer(this.actor);
		switch (option) {
			case "deck":
				return player.deck.cards.length > 0;
			case "sidedeck":
				return true;
			case "hammer":
				return this.field[this.actor].some(c => c);
		}
	}
	get candleDisplay(): string {
		return `${"".padEnd(this.candles[0], "i")}(${("").padStart(Math.min(this.goal, Math.max(0, this.scale)), "*").padStart(this.goal, " ")}/${("").padEnd(Math.min(this.goal, Math.max(0, -this.scale)), "*").padEnd(this.goal, " ")})${"".padEnd(this.candles[1], "i")}${Math.abs(this.scale)>this.goal?` +${Math.abs(this.scale)-this.goal}`:""}`;
	}
	get display(): string {
		var display = `${this.candleDisplay}\n${this.players[1].display}\n`;
		for (let p = 1; p >= 0; p--) {
			let arr: string[][] = [];
			for (let i = 0; i < this.fieldSize; i++) {
				arr.push((this.field[p][i] ? this.field[p][i].getDisplay(i) : Card.openSlot));
			}
			let arr2 = Array(Card.openSlot.length).fill("");
			for (let j = 0; j < arr2.length; j++) {
				for (let k = 0; k < arr.length; k++) {
					arr2[j] += arr[k][j];
				}
			}
			display += arr2.join("\n") + "\n";
		}
		display += this.players[0].display;
		return display;
	}
	get embedDisplay(): Embed {
		var fields: Embed[] = [];
		return {
			title: "Battle",
			description: "",
			fields: []
		}
	}
	async awaitCompletion(displayCallback=console.log): Promise<playerIndex> {
		if (this.terrain) await this.placeTerrain(this.terrain);
		await displayCallback(this.display);
		while (!this.ended) {
			await this.setupTurn();
			while (await this.players[this.actor].performAction());
			await this.executeTurn();
			await displayCallback(this.display);
		}
		await displayCallback(this.display);
		return this.candles[0] ? 0 : 1;
	}
	abstract getPlayer(player: playerIndex): PlayerBattler;
	abstract isHuman(player: playerIndex): boolean;
}
export class SoloBattle extends Battle {
	player: PlayerBattler;
	constructor(player: Player, options={}) {
		super(options);
		this.player = player.battlerInstance(this, 0);
		this.players = [this.player, new AutoBattler(this)];
		if (this.candles[1] > 1) {
			while (this.candles[0] > 1) {
				//this.player.addToHand(new Card("the_smoke"));
				this.candles[0]--;
			}
		}
		this.log.push(`Started AI battle!`);
	}
	getPlayer(): PlayerBattler {
		return this.player;
	}
	isHuman(player: playerIndex): boolean {
		return (player == 0);
	}
}
export class DuelBattle extends Battle {
	players: PlayerBattler[]=[];
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

export interface Battler {
	setupTurn(): Promise<void>;
	overkillDamage(amount: number, i: number): void;
	performAction(): Promise<boolean>;
	get display(): string;
}
export class PlayerBattler implements Battler {
	battle: Battle;
	index: playerIndex;

	deck: Deck;
	sidedeck: SideDeck;
	hand: Card[];
	overkill: number[];
	totem: Totem;
	items: Item[];

	sacrifices: number = 0;
	bones: number = 0;
	energy: number = 0;
	capacity: number = 0;
	blood: number = 0;
	drawn: boolean = true;
	fanUsed: boolean = false;
	hourglassUsed: boolean = false;

	constructor(battle: Battle, index: playerIndex, deck: Deck, sidedeck: SideDeck, hand: Card[], totem: Totem) {
		this.battle = battle;
		this.index = index;
		this.deck = deck;
		this.sidedeck = sidedeck;
		this.hand = hand;
		this.totem = totem;
		this.items = [];
		this.overkill = Array(battle.fieldSize).fill(0);
	}
	get display(): string {
		const cards = `Cards: ${this.hand.length.toString().padStart(2, " ")}/${this.deck.cards.length.toString().padEnd(2, " ")}`;
		const mox = `m(${["blue", "green", "orange"].map(c => this.battle.hasMoxColor(this.index, <moxColor>c) ? c[0].toUpperCase() : " ").join("")})`;
		const energy = `[${"".padStart(this.energy, "#").padStart(this.capacity, "0").padStart(MAX_ENERGY, ".")}]`;
		const bones = `${this.bones}//`;
		return `${cards} ${mox} ${energy} ${bones}`;
	}
	get sidedeckIcon(): string {
		return Card.castCardName(this.sidedeck.card).sidedeckIcon;
	}
	async setupTurn(): Promise<void> {
		this.drawn = (this.battle.turn < 2);
		this.sacrifices = 0;
		this.capacity = Math.min(MAX_ENERGY, this.capacity + 1);
		this.energy = this.capacity;
		this.fanUsed = false;
		this.hourglassUsed = false;
	}
	endTurn(): void {
		this.overkill.fill(0);
	}
	overkillDamage(amount: number, i: number): void {
		if (!this.battle.isHuman(1)) return;
		this.overkill[i] += amount;
	}
	async drawFrom(src: Drawable, force: boolean=false, count: number=1, filter: (card: Card|cardName) => boolean=null): Promise<number> {
		if (!force && this.drawn || count <= 0) return 0;
		var cardsDrawn = 0;
		while (count > 0) {
			const card = (filter && src instanceof Deck) ? src.drawFromFilter(filter) : src.draw();
			if (!card) break;
			await this.addToHand(card);
			cardsDrawn++;
			count--;
		}
		this.drawn = true;
		return cardsDrawn;
	}
	async addToHand(card: Card): Promise<void> {
		if (!card) return;
		if (this.totem && (card.tribe == this.totem.tribe || card.tribe == "all")) {
			card.sigils.add(this.totem.sigil);
		}
		await card.onDraw(this.battle, this.index);
		this.hand.push(card);
	}
	async playFromHand(h: number, i: number): Promise<boolean> {
		const card = this.hand[h];
		console.log(`Trying to play a card from hand #${h} to ${i}`);
		if (!card || !card.isPlayable(card.cardRawValue) || this.battle.field[this.index][i]) return false;
		console.log(`Card should be playable`);
		const cost = card.getCost();
		switch (card.cost) {
			case "blood":
				if (this.blood < cost) {
					const sacrifices = this.battle.field[this.index].filter(c => c && c.blood).sort((a,b) => a.sacrificePriority - b.sacrificePriority);
					for (let i = 0; i < sacrifices.length; i++) {
						await sacrifices[i].onSacrifice(this.battle.field[this.index].indexOf(sacrifices[i]), card);
						if (this.blood >= cost) break;
					}
				}
				this.blood = 0;
				break;
			case "bones":
				this.bones = Math.max(0, this.bones - cost);
				break;
			case "energy":
				this.energy = Math.max(0, this.energy - cost);
				break;
		}
		if (await this.battle.playCard(card, i)) {
			this.hand.splice(h, 1);
			return true;
		} else {
			console.log(`Failed to play card ${card.nameSummary}`);
			return false;
		}
	}
	get field(): Card[] {
		return this.battle.field[this.index];
	}
	async useHammer(i: number): Promise<void> {
		if (this.drawn || !this.field[i]) return;
		this.drawn = true;
		await this.field[i].takeDamage(i, 100);
	}
	async performAction(): Promise<boolean> {
		await sleep(AI_SPEED);
		var hasOption = false;
		for (let i = 0; i < this.battle.fieldSize; i++) {
			const card = this.battle.field[this.index][i];
			if (!card || card.getPower(i) > 0) {
				hasOption = true;
				break;
			}
		}
		if (!hasOption) {
			await this.useHammer(Math.floor(Math.random() * this.battle.fieldSize));
		} else {
			await this.drawFrom(this.deck.cards.length && (this.hand.filter(c => sidedecks.includes(c.name)).length >= 2 || Math.random() < 0.7) ? this.deck : this.sidedeck);
		}
		var plays = 0;
		while (++plays < 50 && (await this.playFromHand(Math.floor(Math.random() * this.hand.length), Math.floor(Math.random() * this.battle.fieldSize)) || Math.random() < 0.9));
		for (let i = 0; i < this.battle.fieldSize; i++) {
			const card = this.battle.field[this.index][i];
			if (card?.ability) {
				while (++plays < 50 && card.canActivate(i) && Math.random() < 0.8) await card.activate(i);
			}
		}
		this.endTurn();
		return false;
	}
}
export class AutoBattler implements Battler {
	battle: Battle;
	backfield: Card[];
	cardPool: cardName[];
	constructor(battle: Battle, cardPool: cardName[]=[]) {
		this.battle = battle;
		this.backfield = Array(battle.fieldSize).fill(null);
		if (!cardPool.length) {
			const selection = default_auto.filter(c => {
				const model = getModel(c);
				return model.nonplayerValue >= 3;
			});
			cardPool = randomSelectionFrom(selection, 3 + Math.floor(Math.random() * 6));
		}
		this.cardPool = cardPool;
		this.playRandomBackfield();
	}
	get display(): string {
		var display = "";
		for (let i = 0; i < this.backfield.length; i++) {
			display += this.backfield[i] ? `[${padTrim(this.backfield[i].name.replace("_", ""), 8, '=')}]` : "".padEnd(10, " ");
		}
		return display;
	}
	async setupTurn(): Promise<void> {
		for (let i = 0; i < this.battle.fieldSize; i++) {
			if (!this.battle.field[1][i] && this.backfield[i]) {
				await this.battle.playCard(this.backfield[i], i);
				this.backfield[i] = null;
			}
		}
		if (Math.random() < 0.4) await this.playRandomBackfield();
	}
	async playBackfield(card: cardName|Card, i: number): Promise<void> {
		if (!this.backfield[i]) {
			this.backfield[i] = Card.castCardName(card);
			await this.backfield[i].onDraw(this.battle, 1);
		}
	}
	async playRandomBackfield(): Promise<void> {
		const card = pickRandom(this.cardPool);
		const i = this.getRandomOpenSlot();
		if (i > -1) {
			await this.playBackfield(card, i);
		}
	}
	getRandomOpenSlot(): number {
		var open: number[] = [];
		for (let i = 0; i < this.battle.fieldSize; i++) {
			if (!this.backfield[i]) open.push(i);
		}
		return open.length ? pickRandom(open) : -1;
	}
	overkillDamage(amount: number, i: number): void {
		if (this.backfield[i]) {
			this.backfield[i].stats[1] -= amount;
			if (this.backfield[i].stats[1] <= 0) {
				this.backfield[i] = null;
			}
		}
	}
	async performAction(): Promise<boolean> {
		await sleep(AI_SPEED);
		return false;
	}
}

export class Player {
	deck: Deck;
	sidedeck: Card;
	totem: Totem;
	boonBones: number = 0;
	constructor() {
		//this.deck = new Deck(randomSelectionFrom(default_deck, 20 + Math.floor(Math.random() * 30)));
		const sidedeck = pickRandom(sidedecks);
		this.sidedeck = new Card(sidedeck);
		this.deck = Player.generateDeck(sidedeck);
	}
	static generateDeck(sidedeck: cardName): Deck {
		// Selects 50 random cards from the given sidedeck theme (10% for out-of-theme cards, 25% for rare cards)
		// Then sorts by player value and returns deck with N most valuable cards
		const selection = randomSelectionFrom(default_deck.filter(c => {
			const model = getModel(c);
			if (!model.cost && !model.mox || model.rare && Math.random() < 0.25 || Math.random() < 0.1) return true;
			switch (sidedeck) {
				case "squirrel": return model.cost == "blood";
				case "empty_vessel": return model.cost == "energy";
				case "skeleton": return model.cost == "bones";
				case "mox_crystal": return !!model.mox;
				default: return true;
			}
		}), 50).sort((a,b) => {
			return getModel(b).playerValue - getModel(a).playerValue;
		});
		return new Deck(selection.slice(0, 20 + Math.floor(Math.random() * 20)));
	}
	battlerInstance(battle: Battle, index: playerIndex): PlayerBattler {
		var player = new PlayerBattler(battle, index, new Deck(this.deck.cards), new SideDeck(this.sidedeck), [], this.totem);
		player.drawFrom(player.sidedeck, true);
		// Guaranteed to draw at least one low-cost card
		player.drawFrom(player.deck, true, 1, (card: Card|cardName): boolean => {
			if (card instanceof Card) {
				return card.stats[2] <= 1 && !card.isModified;
			} else {
				return getModel(card).stats[2] <= 1;
			}
		})
		player.drawFrom(player.deck, true, 2);
		player.drawn = true;
		player.bones += this.boonBones || (this.sidedeck.noSacrifice ? 1 : 0);
		return player;
	}
}

for (const name in card_models) {
	const model = getModel(name);
	model.stats = model.stats || [0,1,0];
	model.sigils = model.sigils || [];
	model.playerValue = (new Card(name)).cardPlayerValue;
	model.nonplayerValue = (new Card(name)).cardNonplayerValue;
	model.abbrev = model.abbrev || abbreviate(name, 6);
	
	if (model.modded) continue;
	default_auto.push(name);
	if (model.event == "none") continue;
	default_deck.push(name);
	default_deck.push(name);//*/
}
