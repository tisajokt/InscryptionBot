
import sigil_data from "../data/game/sigils.json";
import card_models from "../data/game/cards.json";
import game_config from "../data/game/config.json";
import { padTrim, pickRandom, sleep, randomSelectionFrom, toProperCase, abbreviate, toProperFormat, singleCharStat, costEmoji, sidedeckEmoji } from "./util";
import { EmbedField, Embed } from "src/Display";
import { jsonArrayMember, jsonMapMember, jsonMember, jsonObject, jsonSetMember } from "typedjson";
import { BattleOptions } from "./commands/battle";

export const playerDeckCards: cardName[] = [];
export const botDeckCards: cardName[] = [];
export const enabledDeckCards: cardName[] = [];

for (let p = 0; p < sigil_data.__powers.length; p++) {
	for (let i = 0; i < sigil_data.__powers[p].length; i++) {
		const sigil = sigil_data.__powers[p][i];
		sigil_data[sigil].power = p-3;
	}
}

export const terrains: cardName[] = ["", "boulder", "stump", "grand_fir", "frozen_opossum", "moleman", "broken_bot", "bridge_rails"];
export const sidedecks: cardName[] = ["squirrel", "empty_vessel", "skeleton", "mox_crystal", "lemming", "bee", "tadpole", "squirrel-ish"];

export const MAX_ENERGY: number = game_config.maxEnergy;
export const ITEM_LIMIT: number = game_config.itemLimit;
export const FECUNDITY_NERF: boolean = game_config.fecundityNerf;
export const VANILLA_CABIN_ONLY: boolean = game_config.vanillaCabinOnly;
export const NO_MOX: boolean = game_config.noMox;
export const ENABLED_MODS: Set<string> = new Set(game_config.enabledMods);
export const MAX_TOTAL_RARES: number = game_config.maxTotalRares;
export const MAX_RARE_DUPLICATES: number = game_config.maxRareDuplicates;
export const MAX_NONRARE_DUPLICATES: number = game_config.maxNonrareDuplicates;
export const MIN_COMPETITIVE_CARDS: number = game_config.minCompetitiveCards;
export const SEALED_AWAY_DEFAULT: cardName = game_config.sealedAwayDefault;
export const TRANSFORMER_DEFAULT: cardName = game_config.transformerDefault;

export const slow_mode = false;
export const AI_SPEED: number = slow_mode ? 500 : 0;
export const cardPools = new Map<string, cardName[]>();
cardPools["allPlayerCards"] = playerDeckCards;
cardPools["allBotCards"] = botDeckCards;

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
	is_mox?: boolean,
	no_sacrifice?: boolean,
	no_bones?: boolean,
	is_conduit?: boolean,
	is_terrain?: boolean,
	is_imposter?: boolean,
	power_calc?: string,
	pelt_value?: number,
	is_pelt_lice?: boolean,
	undying_powerup?: boolean,
	chime_trigger?: cardName,
	fish_gifts?: boolean,
	kraken?: boolean,
	beast_mode?: cardName,
	trail?: cardName,
	sealed_away?: cardName,
	uncuttable?: boolean,
	wide?: boolean,
	glitch?: boolean,
	rawValue?: number,
	playerValue?: number,
	nonplayerValue?: number,
	sortIndex?: number,
	bot_playable?: boolean,
	vanilla_cabin?: boolean,
	modded?: boolean|string,
	inspect?: string,
	event?: string,
	themes?: Set<string>,
	vanilla_override?: CardModel
};
export type cardName = string;
export type cardTribe = "canine"|"insect"|"reptile"|"avian"|"hooved"|"squirrel"|"all";
export type cardCost = "free"|"blood"|"bones"|"energy"|"mox";
export type itemType = "squirrel"|"skeleton"|"empty_vessel"|"mox_crystal"|"black_goat"|"boulder"|"frozen_opossum"|"mrs._bomb"|"bones"|"battery"|"armor"|"pliers"|"hourglass"|"fan"|"wiseclock"|"skinning_knife"|"lens"|"hammer";
export type moxColor = "blue"|"green"|"orange"|"any";
export type sigil = "immutable"|"moon_strike"|"free_paint"|
"gem_dependent"|"stunned"|"annoying"|"brittle"|"withering"|"decoy"|"pesky"|"zombified"|
"spawn_ant"|"rabbit_hole"|"fecundity"|"battery"|"item_bearer"|"dam_builder"|"bellist"|"beehive"|"spikey"|"swapper"|"corpse_eater"|"undying"|"steel_trap"|"four_bones"|"scavenger"|"blood_lust"|"fledgling"|"armored"|"death_touch"|"stone"|"piercing"|"leader"|"stinky"|"mighty_leap"|"waterborne"|"airborne"|"sentry"|"trifurcated"|"bifurcated"|"double_strike"|"looter"|"many_lives"|"worthy_sacrifice"|"gem_animator"|"gem_empowered"|"random_mox"|"digger"|"morsel"|"amorphous"|"blue_mox"|"green_mox"|"orange_mox"|"repulsive"|"cuckoo"|"guardian"|"sealed_away"|"sprinter"|"scholar"|"gemnastics"|"stimulate"|"enlarge"|"energy_gun"|"haunter"|"blood_guzzler"|"disentomb"|"powered_buff"|"powered_trifurcated"|"buff_conduit"|"gems_conduit"|"factory_conduit"|"gem_guardian"|"sniper"|"transformer"|"burrower"|"vessel_printer"|"bonehorn"|"skeleton_crew"|"rampager"|"detonator"|"bomb_spewer"|"power_dice"|"gem_detonator"|"brittle_latch"|"bomb_latch"|"shield_latch"|"hefty"|"jumper"|"hydra_egg"|"loose_tail"|"hovering"|"energy_conduit"|"magic_armor"|"handy"|"double_death"|"hoarder"|"gift_bearer"|"skellify"|"animate_blood"|"fisher"|"stun_latch"|"painter"|"clinger"|"capacitor"|"opportunist"|"combative"|"beast_summon"|"exploding_guts"|"phase_shift"|"stinger"|"annoying_latch"|"rolling"|"lemming"|"infectious"|"ant_source"|"gem_specialist"|"frenzying";
export type playerIndex = 0|1;
export type bossType = "prospector"|"angler"|"trader"|"moon";
export type selectSource = "magpie"|"skinning_knife"|"sniper"|"hammer"|"latch"|"paint"|"mox_decision";

export const amorphousSigils: sigil[] = ["spawn_ant", "rabbit_hole", "fecundity", "battery", "item_bearer", "dam_builder", "bellist", "beehive", "spikey", "swapper", "corpse_eater", "undying", "steel_trap", "four_bones", "scavenger", "blood_lust", "fledgling", "armored", "death_touch", "stone", "piercing", "leader", "stinky", "mighty_leap", "waterborne", "airborne", "sentry", "trifurcated", "bifurcated", "double_strike", "looter", "many_lives", "worthy_sacrifice", "gem_animator", "gem_empowered", "random_mox", "digger", "morsel", "repulsive", "cuckoo", "guardian", "sealed_away", "sprinter", "scholar", "gemnastics", "stimulate", "enlarge", "energy_gun", "disentomb", "powered_buff", "powered_trifurcated", "gem_guardian", "sniper", "transformer", "burrower", "vessel_printer", "bonehorn", "skeleton_crew", "rampager", "detonator", "bomb_spewer", "power_dice", "gem_detonator", "brittle_latch", "bomb_latch", "shield_latch", "hefty", "jumper", "loose_tail", "hovering", "energy_conduit", "magic_armor", "handy", "double_death", "gift_bearer", "hoarder", "skellify", "animate_blood", "fisher", "stun_latch", "painter", "clinger", "capacitor", "opportunist", "combative", "beast_summon", "exploding_guts", "phase_shift", "stinger", "annoying_latch", "rolling", "lemming", "ant_source", "gem_specialist", "frenzying"];
export const botSigils = amorphousSigils.filter((sigil) => {
	if (!sigil_data[sigil]) console.error(`${sigil} not found`);
	return !sigil_data[sigil].active && !sigil_data.__player_sigils.includes(sigil);
});
export const movementSigils: sigil[] = ["sprinter", "hefty", "jumper", "rampager", "rolling", "clinger"];

@jsonObject
export class Totem {
	@jsonMember
	tribe: cardTribe
	@jsonMember
	sigil: sigil
};

