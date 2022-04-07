var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const card_models = require("./data/game/cards.json");
const app_config = require("./config.json");
const game_config = require("./data/game/config.json");
const default_deck = ["stoat", "bullfrog", "wolf"];
const MAX_ENERGY = game_config.maxEnergy;
const BOT_TOKEN = app_config.botToken;
function sleep(t) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield new Promise(resolve => setTimeout(resolve, t));
    });
}
class Card {
    constructor(model) {
        if (typeof model == "string") {
            this.name = model;
            model = card_models[model];
        }
        else {
            this.name = model.name;
        }
        // stats: [power, health, cost]
        this.stats = model.stats ? [...model.stats] : [0, 1, 0];
        this.sigils = new Set(model.sigils ? [...model.sigils] : []);
    }
    static castCardName(card) {
        return (typeof card == "string") ? new Card(card) : card;
    }
    static copyCard(card) {
        return (typeof card == "string") ? card : new Card(card);
    }
    draw() {
        return new Card(this);
    }
    onPlay(battle, owner) {
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
    onHit(battle, attacker, owner) {
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
    onDeath(battle, owner) {
        const player = battle.getPlayer(owner);
        if (this.sigils.has("undying") && battle.isHuman(owner)) {
            battle.addToHand(this, owner);
        }
        var bones = 1;
        if (this.getClassProp("no_bones")) {
            bones = 0;
        }
        else if (this.sigils.has("four_bones")) {
            bones = 4;
        }
        if (bones > 0) {
            if (battle.isHuman(owner)) {
                player.bones += bones;
            }
            const other = (owner == 0) ? 1 : 0;
            if (battle.isHuman(other) && battle.field[other].filter(c => c === null || c === void 0 ? void 0 : c.sigils.has("scavenger")).length) {
                battle.getPlayer(other).bones += bones;
            }
        }
    }
    onKill() {
        if (this.sigils.has("wolverine")) {
            this.stats[0]++;
        }
    }
    onSetup() {
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
            }
            else {
                if (typeof this.stats[0] == "number") {
                    this.stats[0] += 1;
                }
                this.stats[1] += 2;
            }
        }
    }
    getClassProp(prop) {
        return card_models[this.name][prop];
    }
    get class() {
        return card_models[this.name].class;
    }
    get cost() {
        return card_models[this.name].cost || "free";
    }
}
class Deck {
    constructor(cards = default_deck) {
        this.cards = cards.map(c => Card.copyCard(c));
    }
    draw() {
        if (this.cards.length > 0) {
            return Card.castCardName((this.cards.splice(Math.floor(Math.random() * this.cards.length), 1))[0]);
        }
        else {
            return null;
        }
    }
    pick() {
        if (this.cards.length > 0) {
            return Card.castCardName(this.cards[(Math.floor(Math.random() * this.cards.length))]);
        }
        else {
            return null;
        }
    }
}
class Battle {
    constructor({ candles = 1, goal = 5, scale = 0, fieldSize = 4 } = {}) {
        this.ended = false;
        this.scale = scale;
        this.goal = goal;
        this.turn = 0;
        this.candles = [candles, candles];
        this.fieldSize = fieldSize;
        this.field = [Array(fieldSize).fill(null), Array(fieldSize).fill(null)];
        this.log = [];
    }
    get actor() {
        return (this.turn % 2);
    }
    flushLog() {
        const log = this.log.join("\n");
        this.log = [];
        return log;
    }
    damage(amount) {
        this.scale += amount * (this.actor ? 1 : -1);
        if (Math.abs(this.scale) >= this.goal) {
            return this.candleOut(this.scale > 0 ? 1 : 0);
        }
        return false;
    }
    candleOut(player) {
        this.candles[player]--;
        this.scale = 0;
        return this.candles[player] == 0;
    }
    setupTurn() {
        const actor = this.actor;
        this.log.push(`Player ${actor + 1} starts their turn.`);
        for (var i = 0; i < this.fieldSize; i++) {
            const card = this.field[actor][i];
            card === null || card === void 0 ? void 0 : card.onSetup();
        }
        this.players[actor].setupTurn(this.field[actor]);
    }
    attack(i, j) {
        var _a, _b;
        if (j < 0 || j >= this.fieldSize)
            return 0;
        const actor = this.actor;
        const other = (this.actor ? 0 : 1);
        var damage = 0;
        const card = this.field[actor][i];
        if (!card)
            return 0;
        const otherCard = this.field[other][j];
        var power = card.stats[0];
        const powerCalc = card.getClassProp("power_calc");
        switch (powerCalc) {
            case "ant":
                power = this.field[actor].filter(c => ((c === null || c === void 0 ? void 0 : c.getClassProp("power_calc")) == "ant")).length;
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
        if ((_a = this.field[actor][i - 1]) === null || _a === void 0 ? void 0 : _a.sigils.has("leader"))
            power++;
        if ((_b = this.field[actor][i + 1]) === null || _b === void 0 ? void 0 : _b.sigils.has("leader"))
            power++;
        if (otherCard === null || otherCard === void 0 ? void 0 : otherCard.sigils.has("stinky"))
            power--;
        if (power <= 0)
            return 0;
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
        }
        else {
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
    playCard(card, i) {
        const actor = this.actor;
        if (this.field[actor][i])
            return false;
        this.log.push(`Player ${actor + 1} plays ${card.name}!`);
        this.field[actor][i] = card;
        card.onPlay(this, actor);
    }
    executeTurn() {
        const actor = this.actor;
        var damage = 0;
        for (var i = 0; i < this.fieldSize; i++) {
            const card = this.field[actor][i];
            if (!card)
                continue;
            this.log.push(`Player ${actor + 1}'s ${card.name} attacks!`);
            if (card.sigils.has("trifurcated")) {
                damage += this.attack(i, i - 1) + this.attack(i, i) + this.attack(i, i + 1);
            }
            else if (card.sigils.has("bifurcated")) {
                damage += this.attack(i, i - 1) + this.attack(i, i + 1);
            }
            else {
                damage += this.attack(i, i);
            }
            if (card.sigils.has("double_strike")) {
                damage += this.attack(i, i);
            }
        }
        if (this.damage(damage)) {
            this.ended = true;
            return true;
        }
        else {
            this.turn++;
            return false;
        }
    }
    addToHand(card, player) {
        this.getPlayer(player).hand.push(card);
    }
    awaitCompletion() {
        return __awaiter(this, void 0, void 0, function* () {
            while (!this.ended) {
                this.setupTurn();
                while (yield this.players[this.actor].performAction(this))
                    ;
                this.executeTurn();
                console.log(this.flushLog());
            }
            return this.actor;
        });
    }
}
class AutoBattle extends Battle {
    constructor(player, ai, options = {}) {
        super(options);
        this.player = player.battlerInstance(this, 0);
        this.players = [this.player, ai];
        this.log.push(`Started AI battle!`);
    }
    getPlayer() {
        return this.player;
    }
    isHuman(player) {
        return (player == 0);
    }
}
class DuelBattle extends Battle {
    constructor(player1, player2, options = {}) {
        super(options);
        this.players = [player1.battlerInstance(this, 0), player2.battlerInstance(this, 1)];
        this.log.push(`Started duel battle!`);
    }
    getPlayer(player) {
        return this.players[player];
    }
    isHuman(player) {
        return true;
    }
}
class PlayerBattler {
    constructor(battle, index, deck, sidedeck, hand, totem) {
        this.sacrifices = 0;
        this.bones = 0;
        this.energy = 1;
        this.capacity = 1;
        this.drawn = true;
        this.battle = battle;
        this.index = index;
        this.deck = deck;
        this.sidedeck = sidedeck;
        this.hand = hand;
        this.totem = totem;
    }
    setupTurn(field) {
        this.drawn = false;
        this.sacrifices = 0;
        this.capacity = Math.min(MAX_ENERGY, this.capacity + 1);
        this.energy = this.capacity;
        for (var card of field) {
            if (card === null || card === void 0 ? void 0 : card.sigils.has("digger")) {
                this.bones++;
            }
        }
    }
    drawFrom(src, force = false, count = 1) {
        if (!force && this.drawn)
            return 0;
        var cardsDrawn = 0;
        while (count > 0) {
            const card = src.draw();
            if (!card)
                break;
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
    useHammer(field, i) {
        if (this.drawn || !field[i])
            return;
        this.drawn = true;
        field[i].onDeath(this.battle, this.index);
        field[i] = null;
    }
    performAction(battle) {
        return __awaiter(this, void 0, void 0, function* () {
            yield sleep(2000);
            return false;
        });
    }
}
class AIBattler {
    constructor() {
    }
    setupTurn(field) {
    }
    performAction(battle) {
        return __awaiter(this, void 0, void 0, function* () {
            battle.playCard(new Card("bullfrog"), Math.floor(Math.random() * battle.fieldSize));
            return false;
        });
    }
}
class Player {
    constructor() {
        this.boonBones = 0;
        this.deck = new Deck();
        this.sidedeck = new Card("squirrel");
    }
    battlerInstance(battle, index) {
        var player = new PlayerBattler(battle, index, new Deck(this.deck.cards), this.sidedeck, [], this.totem);
        player.drawFrom(player.sidedeck, true);
        player.drawFrom(player.deck, true, 4);
        player.bones += this.boonBones;
        return player;
    }
}
function testBattle() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Testing battle...");
        var player = new Player();
        var ai = new AIBattler();
        var battle = new AutoBattle(player, ai);
        var superStoat = new Card("stoat");
        superStoat.sigils.add("bifurcated");
        console.log(superStoat);
        battle.playCard(superStoat, 1);
        yield battle.awaitCompletion();
        console.log("Battle over!");
    });
}
testBattle();
