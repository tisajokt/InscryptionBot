
const card_models = require("./data/cards.json");
const default_deck = ["stoat", "bullfrog", "wolf"];

function Card(model) {
	this.name = model.name || card_models.indexOf(model);
	// stats: [power, health, cost]
	this.stats = model.stats ? [...model.stats] : [0,1,0];
	this.sigils = new Set(model.sigils ? [...model.sigils] : []);
}
Card.prototype.onPlay = function(battle) {
	if (this.sigils.has("warren")) {
		const rabbit = new Card(card_models.rabbit);
		for (var sigil in this.sigils) {
			if (!card_models[this.name].sigils.has(sigil)) {
				rabbit.sigils.add(sigil);
			}
		}
		rabbit.sigils.delete("warren");
		battle.addToHand(rabbit);
	}
}
Card.prototype.onHit = function(battle, attacker) {
	if (this.sigils.has("beehive")) {
		const bee = new Card(card_models.bee);
		for (var sigil in this.sigils) {
			if (!card_models[this.name].sigils.has(sigil)) {
				bee.sigils.add(sigil);
			}
		}
		bee.sigils.delete("beehive");
		battle.addToHand(bee);
	}
	if (this.sigils.has("spikey")) {
		attacker.stats[1]--;
	}
}
Card.prototype.onDeath = function(battle) {
	if (this.sigils.has("undying")) {
		battle.addToHand(this);
	}
}
Card.prototype.onKill = function() {
	if (this.sigils.has("wolverine")) {
		this.stats[0]++;
	}
}
Card.prototype.onSetup = function() {
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
Object.defineProperty(Card.prototype, "class", {
	get: function() {
		return card_models[this.name].class;
	}
});
Object.defineProperty(Card.prototype, "cost", {
	get: function() {
		return card_models[this.name].cost || "free";
	}
});

function Deck(cards=default_deck) {
	this.cards = cards.map((c) => {
		// "stoat"
		if (typeof c == "string") {
			return new Card(card_models[c]);
		// {name: "stoat", stat: [1,2,1], cost: "blood"}
		} else {
			return new Card(c);
		}
	});
}
Deck.prototype.draw = function() {
	if (this.cards.length > 0) {
		return (this.cards.splice(Math.floor(Math.random() * this.cards.length), 1))[0];
	} else {
		return null;
	}
}

function Battle() {
	this.scale = 0;
	this.goal = 5;
	this.turn = 0;
	this.candles = [1,1];
	this.fieldSize = 4;
	this.field = [[null, null, null, null], [null, null, null, null]];
	this.log = [];
}
Battle.prototype.flushLog = function() {
	const log = this.log.join("\n");
	this.log = [];
	return log;
}
Battle.prototype.damage = function(amount) {
	this.scale += amount * (turn === 0 ? 1 : -1);
	if (Math.abs(this.scale) >= this.goal) {
		this.candleOut(this.scale > 0 ? 1 : 0);
	}
}
Battle.prototype.candleOut = function(player) {
	this.candles[player]--;
	this.scale = 0;
}
Battle.prototype.setupTurn = function() {
	const actor = this.turn;
	for (var i = 0; i < this.fieldSize; i++) {
		const card = this.field[actor][i];
		if (card) {
			card.onSetup();
		}
	}
}
Battle.prototype.attack = function(i,j) {
	if (position < 0 || position >= this.fieldSize) return 0;
	const actor = this.turn;
	const other = (this.turn + 1) % 2;
	var damage = 0;

	const card = this.field[actor][i];
	if (!card) return 0;

	const power = card.stats[0];
	if (card.stats[0] == "A") {
		power = this.field[actor].filter(c => c && (c.name in ["ant", "flying_ant", "ant_queen"])).length;
	}
	if (this.field[actor][i-1] && this.field[actor][i-1].sigils.has("leader")) {
		power++;
	}
	if (this.field[actor][i+1] && this.field[actor][i+1].sigils.has("leader")) {
		power++;
	}

	const otherCard = this.field[other][j];
	if (otherCard && otherCard.sigils.has("stinky")) {
		power--;
	}

	if (otherCard && !otherCard.sigils.has("waterborne") &&
		(!card.sigils.has("flying") || otherCard.sigils.has("leaping"))) {
		otherCard.stats[1] -= power;
		otherCard.onHit(this, card);
		if (otherCard.stats[1] <= 0 || card.sigils.has("death_touch")) {
			if (card.sigils.has("piercing")) {
				damage = Math.max(0, -otherCard.stats[1]);
			}
			card.onKill();
			otherCard.onDeath(this);
			this.field[other][j] = null;
		}
	} else {
		damage = power;
	}
	if (card.sigils.has("fragile") || card.stats[1] <= 0) {
		card.onDeath();
		this.field[actor][j] = null;
	}
	return damage;
}
Battle.prototype.executeTurn = function() {
	const actor = this.turn;
	const other = (this.turn + 1) % 2;
	var damage = 0;

	for (var i = 0; i < this.fieldSize; i++) {
		const card = this.field[actor][i];
		if (card) {
			if (card.sigils.has("bifurcated")) {
				damage += this.attack(i, i-1) + this.attack(i, i+1);
			} else {
				damage += this.attack(i, i);
			}
		}
	}

	this.damage(damage);
	this.turn = other;
	this.setupTurn();
}

function AutoBattle() {
	
}
function DuelBattle() {

}