export function getModel(card: cardName, vanilla: boolean=false): CardModel {
	const model: CardModel = card_models[card];
	if (!model) console.error(`${card} model not found`);
	if (vanilla && model.vanilla_override) {
		return Object.assign(Object.create(model), model.vanilla_override);
	}
	return model;
}
export function modelSummary(card: cardName): string {
	const model = getModel(card);
	return `${toProperFormat(card)} [${model.power_calc ? "*" : singleCharStat(model.stats[0])}${model.no_sacrifice?":":"/"}${model.stats[1]}] ${Card.costEmojiDisplay(model.cost, model.stats[2], model.mox) || "free"}`;
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
	sprintToLeft?: boolean;
	awakened?: boolean;
	sacrifices?: number;
	isImposter?: string;

	/* Assigned temporarily */
	moved?: boolean;
	sigilActivations?: number;
	hammered?: boolean;
	sacrificedFor?: number;
	constructor(model: Card|cardName) {
		if (typeof model === "string") {
			this.name = model;
			model = <Card>card_models[model];
		} else {
			this.name = model.name;
		}
		if (!model) {
			console.error(`ERROR! ${this.name} model not found`);
		}
		// stats: [power, health, cost]
		this.stats = [...model.stats];
		this.sigils = new Set([...model.sigils]);
	}
	static castCardName(card: Card|cardName): Card {
		return (typeof card === "string") ? new Card(card) : card;
	}
	static copyCard(card: Card|cardName): Card|cardName {
		return (typeof card === "string") ? card : new Card(card);
	}
	get nameSummary(): string {
		return toProperFormat(this.name) + (this.hasUnfamiliarSigils ? "*" : "");
	}
	fullSummary(i: number=-1): string {
		return `${this.nameSummary} [${this.powerCalc ? "*" : singleCharStat(i > -1 ? this.getPower(i) : this.stats[0])}${this.model.no_sacrifice?":":"/"}${this.stats[1]}] ${Card.costEmojiDisplay(this.cost, this.stats[2], this.mox)}`;
	}
	getEmbedDisplay(i: number=-1, inline: boolean=false): EmbedField {
		const stats = `Stats: \`${i >= 0 ? this.getPower(i) : (this.powerCalc ? "*" : this.stats[0])}/${this.stats[1]}\``;
		var arr = [stats, this.costEmbedDisplay];
		if (this.tribe) arr.push(`Tribe: ${this.tribe}`);
		if (this.powerCalc) arr.push(`*${this.powerString}` + (this.stats[0] ? `, ${this.stats[0] > 0 ? "plus" : "minus"} ${Math.abs(this.stats[0])}` : ""));
		if (this.isMox) arr.push(this.hasMoxSigil ? "Is a mox" : "Is considered a mox, despite lacking a mox sigil");
		if (this.noSacrifice) arr.push("Cannot be sacrificed");
		if (this.noBones) arr.push("Yields no bones on death");
		if (this.isConduit) arr.push("Acts as a conduit");
		if (this.inspectText) arr.push(`"${this.inspectText}"`);
		const sigilDesc = (sigil: sigil) => {
			const desc = sigil_data[sigil].desc;
			switch (sigil) {
				case "sealed_away":
					return `${desc} [${this.sealedCard.replaceAll("_"," ")}]`;
				case "transformer":
					return `${desc} [${this.beastMode.replaceAll("_"," ")}]`;
				case "fledgling":
					return `${desc} [${this.growsInto.replaceAll("_"," ")}]`;
				case "gem_empowered":
					// Clear the line about lowered cost for mox cards
					return this.cost === "mox" ? desc.replace(/;[^;]+$/, "") : desc;
				default:
					return desc;
			}
		}
		this.sigils.forEach(s => {
			arr.push(`_${s.split("_").join(" ")}_ ― ${sigilDesc(s)}`);
		});
		return {
			name: `${this.rare ? "✨ " : ""}${this.nameSummary}`,
			value: arr.join("\n"),
			inline: inline
		}
	}
	get inspectText(): string {
		return card_models[this.name].inspect;
	}
	get ability(): sigil {
		return [...this.sigils].find(s => sigil_data[s].active);
	}
	get player(): PlayerBattler {
		return this.battle.getPlayer(this.owner);
	}
	newOwner(owner: playerIndex) {
		this.owner = owner;
		this.humanOwner = this.battle.isHuman(owner);
	}
	addSigil(sigil: sigil): boolean {
		if (!this.sigils.has("immutable") && !this.sigils.has(sigil)) {
			this.sigils.add(sigil);
			if (sigil === "gem_empowered" && this.battle.hasMoxColor(this.owner, "green")) {
				this.stats[1] += 2;
			}
			return true;
		} else {
			return false;
		}
	}
	removeSigil(sigil: sigil): boolean {
		if (!this.sigils.has("immutable") && this.sigils.has(sigil)) {
			this.sigils.delete(sigil);
			if (sigil === "gem_empowered" && this.battle.hasMoxColor(this.owner, "green")) {
				this.stats[1] -= 2;
			}
			return true;
		} else {
			return false;
		}
	}
	absoluteIndex(i: number): number {
		return i + this.battle.fieldSize * this.owner;
	}
	get abilityDescription(): string {
		return this.ability && toProperCase(sigil_data[this.ability].desc.match(/activate: (.+)$/)[1]);
	}
	canActivate(i: number): boolean {
		if (this.cooldown >= 3) return false;
		switch (this.ability) {
			case "painter":
				return this.player.energy >= 4 && this.battle.hasAllMoxColors(this.owner);
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
				return this.player.energy >= 1;
			case "power_dice":
				return this.player.energy >= 2;
			case "energy_conduit":
				return this.battle.hasCircuit(this.owner) && this.player.energy < this.player.capacity;
			case "handy":
				return this.player.hand.length > 0;
			case "phase_shift":
				return this.player.energy >= 1 && this.battle.field[this.owner].some(c => !c);
			case "hovering":
			case "skellify":
			case "capacitor":
			case "free_paint":
				return true;
			default:
				return false;
		}
	}
	async activate(i: number): Promise<void> {
		if (!this.canActivate(i)) return;
		switch (this.ability) {
			case "capacitor":
				await this.onDeath(i);
				this.player.energy = Math.min(this.player.capacity, this.player.energy + 1);
				break;
			case "painter":
				this.player.energy -= 4;
			case "free_paint":
				await this.latchEffect(pickRandom(amorphousSigils), true);
				this.cooldown = 0;
				break;
			case "stimulate":
				this.player.energy -= 2;
				this.stats[0]++;
				break;
			case "skellify":
				this.removeSigil("skellify");
				this.addSigil("brittle");
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
				this.player.bones += 2 * this.player.energy;
				this.player.energy = 0;
				break;
			case "power_dice":
				this.player.energy -= 2;
				this.stats[0] = Math.ceil(Math.random() * 6);
				break;
			case "energy_conduit":
				this.player.energy = this.player.capacity;
				break;
			case "hovering":
				if (this.sigils.has("airborne")) this.removeSigil("airborne");
				else this.addSigil("airborne");
				this.cooldown = 0;
				break;
			case "handy":
				const discards = this.player.hand;
				this.player.hand = [];
				this.player.drawFrom(this.player.deck, true, discards.length);
				this.player.deck.cards = this.player.deck.cards.concat(discards.filter(c => c.name != this.player.sidedeck.card));
				this.removeSigil("handy");
				break;
			case "phase_shift":
				const options = this.battle.field[this.owner].map((c,j) => !c ? j : -1).filter(j => (j > -1));
				this.move(i, pickRandom(options));
				this.player.energy--;
				break;
		}
		this.cooldown = (this.cooldown ?? 0) + 1;
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
		if (this.sigils.has("pesky") && this.hammered) {
			this.removeSigil("pesky");
			return false;
		} else if (this.sigils.has("armored")) {
			this.removeSigil("armored");
			return false;
		} else {
			this.stats[1] -= (damage === Infinity ? this.stats[1] : damage);
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
		if (this.model.glitch) {
			this.transformInto(pickRandom(enabledDeckCards));
		}
		if (this.humanOwner && getModel(this.name).is_imposter) {
			this.isImposter = this.name;
			this.transformInto(
				this.player?.deck.cards.length ?
				pickRandom(this.player.deck.cards.map(c => (typeof c === "string" ? c : c.name)).filter(c => !getModel(c).is_imposter)) :
				this.player.sidedeck.card
			);
		}
		if (this.sigils.has("amorphous")) {
			do {
				this.addSigil(pickRandom(this.humanOwner ? amorphousSigils : botSigils));
			} while (Math.random() < 0.1);
			this.removeSigil("amorphous");
		}
		const hasMoxSpecialist = this.battle.getCardsWithSigil(this.owner, "gem_specialist").length > 0;
		if (this.sigils.has("random_mox")) {
			const possibleSigils: sigil[] = ["green_mox", "orange_mox", "blue_mox"];
			if (!hasMoxSpecialist) {
				this.addSigil(pickRandom(possibleSigils));
			} else {
				this.addSigil(possibleSigils[await this.battle.waitForSelection("mox_decision", this.owner, Math.floor(Math.random() * 3))]);
			}
			this.removeSigil("random_mox");
		}
		if (this.name === "mox_crystal") {
			const possibleMox: cardName[] = ["emerald_mox", "ruby_mox", "sapphire_mox"];
			if (!hasMoxSpecialist) {
				this.transformInto(pickRandom(possibleMox));
			} else {
				this.transformInto(possibleMox[await this.battle.waitForSelection("mox_decision", this.owner, Math.floor(Math.random() * 3))]);
			}
		}
	}
	async onMovement(i: number): Promise<void> {
		const other = (this.owner ? 0 : 1);
		const otherCard = this.battle.field[other][i];
		if (otherCard) {
			if (otherCard.sigils.has("sentry")) {
				this.battle.attackCard(otherCard, this, 1, this.owner, i);
				if (this.stats[1] <= 0) {
					await this.onDeath(i);
				}
			}
		}
		for (let j = 0; j < this.battle.fieldSize; j++) {
			const card = this.battle.field[this.owner][j];
			if (j != i && card?.sigils.has("clinger")) {
				const d = j > i ? 1 : -1;
				for (let k = i+d; k != j; k += d) {
					if (!this.battle.field[this.owner][k]) {
						await card.move(j, k);
					}
				}
			}
		}
	}
	async onPlay(i: number): Promise<void> {
		if (this.isImposter) {
			this.transformInto(this.isImposter);
			delete this.isImposter;
		}
		for (let j = 0; j < this.battle.fieldSize; j++) {
			this.battle.field[this.owner][j]?.hydraCheck();
		}
		if (this.humanOwner) {
			if (this.sigils.has("rabbit_hole")) {
				await this.battle.addToHand(this.createWithExtraSigils("rabbit", "rabbit_hole"), this.owner);
			}
			if (this.sigils.has("spawn_ant")) {
				await this.battle.addToHand(this.createWithExtraSigils("worker_ant", "spawn_ant"), this.owner);
			}
			if (this.sigils.has("animate_blood")) {
				await this.battle.addToHand(this.createWithExtraSigils("bloodstone", "animate_blood"), this.owner);
			}
			if (this.sigils.has("fecundity")) {
				const clone = new Card(this);
				if (FECUNDITY_NERF) {
					clone.removeSigil("fecundity");
				}
				await this.battle.addToHand(clone, this.owner);
			}
			if (this.sigils.has("battery")) {
				this.player.capacity = Math.min(MAX_ENERGY, this.player.capacity + 1);
				this.player.energy = Math.min(this.player.capacity, this.player.energy + 1);
			}
			if (this.sigils.has("item_bearer") && this.player.items.length < ITEM_LIMIT) {
				const possibleItems: itemType[] = ["black_goat", "boulder", "mrs._bomb", "frozen_opossum", "bones", "battery", "armor", "pliers", "hourglass", "fan", "lens", "skinning_knife"];
				const _isItemType = (card: cardName): card is itemType => (["squirrel", "skeleton", "mox_crystal", "empty_vessel"].includes(card));
				if (_isItemType(this.player.sidedeck.card)) {
					possibleItems.push(this.player.sidedeck.card);
				}
				this.player.items.push(new Item(pickRandom(possibleItems)));
			}
			if (this.sigils.has("gemnastics")) {
				this.player.drawFrom(this.player.deck, true, this.battle.countMox(this.owner));
			}
			if (this.model.pelt_value && this.battle.hasFreeSpace(this.owner)) {
				for (let j = 0; j < this.player.hand.length; j++) {
					const lice = this.player.hand[j];
					if (lice && lice.model.is_pelt_lice) {
						while (!(await this.battle.playCard(lice, Math.floor(Math.random() * this.battle.fieldSize), this.owner)));
						break;
					}
				}
			}
			if (this.sigils.has("hoarder")) {
				await Item.magpieLens(this.battle, this.player);
				this.removeSigil("hoarder");
			}
		}
		const other = (this.owner ? 0 : 1);
		if (this.sigils.has("magic_armor")) {
			if (!this.battle.field[other][i]) this.addSigil("armored");
			this.removeSigil("magic_armor");
		}
		if (this.sigils.has("dam_builder")) {
			await this.battle.playCard(this.createWithExtraSigils("dam", "dam_builder"), i-1, this.owner);
			await this.battle.playCard(this.createWithExtraSigils("dam", "dam_builder"), i+1, this.owner);
		}
		if (this.sigils.has("bellist")) {
			await this.battle.playCard(new Card("chime"), i-1, this.owner);
			await this.battle.playCard(new Card("chime"), i+1, this.owner);
		}
		if (this.sigils.has("cuckoo")) {
			await this.battle.playCard(new Card("broken_egg"), i, other);
		}
		this.baseHP = this.stats[1];
		if (this.sigils.has("gem_empowered") && this.battle.hasMoxColor(this.owner, "green")) this.stats[1] += 2;
		if (this.sigils.has("gem_guardian")) {
			for (let j = 0; j < this.battle.fieldSize; j++) {
				const card = this.battle.field[this.owner][j];
				if (card?.isMox) {
					card.addSigil("armored");
				}
			}
		}
		if (this.sigils.has("bomb_spewer")) {
			for (let k of [this.owner, 1-this.owner]) {
				for (let j = 0; j < this.battle.fieldSize; j++) {
					if (!this.battle.field[k][j]) {
						await this.battle.playCard(new Card("explode_bot"), j, <playerIndex>k);
					}
				}
			}
		}
		if (this.sigils.has("gem_dependent") && !this.battle.countMox(this.owner)) {
			await this.onDeath(i);
			return;
		}
		if (!this.battle.field[other][i]) {
			for (let j = 0; j < this.battle.fieldSize; j++) {
				const card = this.battle.field[other][j];
				if (i != j && card?.sigils.has("guardian")) {
					await card.move(j,i);
					break;
				}
			}
		}
		if (this.sigils.has("frenzying")) {
			this.battle.field.forEach(f => f.forEach(c => {
				if (!c) return;
				c.addSigil(pickRandom(movementSigils));
				c.sprintToLeft = Math.random() < 0.5;
			}));
		}
		await this.onMovement(i);
	}
	async onHit(attacker: Card): Promise<void> {
		if (this.humanOwner) {
			if (this.sigils.has("beehive")) {
				await this.battle.addToHand(this.createWithExtraSigils("bee", "beehive"), this.owner);
			}
			if (this.sigils.has("vessel_printer")) {
				await this.battle.addToHand(this.createWithExtraSigils("empty_vessel", "vessel_printer"), this.owner);
			}
		}
		if (this.sigils.has("spikey")) {
			attacker.stats[1]--;
			if (this.sigils.has("death_touch") && !attacker.sigils.has("stone")) {
				attacker.stats[1] = 0;
			}
		}
		if (this.sigils.has("swapper") && this.stats[1]) {
			this.stats = [this.stats[1], this.stats[0], this.stats[2]];
		}
		const chime_trigger = this.model.chime_trigger;
		if (chime_trigger) {
			for (let i = 0; i < this.battle.fieldSize; i++) {
				const daus = this.battle.field[this.owner][i];
				if (daus && daus.name === chime_trigger) {
					if (attacker.sigils.has("armored")) {
						attacker.removeSigil("armored");
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
		this.battle.field[this.owner][i] = null;
		if (this.isWide) this.battle.field[this.owner].fill(null);
		this.stats[1] = Math.min(this.stats[1], 0);
		const player = this.player;
		const other = (this.owner === 0) ? 1 : 0;
		let deaths = 1 + this.battle.getCardsWithSigil(this.owner, "double_death").length;
		if (this.name === "pack_mule" && this.battle.isHuman(other)) {
			const otherPlayer = this.battle.getPlayer(other);
			await otherPlayer.addToHand(new Card("squirrel"));
			await otherPlayer.addToHand(new Card(pickRandom(enabledDeckCards.filter(c => (getModel(c).cost === "blood" && getModel(c).stats[2] === 1)))));
			await otherPlayer.addToHand(new Card(pickRandom(enabledDeckCards.filter(c => (getModel(c).cost === "blood" && getModel(c).stats[2] === 2)))));
			await otherPlayer.addToHand(new Card(pickRandom(enabledDeckCards.filter(c => (getModel(c).cost === "bones" && getModel(c).stats[2] <= 6)))));
		}
		if (this.sigils.has("sealed_away") && !this.hammered) {
			deaths = 1;
			await this.battle.playCard(this.createWithExtraSigils(this.sealedCard, "sealed_away"), i, this.owner);
		} else if (this.battle.isHuman(this.owner)) {
			if (this.sacrificedFor !== i) {
				for (let j = 0; j < player.hand.length; j++) {
					if (player.hand[j].sigils.has("corpse_eater")) {
						deaths = 1;
						const card = player.hand.splice(j,1)[0];
						await this.battle.playCard(card, i, this.owner);
						break;
					}
				}
			}
			if (this.sigils.has("haunter")) {
				this.name = "spirit";
				this.stats = [...getModel("spirit").stats];
				await this.battle.addToHand(this, this.owner);
				deaths = 1;
			} else if (this.sigils.has("undying")) {
				this.stats[1] = this.baseHP || getModel(this.name).stats[1];
				if (this.model.undying_powerup) {
					this.stats[0] += deaths;
					this.stats[1] += deaths;
				}
				await this.battle.addToHand(this, this.owner);
				deaths = 1;
			}
		}
		if (this.sigils.has("exploding_guts")) {
			for (const k of [0,1]) {
				for (let j = 0; j < this.battle.fieldSize; j++) {
					if (!this.battle.field[k][j]) {
						this.battle.playCard(this.createWithExtraSigils("guts", "exploding_guts"), j, <playerIndex>k);
					}
				}
			}
		}
		while (deaths--) {
			if (this.sigils.has("gift_bearer")) {
				const cardPool = this.model.fish_gifts ? ["bad_fish", "good_fish", "more_fish"] : playerDeckCards;
				await this.battle.addToHand(new Card(pickRandom(cardPool)), this.owner);
			}
			if (this.sigils.has("steel_trap")) {
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
			if (this.sigils.has("brittle_latch")) await this.latchEffect("brittle");
			if (this.sigils.has("bomb_latch")) await this.latchEffect("detonator");
			if (this.sigils.has("shield_latch")) await this.latchEffect("armored");
			if (this.sigils.has("annoying_latch")) await this.latchEffect("annoying");
			if (this.sigils.has("stun_latch")) await this.latchEffect("stunned");
			if (this.sigils.has("detonator") || this.isMox &&
			this.battle.getCardsWithSigil(this.owner, "gem_detonator").length + this.battle.getCardsWithSigil(other, "gem_detonator").length > 0) {
				// shouldn't be necessary to delete the sigil, but just in case, to avoid infinite loop
				this.removeSigil("detonator");
				if (this.battle.field[other][i]) await this.battle.field[other][i].takeDamage(i, 10);
				if (i-1 >= 0 && this.battle.field[this.owner][i-1]) await this.battle.field[this.owner][i-1].takeDamage(i-1, 10);
				if (i+1 < this.battle.fieldSize && this.battle.field[this.owner][i+1]) await this.battle.field[this.owner][i+1].takeDamage(i+1, 10);
			}
		}
		if (this.isMox && !this.battle.countMox(this.owner)) {
			for (let j = 0; j < this.battle.fieldSize; j++) {
				const card = this.battle.field[this.owner][j];
				if (card?.sigils.has("gem_dependent")) {
					await card.onDeath(j);
					if (this.battle.countMox(this.owner)) break;
				}
			}
		}
		// Last green mox is destroyed, update health of gem_empowered cards
		if (this.sigils.has("green_mox") && !this.battle.hasMoxColor(this.owner, "green")) {
			for (let j = 0; j < this.battle.fieldSize; j++) {
				const card = this.battle.field[this.owner][j];
				if (card?.sigils.has("gem_empowered")) {
					card.stats[1] -= 2;
					if (card.stats[1] <= 0) {
						await card.onDeath(j);
					}
				}
			}
		}
	}
	async onSacrifice(i: number, card: Card, t: number): Promise<void> {
		if (!this.blood) return;
		this.player.blood += this.blood;
		this.player.sacrifices++;
		if (this.sigils.has("morsel")) {
			card.stats[0] += this.stats[0];
			card.stats[1] += this.stats[1];
		}
		if (!this.sigils.has("many_lives")) {
			this.sacrificedFor = t;
			await this.onDeath(i);
			delete this.sacrificedFor;
		}
		if (this.sigils.has("haunter")) {
			for (const sigil of this.sigils) {
				card.addSigil(sigil);
			}
			this.sigils.clear();
		}
		if (this.name === "child_13") {
			this.awakened = !this.awakened;
			if (this.awakened) {
				this.stats[0] += 2;
				this.addSigil("airborne");
			} else {
				this.stats[0] = Math.max(0, this.stats[0] - 2);
				this.removeSigil("airborne");
			}
		}
		if (this.model["9lives"]) {
			this.sacrifices = (this.sacrifices || 0) + 1;
			if (this.sacrifices === 9) {
				this.name = this.model["9lives"];
				this.stats = [...getModel(this.name).stats];
				this.removeSigil("many_lives");
			}
		}
	}
	async onKill(): Promise<void> {
		if (this.sigils.has("blood_lust")) {
			this.stats[0]++;
		}
	}
	async onSetup(i: number): Promise<void> {
		if (this.sigils.has("waterborne") && this.model.kraken) {
			const tentacles = ["bell_tentacle", "hand_tentacle", "mirror_tentacle"];
			this.name = pickRandom(tentacles);
			this.stats = [...getModel(this.name).stats];
			this.removeSigil("waterborne");
		}
		if (this.sigils.has("fledgling")) {
			const base_model = getModel(this.name);
			const grows_into = base_model.grows_into;
			this.removeSigil("fledgling");
			if (grows_into) {
				this.transformInto(grows_into);
			} else {
				this.stats[0] += 1;
				this.stats[1] += 2;
			}
		}
		if (this.sigils.has("withering")) {
			this.stats[1]--;
			if (this.stats[1] <= 0) {
				this.onDeath(i);
			}
		}
		if (this.sigils.has("transformer")) {
			this.awakened = !this.awakened;
			const beastModel = card_models[this.beastMode];
			this.stats[0] += (this.awakened ? 1 : -1) * (beastModel.stats[0] - this.model.stats[0]);
			for (const sigil of beastModel.sigils) {
				if (this.awakened) this.addSigil(sigil);
				else this.removeSigil(sigil);
			}
		}
		if (this.humanOwner) {
			if (this.sigils.has("digger")) {
				this.player.bones++;
			}
			if (this.sigils.has("beast_summon")) {
				const summon = new Card(pickRandom(cardPools["bloodTheme"].filter(c => {
					const model = getModel(c);
					return model.cost === "blood" && model.stats[2] >= 1 && !model.rare;
				})));
				summon.addSigil("gem_dependent");
				await this.player.addToHand(summon);
			}
		}
		this.cooldown = Math.max(0, (this.cooldown ?? 0) - 1);
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
			this.removeSigil(sigil);
		}
		for (const sigil of new_model.sigils) {
			this.addSigil(sigil);
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
			const _countTribe = (card: Card) => {
				if (!card) return;
				if (card.tribe === "all") tribes.all++;
				else if (card.tribe) tribes[card.tribe] = 1;
			}
			for (let k = 0; k <= 1; k++) {
				this.battle.field[k].forEach(_countTribe);
			}
			this.player.hand.forEach(_countTribe);
			
			if (tribes.canine + tribes.insect + tribes.reptile + tribes.avian + tribes.hooved + tribes.all >= 3) {
				this.transformInto("hydra");
			}
		}
	}
	async dependencyCheck(): Promise<void> {
		
	}
	createWithExtraSigils(cardName: cardName, sigil: sigil=null): Card {
		const card = new Card(cardName);
		this.copyExtraSigils(card);
		if (sigil) card.removeSigil(sigil);
		return card;
	}
	copyExtraSigils(target: Card): void {
		for (const sigil of this.sigils) {
			if (!getModel(this.name).sigils.includes(sigil) && sigil != "haunter") {
				target.addSigil(sigil);
			}
		}
	}
	async latchEffect(sigil: sigil, isPaint: boolean=false): Promise<void> {
		if (this.battle.field.some(arr => arr.some(card => card && !card.sigils.has(sigil) && !card.sigils.has("immutable")))) {
			const card = this.battle.getAbsoluteIndex(await this.battle.waitForSelection(isPaint ? "paint" : "latch", this.owner, 0, [sigil]));
			if (card && !card.sigils.has(sigil)) {
				card.addSigil(sigil);
			}
		}
	}
	getCost(): number {
		var cost = this.stats[2];
		if (this.sigils.has("gem_empowered") && this.battle?.hasMoxColor(this.owner, "blue")) {
			cost -= (this.cost === "bones" ? 2 : 1);
		}
		return Math.max(0, cost);
	}
	get powerCalc(): string {
		return card_models[this.name].power_calc;
	}
	get powerString(): string {
		switch (this.powerCalc) {
			case "ant":
				return "Power equal to # ants on your side of the field"
			case "mirror":
				return "Power equal to that of the opposing creature"
			case "bell":
				return "More powerful when closer to the bell"
			case "hand":
				return "Power equal to # cards in your hand"
			case "bones":
				return "Power equal to half your # of bones"
			case "sacrifices":
				return "Power equal to # of sacrifices made this turn"
			case "mox":
				return "Power equal to # mox on your side of the field"
			case "sigils":
				return "Power equal to # sigils this card has"
			case "damage":
				return "More powerful as this card takes damage"
			case "discharge":
				return "Power equal to used energy capacity"
			default:
				return ""
		}
	}
	getPower(i: number): number {
		const other = (this.owner ? 0 : 1);
		const arr = this.isWide ? [...Array(this.battle.fieldSize).keys()] : [i];
		var power: number = this.stats[0];
		switch (this.powerCalc) {
			case "ant":
				power = this.battle.field[this.owner].filter(c => c?.powerCalc === "ant").length;
				break;
			case "mirror":
				for (let j of arr) {
					const otherCard = this.battle.field[other][j];
					if (otherCard && otherCard.model.power_calc != "mirror") {
						power = Math.max(power, otherCard.getPower(j));
					}
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
			case "discharge":
				power = Math.floor(this.player.capacity - this.player.energy);
				break;
			case "damage":
				power = Math.max(0, (this.baseHP || getModel(this.name).stats[1]) - this.stats[1]);
				break;
		}
		if (this.powerCalc) power += getModel(this.name).stats[0]; // in all vanilla cases, this does nothing
		if (!this.isWide) {
			if (this.battle.field[this.owner][i-1]?.sigils.has("leader")) power++;
			if (this.battle.field[this.owner][i+1]?.sigils.has("leader")) power++;
		}
		var opposed = false;
		for (let j of arr) {
			if (!this.battle.field[other][j]) continue;
			opposed = true;
			if (this.battle.field[other][j]?.sigils.has("annoying")) power++;
			if (this.battle.field[other][j]?.sigils.has("stinky") && !this.sigils.has("stone")) power--;
		}
		if (!opposed && this.sigils.has("opportunist")) power++;
		else if (opposed && this.sigils.has("combative")) power++;
		if (this.sigils.has("gem_empowered") && this.battle.hasMoxColor(this.owner, "orange")) power++;
		if (this.isMox) power += this.battle.getCardsWithSigil(this.owner, "gem_animator").length;
		const circuit = this.battle.getCircuit(this.owner, i);
		if (circuit) {
			if (circuit[0].sigils.has("buff_conduit")) power++;
			if (circuit[1].sigils.has("buff_conduit")) power++;
			if (this.sigils.has("powered_buff")) power += 2;
		}
		return Math.max(0, power);
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
					if (mox === "any") {
						if (this.battle.countMox(this.owner) === 0) return false;
					} else if (!this.battle.hasMoxColor(this.owner, mox)) {
						return false;
					}
				}
				return true;
		}
	}
	get moveDirection(): number {
		const movementSigils: sigil[] = ["sprinter", "skeleton_crew", "hefty", "rampager", "jumper", "rolling"];
		return movementSigils.some(s => this.sigils.has(s)) ? (this.sprintToLeft ? -1 : 1) : 0;
	}
	get model(): CardModel {
		return card_models[this.name];
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
	get hasUnfamiliarSigils(): boolean {
		const model = getModel(this.name);
		const sigils = this.sigils;
		for (const sigil of sigils) {
			switch (sigil) {
				case "armored":
					if (!model.sigils.includes(sigil) && !model.sigils.includes("magic_armor")) return true;
					break;
				case "green_mox":
				case "orange_mox":
				case "blue_mox":
					if (!model.sigils.includes(sigil) && !model.sigils.includes("random_mox")) return true;
					break;
				default:
					if (!model.sigils.includes(sigil)) return true;
			}
		}
		for (const sigil of model.sigils) {
			switch (sigil) {
				case "magic_armor":
					if (!sigils.has(sigil) && !sigils.has("armored")) return true;
					break;
				case "random_mox":
					if (!sigils.has(sigil) && !["green_mox", "orange_mox", "blue_mox"].some((s: sigil) => sigils.has(s))) return true;
					break;
				default:
					if (!sigils.has(sigil)) return true;
			}
		}
		return false;
	}
	get isModified(): boolean {
		const model = getModel(this.name);
		if (this.stats[0] != model.stats[0] || this.stats[1] != model.stats[1]) return true;
		return this.hasModifiedSigils;
	}
	get abbrev(): string {
		if (this.model.abbrev) return this.model.abbrev;
		return this.model.abbrev || (this.name.match(" ") ? this.name.split(" ").map(c => c[0]).join("") : this.name.substring(0, 3));
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
		return !!getModel(this.name).no_sacrifice && !(this.battle && this.battle.getCardsWithSigil(this.owner, "animate_blood").length);
	}
	get isConduit(): boolean {
		return !!getModel(this.name).is_conduit;
	}
	get isMox(): boolean {
		return !!getModel(this.name).is_mox;
	}
	get hasMoxSigil(): boolean {
		return ["blue_mox", "orange_mox", "green_mox", "random_mox"].some((s: sigil) => this.sigils.has(s));
	}
	get isWide(): boolean {
		return getModel(this.name).wide;
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
				return "canine_tail";
			case "hooved":
				return "furry_tail";
			default:
				return this.cost === "mox" ? "sparkling_dust" : "tail";
		}
	}
	get pelt(): cardName {
		switch (this.tribe) {
			case "canine":
				return "wolf_pelt";
			default:
				return this.rare ? "golden_pelt" : (this.cost === "energy" ? "holopelt" : "rabbit_pelt");
		}
	}
	get sealedCard(): cardName {
		return this.model.sealed_away ?? SEALED_AWAY_DEFAULT;
	}
	get beastMode(): cardName {
		return this.model.beast_mode ?? TRANSFORMER_DEFAULT;
	}
	get growsInto(): cardName {
		return this.model.grows_into ?? this.name;
	}
	get cost(): cardCost {
		return getModel(this.name).cost || "free";
	}
	get costEmoji(): string {
		return costEmoji[this.cost] || "";
	}
	static costEmojiDisplay(cost: cardCost, amount: number, mox: moxColor[]): string {
		switch (cost) {
			case "blood":
			case "bones":
			case "energy":
				return `${amount}x${costEmoji[cost]}`;
			case "mox":
				return mox.map(c => costEmoji[`${c}_mox`]).join("");
			case "free":
				return "free";
		}
	}
	get costEmbedDisplay(): string {
		switch (this.cost) {
			case "blood":
			case "bones":
			case "energy":
				return `Costs: ${this.getCost()}x${this.costEmoji}${this.cost}`;
			case "mox":
				return `Requires: ${this.mox.map(m => costEmoji[`${m}_mox`]).join("")} mox`;
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
		if (this.sigils.has("transformer")) {
			const beastModel = card_models[this.beastMode];
			extraValue += beastModel.stats[0];
			for (const sigil of beastModel.sigils) {
				extraValue += sigil_data[sigil].power / 2;
			}
			extraValue = Math.ceil(extraValue);
		}
		if (this.sigils.has("sealed_away") && this.model.sealed_away) {
			extraValue += Math.ceil((getModel(this.model.sealed_away).rawValue ?? (new Card(this.model.sealed_away)).cardRawValue) / 2);
		}
		if (this.isConduit) extraValue++;
		if (this.model.trail) extraValue++;
		if (this.model.undying_powerup) extraValue += 3;
		switch (this.model.power_calc) {
			case "discharge":
				extraValue += 8;
				break;
			case "bones":
			case "bell":
			case "hand":
				extraValue += 6;
				break;
			case "mox":
				extraValue += 4;
				break;
			case "ant":
			case "sacrifices":
			case "mirror":
			case "sigils":
				extraValue += 3;
				break;
			case "damage":
				extraValue += 2;
				break;
		}
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
			case "bones":
				costValue = this.stats[2];
				break;
			case "mox":
				if (!this.mox) {
					console.error(`Error: ${this.name} has mox cost, but .mox property isn't defined!`);
					break;
				}
				for (let mox of this.mox) {
					if (mox === "any") costValue += 1;
					else costValue += 3;
				}
				break;
		}
		return this.cardRawValue - costValue;
	}
}
@jsonObject({ beforeSerialization: "beforeSerialization", onDeserialized: "onDeserialized" })
export class Deck implements Drawable {
	cards: (Card|cardName)[];
	@jsonArrayMember(String)
	_cardNames: cardName[];
	@jsonArrayMember(Card)
	_cardObjects: Card[];
	constructor(cards: (Card|cardName)[] = []) {
		this.cards = cards.map(c => Card.copyCard(c));
	}
	beforeSerialization(): void {
		this._cardNames = [];
		this._cardObjects = [];
		this.cards.forEach(c => {
			if (typeof c === "string") {
				this._cardNames.push(c);
			} else if (!c.isModified) {
				this._cardNames.push(c.name);
			} else {
				this._cardObjects.push(c);
			}
		})
	}
	onDeserialized(): void {
		this.cards = (<(Card|cardName)[]>this._cardNames).concat(this._cardObjects);
	}
	draw(i: number=null): Card {
		if (this.cards.length > 0) {
			if (i === null || i < 0 || i >= this.cards.length) i = Math.floor(Math.random() * this.cards.length);
			return Card.castCardName((this.cards.splice(i, 1))[0]);
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
	card: cardName;
	count: number;
	constructor(card: cardName, count: number=20) {
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
		switch (this.type) {
			case "hammer":
				return battle.field[player].some(c => c);
			default:
				return true;
		}
	}
	static async skinningKnife(card: Card, i: number): Promise<void> {
		if (card && card.stats[1] > 0 && !card.model.uncuttable) {
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
			battle.field[0][i] = battle.field[0][i+1];
		}
		for (let i = battle.fieldSize-1; i > 0; i--) {
			battle.field[1][i] = battle.field[1][i-1];
		}
		battle.field[0][battle.fieldSize-1] = traitor1;
		battle.field[1][0] = traitor2;
		traitor1?.newOwner(0);
		traitor2?.newOwner(1);
	}
	static async magpieLens(battle: Battle, player: PlayerBattler): Promise<void> {
		if (!player.deck.cards.length) return;
		const select = await battle.waitForSelection("magpie", player.index, Math.floor(Math.random() * player.deck.cards.length));
		await player.addToHand(player.deck.draw(select));
	}
	get description(): string {
		switch (this.type) {
			case "squirrel":
			case "black_goat":
			case "boulder":
			case "frozen_opossum":
			case "mrs._bomb":
				return `Draw a ${toProperFormat(this.type)}`;
			case "bones":
				return "Gain 4 bones";
			case "battery":
				return "Refill energy to capacity";
			case "armor":
				return "Give all your cards armored sigil";
			case "pliers":
				return "Place 1 damage on the scales";
			case "fan":
				return "For the next turn, your cards have the airborne sigil effect";
			case "hourglass":
				return "Skip the opponent's next turn";
			case "wiseclock":
				return "Rotate cards clockwise on the field";
			case "skinning_knife":
				return "Destroy target card, yielding a pelt";
			case "lens":
				return "Choose a card to draw from your deck";
			case "hammer":
				return "Hammer one of your cards";
		}
	}
	async use(battle: Battle, player: playerIndex): Promise<boolean> {
		if (!this.isUsable(battle, player)) return false;
		switch (this.type) {
			case "squirrel":
			case "skeleton":
			case "empty_vessel":
			case "mox_crystal":
			case "black_goat":
			case "boulder":
			case "mrs._bomb":
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
				battle.field[player].forEach(c => c?.addSigil("armored"));
				break;
			case "pliers":
				await battle.damage(player ? -1 : 1);
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
				const select = await battle.waitForSelection("skinning_knife", player, 0);
				await Item.skinningKnife(battle.getAbsoluteIndex(select), select%battle.fieldSize);
				break;
			case "hammer":
				await battle.getPlayer(player).useHammer(await battle.waitForSelection("hammer", player, 0), true);
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
	ended: boolean = false;
	winner: playerIndex;
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
		this.terrain = terrain;
	}
	async placeTerrain(terrain: cardName): Promise<void> {
		if (this.isSolo() && this.candles[1] >= 3) {
			if (terrain === "moleman") await this.playCard(new Card("moleman"), Math.floor(Math.random() * this.fieldSize), 1);
			return;
		}
		if (!terrain) return;
		if (terrain === "bridge_rails") {
			for (let k of [0,1]) {
				await this.playCard(new Card("bridge_rails"), 0, <playerIndex>k);
				await this.playCard(new Card("bridge_rails"), this.fieldSize-1, <playerIndex>k);
			}
			const bot = this.getBot();
			if (bot) {
				bot.cardsLeft += 2;
				await bot.playBackfield("bridge_rails", 0);
				await bot.playBackfield("bridge_rails", this.fieldSize-1);
			}
		} else {
			await this.playCard(new Card(terrain), Math.floor(Math.random() * this.fieldSize), 0);
			await this.playCard(new Card(terrain), Math.floor(Math.random() * this.fieldSize), 1);
		}
	}
	get actor(): playerIndex {
		return <playerIndex>(this.turn % 2);
	}
	uponSelect: (source: selectSource, player: playerIndex, defaultVal: number, args: string[])=>Promise<number>;
	async waitForSelection(source: selectSource, player: playerIndex, defaultVal: number, args: string[]=[]): Promise<number> {
		const promise = new Promise<number>(async(resolve) => {
			const result = this.uponSelect ? await this.uponSelect(source, player, defaultVal, args) : defaultVal;
			resolve(result);
		});
		promise.catch(console.error);
		return await promise;
	}
	async damage(amount: number, player: playerIndex=this.actor): Promise<boolean> {
		this.scale += amount * (player ? -1 : 1);
		if (Math.abs(this.scale) >= this.goal) {
			return await this.candleOut(this.scale < 0 ? 0 : 1);
		}
		return false;
	}
	async candleOut(player: playerIndex): Promise<boolean> {
		this.candles[player]--;
		if (this.candles[player] <= 0) {
			return true;
		} else {
			this.scale = 0;
			await this.onCandleOut(player);
			return false;
		}
	}
	async setupTurn(): Promise<void> {
		const actor = this.actor;
		for (var i = 0; i < this.fieldSize; i++) {
			const card = this.field[actor][i];
			if (!card) continue;
			await card.onSetup(i);
		}
		await this.players[actor].setupTurn();
	}
	async setupFirstTurn(): Promise<void> {
		await this.placeTerrain(this.terrain);
		for (const player of this.players) {
			await player.setupFirstTurn();
		}
		await this.setupTurn();
	}
	async attackCard(attacker: Card, target: Card, power: number, owner: playerIndex, j: number): Promise<number> {
		var damage = 0;
		const prevHealth = target.stats[1];
		if (await target.takeDamage(j, attacker.sigils.has("death_touch") && !target.sigils.has("stone") ? Infinity : power)) {
			await target.onHit(attacker);
			if (attacker.sigils.has("blood_guzzler") && prevHealth > target.stats[1] && !target.sigils.has("stone")) {
				attacker.stats[1]++;
			}
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
		if (card.sigils.has("sniper")) {
			j = await this.waitForSelection("sniper", player, Math.floor(Math.random() * this.fieldSize));
		}

		if (!(j >= 0 && j < this.fieldSize)) return 0;
		var damage = 0;

		const other = (player ? 0 : 1);
		var otherCard = this.field[other][j];
	
		const power = card.getPower(i);
		if (power <= 0) return 0;
	
		if (!otherCard) {
			for (let k = 0; k < this.fieldSize; k++) {
				const burrower = this.field[other][k];
				if (burrower && burrower.sigils.has("burrower") && (!card.sigils.has("airborne") || burrower.sigils.has("mighty_leap"))) {
					await burrower.move(k, j);
					otherCard = burrower;
					break;
				}
			}
			const otherPlayer = this.getPlayer(other);
			if (!otherCard && this.isHuman(other) && otherPlayer.hand.some(card => card.sigils.has("lemming"))) {
				const k = otherPlayer.hand.indexOf(otherPlayer.hand.find(card => card.sigils.has("lemming")));
				otherCard = otherPlayer.hand.splice(k,1)[0];
				await this.playCard(otherCard, j, other);
			}
		}
		if (otherCard && (!otherCard.sigils.has("waterborne") || card.sigils.has("fisher")) &&
			(otherCard.sigils.has("mighty_leap") || !(card.sigils.has("airborne") || this.isHuman(player) && this.getPlayer(player).fanUsed))) {
			if (!otherCard.sigils.has("repulsive")) {
				if (otherCard.sigils.has("loose_tail")) {
					let d = (j+1 < this.fieldSize && !this.field[other][j+1]) ? 1 : -1;
					if (j+d > 0 && !this.field[other][j+d]) {
						await otherCard.move(j, j+d);
						otherCard.removeSigil("loose_tail");
						await this.playCard(otherCard.createWithExtraSigils(otherCard.tail, "loose_tail"), j, other);
						otherCard = this.field[other][j];
					}
				}
				if (otherCard) {
					if (card.sigils.has("infectious")) {
						otherCard.addSigil("zombified");
					}
					const stinger = card.sigils.has("stinger");
					damage = await this.attackCard(card, otherCard, power + (stinger ? 2 : 0), other, j);
					if (stinger) {
						card.stats[0] = 0;
						card.addSigil("withering");
						card.removeSigil("stinger");
					}
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
		return damage;
	}
	async playCard(card: Card, i: number, player: playerIndex=this.actor): Promise<boolean> {
		await card.onDraw(this, player);
		if (i < 0 || i >= this.fieldSize || this.field[player][i] || card.isWide && this.field[player].some(c => c)) return false;
		this.field[player][i] = card;
		if (card.isWide) this.field[player].fill(card);
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
		const other = actor ? 0 : 1;
		var damage = 0;
		for (let i = 0; i < this.fieldSize; i++) {
			const card = this.field[actor][i];
			if (!card || i > 0 && card.isWide) continue;
			if (card.sigils.has("gem_dependent") && this.countMox(actor) <= 0) {
				await card.onDeath(i);
				continue;
			}
			if (card.sigils.has("stunned")) {
				card.removeSigil("stunned");
				continue;
			}
			if (card.getPower(i) > 0) {
				if (card.sigils.has("zombified")) {
					damage -= card.getPower(i);
					break;
				}

				let subdamage = 0;
				if (card.sigils.has("moon_strike")) {
					if (this.field[other].some(c => c && !c.sigils.has("repulsive") && (!c.sigils.has("waterborne") || card.sigils.has("fisher")))) {
						for (let j = 0; j < this.fieldSize; j++) {
							if (this.field[other][j]) await this.attackField(i, j);
						}
					} else {
						damage += card.getPower(0);
					}
					continue;
				}
				const trifurcated = card.sigils.has("trifurcated") || card.sigils.has("powered_trifurcated") && this.getCircuit(actor, i);
				if (trifurcated) {
					subdamage += await this.attackField(i, i-1) + await this.attackField(i, i) + await this.attackField(i, i+1);
				}
				if (card.sigils.has("bifurcated")) {
					subdamage += await this.attackField(i, i-1) + await this.attackField(i, i+1);
				} else if (!trifurcated) {
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
			const rolling = card.sigils.has("rolling");
			const rampager = card.sigils.has("rampager");
			const hefty = card.sigils.has("hefty");
			const jumper = card.sigils.has("jumper");
			const trail = card.model.trail;
			if (card.sigils.has("sprinter") || card.sigils.has("skeleton_crew") || rolling || rampager || hefty || jumper) {
				let d = (card.sprintToLeft ? -1 : 1);
				let t = i + d;
				if (t < 0 || t >= this.fieldSize || (this.field[actor][t] && !rampager && !(jumper && this.emptySpaceInDirection(actor, i, d) > -1))) {
					card.sprintToLeft = !card.sprintToLeft;
					d = -d;
					t = i + d;
				}
				if (t < 0 || t >= this.fieldSize) continue;
				if (rolling) {
					while (t >= 0 && t < this.fieldSize && !this.field[actor][t]) t += d;
					t -= d;
					if (t !== i && !this.field[actor][t]) {
						card.moved = true;
						await card.move(i, t);
					}
				} else if (jumper) {
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
		for (let i = 0; i < this.fieldSize; i++) {
			const card = this.field[actor][i];
			if (!card) continue;
			if (card.sigils.has("ant_source") && this.isHuman(actor)) {
				await this.getPlayer(actor).addToHand(card.createWithExtraSigils("ant_larva", "ant_source"));
			}
			if (card.sigils.has("decoy") && !this.field[other][i]) {
				this.field[other][i] = card;
				this.field[actor][i] = null;
				card.newOwner(other);
				card.removeSigil("decoy");
				await card.onMovement(i);
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
			this.winner = actor;
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
		if (mox === "any") {
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
	hasAllMoxColors(player: playerIndex): boolean {
		return this.hasMoxColor(player, "blue") && this.hasMoxColor(player, "green") && this.hasMoxColor(player, "orange");
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
	getAbsoluteIndex(index: number): Card {
		return this.field[Math.floor(index/this.fieldSize)%2][index%this.fieldSize];
	}
	getCardsWithSigil(player: playerIndex, sigil: sigil): Card[] {
		return this.field[player].filter(card => card && card.sigils.has(sigil));
	}
	countBlood(player: playerIndex, maxRawValue: number=Infinity): number {
		return this.field[player].reduce((v,card) => (v + (card?.blood || 0)), 0);
		/*const sacrifices = this.field[player].filter(c => c && c.blood).sort((a,b) => a.sacrificePriority - b.sacrificePriority);
		var blood = 0;
		var valueTotal = 0;
		for (const card of sacrifices) {
			valueTotal += card.cardRawValue;
			if (valueTotal >= maxRawValue) continue;
			blood += card.blood || 0;
		}
		return blood;*/
	}
	countMox(player: playerIndex): number {
		return this.field[player].reduce((v,card)=>(v+(card?.isMox?1:0)),0);
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
				return player.sidedeck.count > 0;
			case "hammer":
				return this.field[this.actor].some(c => c);
		}
	}
	get candleDisplay(): string {
		return `${"i".repeat(this.candles[0])}(${("").padStart(Math.min(this.goal, Math.max(0, -this.scale)), "*").padStart(this.goal, " ")}/${("").padEnd(Math.min(this.goal, Math.max(0, this.scale)), "*").padEnd(this.goal, " ")})${"i".repeat(this.candles[1])}${Math.abs(this.scale)>this.goal?` +${Math.abs(this.scale)-this.goal}`:""}`;
	}
	abstract onCandleOut(player: playerIndex): Promise<void>;
	abstract getPlayer(player: playerIndex): PlayerBattler;
	abstract getBot(): AutoBattler;
	abstract isHuman(player: playerIndex): boolean;
	abstract isSolo(): boolean;
	abstract isDuel(): boolean;
}
export class SoloBattle extends Battle {
	player: PlayerBattler;
	bot: AutoBattler;
	constructor(player: Player, difficulty: number, options: BattleOptions) {
		super(options);
		this.player = player.battlerInstance(this, 0);
		this.bot = new AutoBattler(this, difficulty, options.candles > 1);
		this.players = [this.player, this.bot];
		this.candles[0] = 1;
	}
	async onCandleOut(player: playerIndex): Promise<void> {
		if (player === 1) {
			this.bot.cardsLeft += this.bot.difficulty;
			await this.bot.doBossEffect();
			this.player.hourglassUsed = true;
		}
	}
	getPlayer(): PlayerBattler {
		return this.player;
	}
	getBot(): AutoBattler {
		return this.bot;
	}
	isHuman(player: playerIndex): boolean {
		return (player === 0);
	}
	isSolo(): this is SoloBattle {
		return true;
	}
	isDuel(): this is DuelBattle {
		return false;
	}
}
export class DuelBattle extends Battle {
	players: PlayerBattler[]=[];
	constructor(player1: Player, player2: Player, options: BattleOptions) {
		super(options);
		this.players = [player1.battlerInstance(this, 0), player2.battlerInstance(this, 1)];
	}
	async onCandleOut(player: playerIndex): Promise<void> {
		await this.players[player].addToHand(new Card("greater_smoke"));
	}
	getPlayer(player: playerIndex): PlayerBattler {
		return this.players[player];
	}
	getBot(): AutoBattler {
		return null;
	}
	isHuman(player: playerIndex): boolean {
		return true;
	}
	isSolo(): this is SoloBattle {
		return false;
	}
	isDuel(): this is DuelBattle {
		return true;
	}
}

export interface Battler {
	setupTurn(): Promise<void>;
	overkillDamage(amount: number, i: number): void;
	performAction(): Promise<boolean>;
	setupFirstTurn(): Promise<void>;
	get candles(): number;
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
	async setupFirstTurn(): Promise<void> {
		await this.drawFrom(this.sidedeck, true);
		// Guaranteed to draw at least one low-cost card
		await this.drawFrom(this.deck, true, 1, (card: Card|cardName): boolean => {
			if (card instanceof Card) {
				return card.stats[2] <= 1 && !card.isModified && !card.isMox;
			} else {
				return getModel(card).stats[2] <= 1 && !getModel(card).is_mox;
			}
		});
		await this.drawFrom(this.deck, true, 2);
	}
	get candles(): number {
		return this.battle.candles[this.index];
	}
	get display(): string {
		const cards = `Cards: ${this.hand.length.toString().padStart(2, " ")}/${this.deck.cards.length.toString().padEnd(2, " ")}`;
		const mox = `m(${["blue", "green", "orange"].map(c => this.battle.hasMoxColor(this.index, <moxColor>c) ? c[0].toUpperCase() : " ").join("")})`;
		const energy = `[${"".padStart(this.energy, "#").padStart(this.capacity, "0").padStart(MAX_ENERGY, ".")}]`;
		const bones = `${this.bones}//`;
		return `${cards} ${mox} ${energy} ${bones}`;
	}
	get sidedeckIcon(): string {
		return sidedeckEmoji[this.sidedeck.card] ?? sidedeckEmoji.squirrel;
	}
	async setupTurn(): Promise<void> {
		this.drawn = (this.battle.turn < 2);
		this.sacrifices = 0;
		this.capacity = Math.min(MAX_ENERGY, this.capacity + 1);
		this.energy = this.capacity;
		this.fanUsed = false;
		this.hourglassUsed = false;
		if (this.battle.turn === 0 && this.battle.candles[0] < this.battle.candles[1]) {
			for (let i = 1; i < this.battle.candles[1]; i++) {
				await this.addToHand(new Card("the_smoke"));
			}
		}
		if (!this.items.some(item => item.type === "hammer") && this.items.length < ITEM_LIMIT) {
			this.items.push(new Item("hammer"));
		}
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
		if (this.totem && (card.tribe === this.totem.tribe || card.tribe === "all")) {
			card.addSigil(this.totem.sigil);
		}
		await card.onDraw(this.battle, this.index);
		this.hand.push(card);
	}
	async playFromHand(h: number, i: number): Promise<boolean> {
		const card = this.hand[h];
		if (!card || !card.isPlayable(card.cardRawValue) || this.battle.field[this.index][i]) return false;
		const cost = card.getCost();
		switch (card.cost) {
			case "blood":
				if (this.blood < cost) {
					const sacrifices = this.battle.field[this.index].filter(c => c && c.blood).sort((a,b) => a.sacrificePriority - b.sacrificePriority);
					for (let j = 0; j < sacrifices.length; i++) {
						await sacrifices[j].onSacrifice(this.battle.field[this.index].indexOf(sacrifices[j]), card, i);
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
			return false;
		}
	}
	get field(): Card[] {
		return this.battle.field[this.index];
	}
	async useHammer(i: number, ignoreDraw?: boolean): Promise<void> {
		if (!this.field[i]) return;
		if (!ignoreDraw) {
			if (this.drawn) return;
			else this.drawn = true;
		}
		const card = this.field[i];
		card.hammered = true;
		await card.takeDamage(i, 100);
		delete card.hammered;
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
	battle: SoloBattle;
	backfield: Card[];
	cardPool: cardName[];

	bossEffect: bossType;
	difficulty: number;
	playRate: number=0.8;
	smartRate: number=0.5;
	targetPower: number=1;
	playAgain: number=0;
	cardsLeft: number=15;
	constructor(battle: SoloBattle, difficulty: number, isBoss: boolean=false, cardPool: cardName[]=[]) {
		this.battle = battle;
		if (isBoss) this.bossEffect = pickRandom(["prospector", "angler", "trader"]);
		this.difficulty = difficulty;
		this.backfield = Array(battle.fieldSize).fill(null);
		if (!cardPool.length) {
			const selection = botDeckCards.filter(c => {
				const model = getModel(c);
				return model.nonplayerValue >= 2 + difficulty;
			});
			cardPool = randomSelectionFrom(selection, 5 + Math.floor(Math.random() * 5));
		}
		this.cardPool = cardPool;
		this.cardsLeft = 10 + (difficulty - 1) * 2;
		this.smartRate = (difficulty - 1) / 4;
		this.targetPower = difficulty;
		this.playAgain = (difficulty - 1) * 0.1;
	}
	async setupFirstTurn(): Promise<void> {
		for (let i = 0; i < Math.ceil(this.difficulty / 2); i++) {
			await this.playSmartBackfield();
		}
	}
	get candles(): number {
		return this.battle.candles[1];
	}
	get display(): string {
		var display = this.candles > 1 ? `Boss Effect: ${this.bossEffect}\n` : "";
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
		do {
			if (this.battle.field[1].reduce((v,c,i) => v + c?.getPower(i), 0) < this.targetPower || Math.random() < this.playRate) {
				await this.playSmartBackfield(this.smartRate);
			}
		} while (Math.random() < this.playAgain);
	}
	async playBackfield(card: cardName|Card, i: number): Promise<void> {
		if (this.cardsLeft <= 0) return;
		this.cardsLeft--;
		if (!this.backfield[i]) {
			this.backfield[i] = Card.castCardName(card);
			await this.backfield[i].onDraw(this.battle, 1);
		}
	}
	async playSmartBackfield(chance: number=1): Promise<void> {
		const card = pickRandom(this.cardPool);
		var i = this.getRandomSmartSlot();
		if (i === -1 || Math.random() >= chance) i = this.getRandomOpenSlot();
		if (i > -1) {
			await this.playBackfield(card, i);
		}
	}
	getRandomSmartSlot(): number {
		var open: number[] = [];
		for (let i = 0; i < this.battle.fieldSize; i++) {
			if (!this.backfield[i] && !this.battle.field[1][i]) open.push(i);
		}
		return open.length ? pickRandom(open) : -1;
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
	async doBossEffect(): Promise<void> {
		this.backfield.fill(null);
		this.cardsLeft = Math.min(this.battle.fieldSize, this.cardsLeft);
		switch (this.bossEffect) {
			case "prospector":
				for (let i = 0; i < this.battle.fieldSize; i++) {
					if (!this.battle.field[0][i]) continue;
					await this.battle.field[0][i].takeDamage(i, 100);
					await this.battle.playCard(new Card("gold_nugget"), i, 0);
				}
				await this.playBackfield(new Card("bloodhound"), Math.floor(Math.random() * this.battle.fieldSize));
				break;
			case "angler":
				for (let i = 0; i < this.battle.fieldSize; i++) {
					if (!this.battle.field[0][i] || this.battle.field[1][i]) continue;
					const card = new Card("bait_bucket");
					if (this.difficulty >= 4) card.addSigil("mighty_leap");
					await this.battle.playCard(card, i, 1);
				}
				break;
			case "trader":
				for (let i = 0; i < this.battle.fieldSize; i++) {
					const card = new Card(pickRandom(this.cardPool));
					card.addSigil("amorphous");
					await this.playBackfield(card, i);
				}
				await this.battle.player.addToHand(new Card("wolf_pelt"));
				this.cardsLeft -= this.battle.fieldSize;
				break;
			case "moon":
				this.battle.field[1].fill(null);
				await this.battle.playCard(new Card("the_moon"), Math.floor(Math.random() * this.battle.fieldSize), 1);
				this.cardsLeft = 0;
				break;
			default:
				return;
		}
		this.bossEffect = this.battle.candles[1] <= 2 ? "moon" : pickRandom(["prospector", "angler", "trader"]);
	}
	async performAction(): Promise<boolean> {
		await sleep(AI_SPEED);
		return false;
	}
}

function makeCardFilter(): (card: cardName)=>boolean {
	// Enforces the following deck rules:
	// - no duplicate rare cards
	// - no more than 3 of the same non-rare card
	// - no more than 5 rare cards total
	const duplicates = {};
	var rares = 0;
	return (card: cardName): boolean => {
		const model = getModel(card);
		duplicates[card] = (duplicates[card] || 0) + 1;
		if (duplicates[card] > (model.rare ? MAX_RARE_DUPLICATES : MAX_NONRARE_DUPLICATES)) return false;
		return !model.rare || ++rares < MAX_TOTAL_RARES;
	}
}

@jsonObject
export class Player {
	@jsonMember
	name: string;
	@jsonMember
	deck: Deck;
	@jsonMember
	sidedeck: cardName;
	@jsonMember
	totem: Totem;
	@jsonMember
	boonBones: number = 0;
	constructor(sidedeck?: cardName, deck?: (cardName|Card)[]) {
		this.sidedeck = sidedeck ?? pickRandom(sidedecks);
		this.deck = deck ? new Deck(deck) : Player.generateDeck(this.sidedeck);
	}
	countDistinctCards(): number {
		const distinctCards = new Set<cardName>();
		var rareCount = 0;
		this.deck.cards.forEach(c => {
			if (typeof c === "string") {
				distinctCards.add(c);
				if (getModel(c).rare) rareCount++;
			} else {
				distinctCards.add(c.name);
				if (c.rare) rareCount++;
			}
		});
		return [...distinctCards].length;
	}
	getEmbedDisplay(): Embed {
		const distinctCards = new Set<cardName>();
		var rareCount = 0;
		this.deck.cards.forEach(c => {
			if (typeof c === "string") {
				distinctCards.add(c);
				if (getModel(c).rare) rareCount++;
			} else {
				distinctCards.add(c.name);
				if (c.rare) rareCount++;
			}
		});
		const competitive = (this.deck.cards.length >= MIN_COMPETITIVE_CARDS);
		return {
			title: `📋 ${this.name ?? "Unnamed Deck"}`,
			description: `Sidedeck: ${toProperFormat(this.sidedeck)}\nCards in Deck: ${this.deck.cards.length}${competitive?"":"*"} (${[...distinctCards].length} distinct)\nRare Cards: ${rareCount}/${MAX_TOTAL_RARES}${competitive?"":`\n*To duel other players, you need at least ${MIN_COMPETITIVE_CARDS} cards`}`
		};
	}
	static generateDeck(sidedeck: cardName): Deck {
		const _playerValueSort = (a,b) => {
			return getModel(b).playerValue - getModel(a).playerValue;
		};
		const _themeFilter = (c: cardName) => {
			const model = getModel(c);
			if (!model.cost && !model.is_mox && sidedeck != "mox_crystal") return true;
			if (model.cost === "mox" && !["mox_crystal", "omnisquirrel"].includes(sidedeck)) return false;
			switch (sidedeck) {
				case "squirrel": return model.themes.has("blood") || model.vanilla_cabin;
				case "empty_vessel": return model.themes.has("energy");
				case "skeleton": return model.themes.has("bones");
				case "mox_crystal": return model.themes.has("mox");
				case "omnisquirrel": return true;
				default: return true;
			}
		};
		const themed: cardName[] = playerDeckCards.filter(_themeFilter);
		const additions: cardName[] = randomSelectionFrom(playerDeckCards.filter(c => {
			const model = getModel(c);
			return !_themeFilter(c) && !model.mox && !model.is_mox && model.playerValue >= 3;
		}), 5).filter(c => c);
		const size = 30 + Math.floor(Math.random() * 15);
		const selection: cardName[] = randomSelectionFrom(themed, 100).filter(makeCardFilter())
			.sort(_playerValueSort).slice(0, size - additions.length).concat(additions);
		return new Deck(selection);
	}
	battlerInstance(battle: Battle, index: playerIndex): PlayerBattler {
		var player = new PlayerBattler(battle, index, new Deck(this.deck.cards), new SideDeck(this.sidedeck), [], this.totem);
		player.drawn = true;
		player.bones += this.boonBones || (getModel(this.sidedeck).no_sacrifice ? 1 : 0);
		return player;
	}
}

for (const name in card_models) {
	const model = getModel(name);
	model.stats ??= [0,1,0];
	model.sigils ??= [];
	model.abbrev ??= abbreviate(name, 6);
	model.bot_playable ??= model.stats[0] > 0;
	model.themes = new Set();
	if (model.cost) model.themes.add(model.cost);
	if (model.tribe) model.themes.add("tribal");
	if (model.is_mox) model.themes.add("mox");
	for (const sigil of [...model.sigils]) {
		if (!sigil_data[sigil]) console.error(`Sigil "${sigil}" not found!`);
		const theme = sigil_data[sigil].theme;
		if (theme) model.themes.add(theme);
	}
	switch (model.power_calc) {
		case "sacrifices":
			model.themes.add("blood");
			break;
		case "bones":
			model.themes.add("bones");
			break;
		case "discharge":
			model.themes.add("energy");
			break;
	}
	
	if (model.modded && !ENABLED_MODS.has(model.modded.toString()) ||
		VANILLA_CABIN_ONLY && !model.vanilla_cabin ||
		NO_MOX && (model.is_mox || model.cost === "mox")) continue;
	enabledDeckCards.push(name);
	if (model.is_terrain) continue;
	if (model.bot_playable) botDeckCards.push(name);
	if (model.event === "none") continue;
	playerDeckCards.push(name);//*/
}
for (const name in card_models) {
	const model = getModel(name);
	const card = new Card(name);
	model.rawValue = card.cardRawValue;
	model.playerValue = card.cardPlayerValue;
	model.nonplayerValue = card.cardNonplayerValue;
}
for (const mod of ENABLED_MODS) {
	cardPools[mod] = enabledDeckCards.filter(m => getModel(m).modded === mod);
}
for (const theme of ["blood", "bones", "energy", "mox", "tribal", "conduit"]) {
	cardPools[`${theme}Theme`] = enabledDeckCards.filter(m => getModel(m).themes.has(theme));
}
const cardModelSort = (modelA: CardModel, modelB: CardModel): number => {
	if (modelA.cost !== modelB.cost) {
		const costMap = {
			blood: 1,
			bones: 2,
			energy: 3,
			mox: 4,
			free: 5
		};
		return (costMap[modelA.cost ?? "free"]) - (costMap[modelB.cost ?? "free"]);
	} else if (modelA.rare !== modelB.rare) {
		return (modelA.rare ? 0 : 1) - (modelB.rare ? 0 : 1);
	} else if (modelA.cost === "mox" && modelA.mox.join("/") !== modelB.mox.join("/")) {
		const moxColorMap = {
			green: 1,
			orange: 2,
			blue: 3
		}
		return (moxColorMap[modelA.mox[0]] ?? 0) - (moxColorMap[modelB.mox[0]] ?? 0);
	} else if (modelA.stats[2] !== modelB.stats[2]) {
		return modelA.stats[2] - modelB.stats[2];
	} else {
		return modelB.playerValue - modelA.playerValue;
	}
}
enabledDeckCards.map(c=>getModel(c)).sort(cardModelSort).forEach((card, i) => {
	card.sortIndex = i;
});
