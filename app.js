"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
var card_models = require("./data/game/cards.json");
var sigil_data = require("./data/game/sigils.json");
var app_config = require("./config.json");
var game_config = require("./data/game/config.json");
var default_deck = [];
var default_auto = [];
var terrains = ["practice_wizard"]; //["", "boulder", "stump", "grand_fir", "frozen_opossum", "moleman", "broken_bot"];
var sidedecks = ["squirrel", "empty_vessel", "skeleton", "mox_crystal"];
for (var p = 0; p < sigil_data.__powers.length; p++) {
    for (var i = 0; i < sigil_data.__powers[p].length; i++) {
        sigil_data[sigil_data.__powers[p][i]] = {
            power: p - 3
        };
    }
}
var BOT_TOKEN = app_config.botToken;
var MAX_ENERGY = game_config.maxEnergy;
var ITEM_LIMIT = game_config.itemLimit;
var FECUNDITY_NERF = game_config.fecundityNerf;
var slow_mode = true;
var AI_SPEED = slow_mode ? 500 : 0;
function sleep(t) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, t); })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function padTrim(str, len, pad) {
    if (pad === void 0) { pad = " "; }
    return str.padEnd(len, pad).substring(0, len);
}
function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function randomSelectionFrom(arr, num) {
    var out = [];
    while (num--)
        out.push(pickRandom(arr));
    return out;
}
var Card = /** @class */ (function () {
    function Card(model) {
        if (typeof model == "string") {
            this.name = model;
            model = card_models[model];
        }
        else {
            this.name = model.name;
        }
        if (!model) {
            console.log("ERROR! ".concat(this.name, " model not found"));
        }
        // stats: [power, health, cost]
        this.stats = __spreadArray([], __read(model.stats), false);
        this.sigils = new Set(__spreadArray([], __read(model.sigils), false));
    }
    Card.prototype.toString = function () {
        return JSON.stringify({
            name: this.name,
            stats: this.stats,
            sigils: __spreadArray([], __read(this.sigils), false)
        });
    };
    Card.castCardName = function (card) {
        return (typeof card == "string") ? new Card(card) : card;
    };
    Card.copyCard = function (card) {
        return (typeof card == "string") ? card : new Card(card);
    };
    Card.prototype.getDisplay = function (i) {
        var _this = this;
        var size = 8;
        var name = this.name.replace("_", " ");
        var name1 = padTrim(name.length <= size ? name : name.split(" ")[0], size);
        var name2 = padTrim(name.length <= size ? "" : name.split(" ")[1] || "", size);
        var sigils = __spreadArray([], __read(this.sigils), false).map(function (s) { return (s == _this.ability ? "@" : (card_models[_this.name].sigils.includes(s) ? "*" : "+")); });
        //const sigil = padTrim((this.ability ? "@" : "").padEnd([...this.sigils].length, "*"), size, this.isConduit ? "~-" : " ");
        var sigil = padTrim(sigils.join(""), size, this.isConduit ? "~―" : " ");
        //const sigil = padTrim([...this.sigils].map(s => sigilSymbols[s] || "*").join(""), size);
        var cost = this.costDisplay.padEnd(size, " ");
        var stats = this.costDisplay /*`${this.cardRawValue}`.padEnd(4, " ")*/ + ("".concat(this.getPower(i), "/").concat(this.stats[1])).padStart(4, " ");
        var final = cost.substring(0, size - stats.length) + stats;
        var border = this.getModelProp("rare") ? "#========#" : "+――――――――+";
        var display;
        if (this.noSacrifice) {
            display =
                "+~~~~~~~~+\n:".concat(name1, ":\n:").concat(name2, ":\n:").concat(sigil, ":\n:").concat(final, ":\n+~~~~~~~~+");
        }
        else {
            display =
                "".concat(border, "\n|").concat(name1, "|\n|").concat(name2, "|\n|").concat(sigil, "|\n|").concat(final, "|\n").concat(border);
        }
        return display.split("\n");
    };
    Object.defineProperty(Card.prototype, "fullDisplay", {
        get: function () {
            var e_1, _a;
            var display = ["", this.name.replace("_", " "), this.stats[2] ? "".concat(this.stats[2], " ").concat(this.cost) : "free", this.getModelProp("tribe") || "no tribe"];
            try {
                for (var _b = __values(this.sigils), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var sigil = _c.value;
                    display.push(sigil.replace("_", " "));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            display.push("".concat(this.stats[0], "/").concat(this.stats[1]));
            var size = this.name.length;
            for (var i = 2; i < display.length; i++) {
                size = Math.max(size, display[i].length);
            }
            var sides = this.noSacrifice ? ":" : "|";
            var top = this.noSacrifice ? "~" : (this.getModelProp("rare") ? "=" : "―");
            var corners = this.getModelProp("rare") ? "#" : "+";
            for (var i = 1; i < display.length; i++) {
                display[i] = "".concat(sides).concat(display[i].padEnd(size, " ")).concat(sides);
            }
            display[0] = "".concat(corners).concat("".padEnd(size, top)).concat(corners);
            display.push(display[0]);
            return display;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Card.prototype, "ability", {
        get: function () {
            var e_2, _a;
            if (!this._ability) {
                var abilities = ["scholar", "stimulate", "enlarge", "energy_gun", "disentomb", "sniper", "bonehorn", "power_dice", "hovering", "energy_conduit"];
                try {
                    for (var abilities_1 = __values(abilities), abilities_1_1 = abilities_1.next(); !abilities_1_1.done; abilities_1_1 = abilities_1.next()) {
                        var ability = abilities_1_1.value;
                        if (this.sigils.has(ability)) {
                            this._ability = ability;
                            break;
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (abilities_1_1 && !abilities_1_1.done && (_a = abilities_1.return)) _a.call(abilities_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            return this._ability;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Card.prototype, "player", {
        get: function () {
            return this.battle.getPlayer(this.owner);
        },
        enumerable: false,
        configurable: true
    });
    Card.prototype.newOwner = function (owner) {
        this.owner = owner;
        this.humanOwner = this.battle.isHuman(owner);
    };
    Card.prototype.activeSigil = function (sigil) {
        return this.sigils.has(sigil) && this.checkSigilLoop();
    };
    Card.prototype.checkSigilLoop = function () {
        return (this.sigilActivations = (this.sigilActivations || 0) + 1) < 10;
    };
    Card.prototype.resetSigilLoop = function () {
        delete this.sigilActivations;
    };
    Card.prototype.canActivate = function (i) {
        if (this.cooldown >= 3)
            return false;
        switch (this.ability) {
            case "stimulate":
                return this.player.energy >= 2;
            case "scholar":
                return this.battle.hasMoxColor(this.owner, "blue");
            case "enlarge":
                return this.player.bones >= 2;
            case "energy_gun":
                var other = (this.owner ? 0 : 1);
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
    };
    Card.prototype.activate = function (i) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, other, discards;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.canActivate(i))
                            return [2 /*return*/];
                        _a = this.ability;
                        switch (_a) {
                            case "stimulate": return [3 /*break*/, 1];
                            case "scholar": return [3 /*break*/, 2];
                            case "enlarge": return [3 /*break*/, 4];
                            case "energy_gun": return [3 /*break*/, 5];
                            case "disentomb": return [3 /*break*/, 6];
                            case "bonehorn": return [3 /*break*/, 8];
                            case "power_dice": return [3 /*break*/, 9];
                            case "energy_conduit": return [3 /*break*/, 10];
                            case "sniper": return [3 /*break*/, 11];
                            case "hovering": return [3 /*break*/, 12];
                            case "handy": return [3 /*break*/, 13];
                        }
                        return [3 /*break*/, 14];
                    case 1:
                        this.player.energy -= 2;
                        this.stats[0]++;
                        return [3 /*break*/, 14];
                    case 2: return [4 /*yield*/, this.onDeath(i)];
                    case 3:
                        _b.sent();
                        this.player.drawFrom(this.player.deck, true, 3);
                        return [3 /*break*/, 14];
                    case 4:
                        this.player.bones -= 2;
                        this.stats[0]++;
                        this.stats[1]++;
                        return [3 /*break*/, 14];
                    case 5:
                        other = (this.owner ? 0 : 1);
                        this.battle.attackCard(this, this.battle.field[other][i], 1, other, i);
                        this.player.energy -= 1;
                        return [3 /*break*/, 14];
                    case 6: return [4 /*yield*/, this.player.addToHand(new Card("skeleton"))];
                    case 7:
                        _b.sent();
                        this.player.bones--;
                        return [3 /*break*/, 14];
                    case 8:
                        this.player.energy--;
                        this.player.bones += 3;
                        return [3 /*break*/, 14];
                    case 9:
                        this.player.energy--;
                        this.stats[0] = Math.ceil(Math.random() * 6);
                        return [3 /*break*/, 14];
                    case 10:
                        this.player.energy = this.player.capacity;
                        return [3 /*break*/, 14];
                    case 11:
                        this.target = (this.target + 1) % this.battle.fieldSize;
                        this.cooldown = 0;
                        return [3 /*break*/, 14];
                    case 12:
                        if (this.sigils.has("flying"))
                            this.sigils.delete("flying");
                        else
                            this.sigils.add("flying");
                        this.cooldown = 0;
                        return [3 /*break*/, 14];
                    case 13:
                        discards = this.player.hand;
                        this.player.hand = [];
                        this.player.drawFrom(this.player.deck, true, discards.length);
                        this.player.deck.cards = this.player.deck.cards.concat(discards.filter(function (c) { return c.name != _this.player.sidedeck.card; }));
                        delete this._ability;
                        this.sigils.delete("handy");
                        return [3 /*break*/, 14];
                    case 14:
                        this.cooldown++;
                        return [2 /*return*/];
                }
            });
        });
    };
    Card.prototype.move = function (from, to, force) {
        if (force === void 0) { force = false; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.battle.field[this.owner][to] && !force)
                            return [2 /*return*/, false];
                        this.battle.field[this.owner][from] = null;
                        this.battle.field[this.owner][to] = this;
                        return [4 /*yield*/, this.onMovement(to)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    Card.prototype.takeDamage = function (i, damage) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.stats[1])
                            return [2 /*return*/, false];
                        if (!this.sigils.has("armored")) return [3 /*break*/, 1];
                        this.sigils.delete("armored");
                        return [2 /*return*/, false];
                    case 1:
                        this.stats[1] -= (damage == Infinity ? this.stats[1] : damage);
                        if (!(this.stats[1] <= 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.onDeath(i)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, true];
                }
            });
        });
    };
    Card.prototype.onDraw = function (battle, owner) {
        return __awaiter(this, void 0, void 0, function () {
            var possibleSigils, possibleSigils, possibleMox;
            return __generator(this, function (_a) {
                this.battle = battle;
                this.owner = owner;
                this.humanOwner = battle.isHuman(owner);
                if (this.sigils.has("amorphous")) {
                    possibleSigils = ["rabbit_hole", "fecundity", "battery", "item_bearer", "dam_builder", "bellist", "beehive", "spikey", "swapper", "corpse_eater", "undying", "steel_trap", "four_bones", "scavenger", "blood_lust", "fledgling", "armored", "death_touch", "stone", "piercing", "leader", "annoying", "stinky", "leaping", "waterborne", "flying", "brittle", "sentry", "trifurcated", "bifurcated", "double_strike", "looter", "many_lives", "worthy_sacrifice", "gem_animator", "gemified", "random_mox", "digger", "morsel", "repulsive", "cuckoo", "guardian", "sealed_away", "sprinter", "scholar", "gemnastics", "stimulate", "enlarge", "energy_gun", "disentomb", "powered_buff", "powered_trifurcated", "gem_guardian", "sniper", "transformer", "burrower", "vessel_printer", "bonehorn", "skeleton_crew", "rampager", "detonator", "bomb_spewer", "power_dice", "gem_detonator", "brittle_latch", "bomb_latch", "shield_latch", "hefty", "jumper", "loose_tail", "hovering", "energy_conduit", "magic_armor", "handy", "double_death"];
                    do {
                        this.sigils.add(pickRandom(possibleSigils));
                    } while (Math.random() < 0.1);
                    this.sigils.delete("amorphous");
                }
                if (this.sigils.has("random_mox")) {
                    possibleSigils = ["blue_mox", "orange_mox", "green_mox"];
                    this.sigils.add(pickRandom(possibleSigils));
                    this.sigils.delete("random_mox");
                }
                this.hydraCheck();
                if (this.name == "mox_crystal") {
                    possibleMox = ["emerald_mox", "ruby_mox", "sapphire_mox"];
                    this.transformInto(pickRandom(possibleMox));
                }
                return [2 /*return*/];
            });
        });
    };
    Card.prototype.onMovement = function (i) {
        return __awaiter(this, void 0, void 0, function () {
            var other, otherCard, j, card;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        other = (this.owner ? 0 : 1);
                        otherCard = this.battle.field[other][i];
                        if (!otherCard) return [3 /*break*/, 3];
                        if (!otherCard.activeSigil("sentry")) return [3 /*break*/, 2];
                        this.battle.attackCard(otherCard, this, 1, this.owner, i);
                        if (!(this.stats[1] <= 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.onDeath(i)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [3 /*break*/, 4];
                    case 3:
                        for (j = 0; j < this.battle.fieldSize; j++) {
                            card = this.battle.field[other][j];
                            if (card === null || card === void 0 ? void 0 : card.activeSigil("guardian")) {
                                this.battle.field[other][i] = card;
                                this.battle.field[other][j] = null;
                            }
                        }
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Card.prototype.onPlay = function (i) {
        return __awaiter(this, void 0, void 0, function () {
            var rabbit, _a, _b, sigil, clone, possibleItems, j, lice, other, j, card, _c, _d, k, j, e_3_1;
            var e_4, _e, e_3, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (!this.humanOwner) return [3 /*break*/, 10];
                        if (!this.sigils.has("rabbit_hole")) return [3 /*break*/, 2];
                        rabbit = new Card("rabbit");
                        try {
                            for (_a = __values(this.sigils), _b = _a.next(); !_b.done; _b = _a.next()) {
                                sigil = _b.value;
                                if (!card_models[this.name].sigils || card_models[this.name].sigils.indexOf(sigil) < 0) {
                                    rabbit.sigils.add(sigil);
                                }
                            }
                        }
                        catch (e_4_1) { e_4 = { error: e_4_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_e = _a.return)) _e.call(_a);
                            }
                            finally { if (e_4) throw e_4.error; }
                        }
                        rabbit.sigils.delete("rabbit_hole");
                        return [4 /*yield*/, this.battle.addToHand(rabbit, this.owner)];
                    case 1:
                        _g.sent();
                        _g.label = 2;
                    case 2:
                        if (!this.sigils.has("fecundity")) return [3 /*break*/, 4];
                        clone = new Card(this);
                        if (FECUNDITY_NERF) {
                            clone.sigils.delete("fecundity");
                        }
                        return [4 /*yield*/, this.battle.addToHand(clone, this.owner)];
                    case 3:
                        _g.sent();
                        _g.label = 4;
                    case 4:
                        if (this.sigils.has("battery")) {
                            this.player.capacity = Math.min(MAX_ENERGY, this.player.capacity + 1);
                            this.player.energy = Math.min(this.player.capacity, this.player.energy + 1);
                        }
                        if (this.sigils.has("item_bearer") && this.player.items.length < ITEM_LIMIT) {
                            possibleItems = ["squirrel", "black_goat", "boulder", "frozen_opossum", "bones", "battery", "armor", "pliers", "hourglass", "fan"];
                            this.player.items.push(new Item(pickRandom(possibleItems)));
                        }
                        if (this.sigils.has("gemnastics")) {
                            this.player.drawFrom(this.player.deck, true, this.battle.countMox(this.owner));
                        }
                        if (!(this.getModelProp("pelt_value") && this.battle.hasFreeSpace(this.owner))) return [3 /*break*/, 10];
                        j = 0;
                        _g.label = 5;
                    case 5:
                        if (!(j < this.player.hand.length)) return [3 /*break*/, 10];
                        lice = this.player.hand[j];
                        if (!(lice && lice.getModelProp("is_pelt_lice"))) return [3 /*break*/, 9];
                        _g.label = 6;
                    case 6: return [4 /*yield*/, this.battle.playCard(lice, Math.floor(Math.random() * this.battle.fieldSize), this.owner)];
                    case 7:
                        if (!!(_g.sent())) return [3 /*break*/, 8];
                        ;
                        return [3 /*break*/, 6];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        j++;
                        return [3 /*break*/, 5];
                    case 10:
                        other = (this.owner ? 0 : 1);
                        if (this.sigils.has("magic_armor") && !this.battle.field[other][i]) {
                            this.sigils.add("armored");
                            this.sigils.delete("magic_armor");
                        }
                        if (!this.activeSigil("dam_builder")) return [3 /*break*/, 13];
                        return [4 /*yield*/, this.battle.playCard(this.createWithExtraSigils("dam", "dam_builder"), i - 1, this.owner)];
                    case 11:
                        _g.sent();
                        return [4 /*yield*/, this.battle.playCard(this.createWithExtraSigils("dam", "dam_builder"), i + 1, this.owner)];
                    case 12:
                        _g.sent();
                        _g.label = 13;
                    case 13:
                        if (!this.activeSigil("bellist")) return [3 /*break*/, 16];
                        return [4 /*yield*/, this.battle.playCard(new Card("chime"), i - 1, this.owner)];
                    case 14:
                        _g.sent();
                        return [4 /*yield*/, this.battle.playCard(new Card("chime"), i + 1, this.owner)];
                    case 15:
                        _g.sent();
                        _g.label = 16;
                    case 16:
                        if (!this.activeSigil("cuckoo")) return [3 /*break*/, 18];
                        return [4 /*yield*/, this.battle.playCard(new Card("broken_egg"), i, other)];
                    case 17:
                        _g.sent();
                        _g.label = 18;
                    case 18:
                        this.baseHP = this.stats[1];
                        if (this.sigils.has("gemified") && this.battle.hasMoxColor(this.owner, "green"))
                            this.stats[1] += 2;
                        if (this.sigils.has("gem_guardian")) {
                            for (j = 0; j < this.battle.fieldSize; j++) {
                                card = this.battle.field[this.owner][j];
                                if (card && card.getModelProp("is_mox")) {
                                    card.sigils.add("armored");
                                }
                            }
                        }
                        if (this.sigils.has("sniper")) {
                            this.target = this.battle.isHuman(this.owner) ? i : Math.floor(Math.random() * this.battle.fieldSize);
                        }
                        if (!this.activeSigil("bomb_spewer")) return [3 /*break*/, 28];
                        _g.label = 19;
                    case 19:
                        _g.trys.push([19, 26, 27, 28]);
                        _c = __values([this.owner, 1 - this.owner]), _d = _c.next();
                        _g.label = 20;
                    case 20:
                        if (!!_d.done) return [3 /*break*/, 25];
                        k = _d.value;
                        j = 0;
                        _g.label = 21;
                    case 21:
                        if (!(j < this.battle.fieldSize)) return [3 /*break*/, 24];
                        if (!!this.battle.field[k][j]) return [3 /*break*/, 23];
                        return [4 /*yield*/, this.battle.playCard(new Card("explode_bot"), j, k)];
                    case 22:
                        _g.sent();
                        _g.label = 23;
                    case 23:
                        j++;
                        return [3 /*break*/, 21];
                    case 24:
                        _d = _c.next();
                        return [3 /*break*/, 20];
                    case 25: return [3 /*break*/, 28];
                    case 26:
                        e_3_1 = _g.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 28];
                    case 27:
                        try {
                            if (_d && !_d.done && (_f = _c.return)) _f.call(_c);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 28: return [4 /*yield*/, this.onMovement(i)];
                    case 29:
                        _g.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Card.prototype.onHit = function (attacker) {
        return __awaiter(this, void 0, void 0, function () {
            var chime_trigger, i, daus;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.battle.log.push("Player ".concat(this.owner ? 2 : 1, "'s ").concat(this.name, " dies!"));
                        if (!this.humanOwner) return [3 /*break*/, 4];
                        if (!this.activeSigil("beehive")) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.battle.addToHand(this.createWithExtraSigils("bee", "beehive"), this.owner)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!this.activeSigil("vessel_printer")) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.battle.addToHand(this.createWithExtraSigils("empty_vessel", "vessel_printer"), this.owner)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (this.activeSigil("spikey")) {
                            attacker.stats[1]--;
                            if (this.sigils.has("death_touch") && !attacker.sigils.has("stone")) {
                                attacker.stats[1] = 0;
                            }
                        }
                        if (this.sigils.has("swapper") && this.stats[1]) {
                            this.stats = [this.stats[1], this.stats[0], this.stats[2]];
                        }
                        chime_trigger = this.getModelProp("chime_trigger");
                        if (chime_trigger) {
                            for (i = 0; i < this.battle.fieldSize; i++) {
                                daus = this.battle.field[this.owner][i];
                                if (daus && daus.name == chime_trigger && daus.checkSigilLoop()) {
                                    if (attacker.sigils.has("armored")) {
                                        attacker.sigils.delete("armored");
                                    }
                                    else if (daus.sigils.has("death_touch") && !attacker.sigils.has("stone")) {
                                        attacker.stats[1] = 0;
                                    }
                                    else {
                                        attacker.stats[1] -= daus.getPower(i);
                                    }
                                }
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Card.prototype.onDeath = function (i) {
        return __awaiter(this, void 0, void 0, function () {
            var player, other, deaths, j, card, otherCard, bones;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.battle.log.push("Player ".concat(this.owner + 1, "'s ").concat(this.name, " dies!"));
                        this.battle.field[this.owner][i] = null;
                        this.stats[1] = Math.min(this.stats[1], 0);
                        player = this.player;
                        other = (this.owner == 0) ? 1 : 0;
                        deaths = 1 + this.battle.getCardsWithSigil(this.owner, "double_death").length;
                        if (!this.activeSigil("sealed_away")) return [3 /*break*/, 2];
                        deaths = 1;
                        return [4 /*yield*/, this.battle.playCard(this.createWithExtraSigils(this.getModelProp("sealed_away") || "opossum", "sealed_away"), i, this.owner)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 2:
                        if (!this.battle.isHuman(this.owner)) return [3 /*break*/, 10];
                        j = 0;
                        _a.label = 3;
                    case 3:
                        if (!(j < player.hand.length)) return [3 /*break*/, 6];
                        if (!player.hand[j].activeSigil("corpse_eater")) return [3 /*break*/, 5];
                        deaths = 1;
                        card = player.hand.splice(j, 1)[0];
                        return [4 /*yield*/, this.battle.playCard(card, i)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        j++;
                        return [3 /*break*/, 3];
                    case 6:
                        if (!this.sigils.has("haunter")) return [3 /*break*/, 8];
                        this.name = "spirit";
                        this.stats = __spreadArray([], __read(card_models["spirit"].stats), false);
                        return [4 /*yield*/, this.battle.addToHand(this, this.owner)];
                    case 7:
                        _a.sent();
                        deaths = 1;
                        return [3 /*break*/, 10];
                    case 8:
                        if (!this.sigils.has("undying")) return [3 /*break*/, 10];
                        this.stats[1] = this.baseHP || card_models[this.name].stats[1];
                        if (this.getModelProp("undying_powerup")) {
                            this.stats[0] += deaths;
                            this.stats[1] += deaths;
                        }
                        return [4 /*yield*/, this.battle.addToHand(this, this.owner)];
                    case 9:
                        _a.sent();
                        deaths = 1;
                        _a.label = 10;
                    case 10:
                        if (!deaths--) return [3 /*break*/, 17];
                        if (this.activeSigil("steel_trap")) {
                            otherCard = this.battle.field[other][i];
                            Item.skinningKnife(otherCard, i);
                        }
                        if (!this.noBones) {
                            bones = this.sigils.has("four_bones") ? 4 : 1;
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
                        if (!(this.activeSigil("detonator") || this.getModelProp("is_mox") &&
                            this.battle.getCardsWithSigil(this.owner, "gem_detonator").length + this.battle.getCardsWithSigil(other, "gem_detonator").length > 0)) return [3 /*break*/, 16];
                        // shouldn't be necessary to delete the sigil, but just in case, to avoid infinite loop
                        this.sigils.delete("detonator");
                        if (!this.battle.field[other][i]) return [3 /*break*/, 12];
                        return [4 /*yield*/, this.battle.field[other][i].takeDamage(i, Infinity)];
                    case 11:
                        _a.sent();
                        _a.label = 12;
                    case 12:
                        if (!(i - 1 >= 0 && this.battle.field[this.owner][i - 1])) return [3 /*break*/, 14];
                        return [4 /*yield*/, this.battle.field[this.owner][i - 1].takeDamage(i - 1, Infinity)];
                    case 13:
                        _a.sent();
                        _a.label = 14;
                    case 14:
                        if (!(i + 1 < this.battle.fieldSize && this.battle.field[this.owner][i + 1])) return [3 /*break*/, 16];
                        return [4 /*yield*/, this.battle.field[this.owner][i + 1].takeDamage(i + 1, Infinity)];
                    case 15:
                        _a.sent();
                        _a.label = 16;
                    case 16: return [3 /*break*/, 10];
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    Card.prototype.onSacrifice = function (i, card) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, sigil;
            var e_5, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!this.blood)
                            return [2 /*return*/];
                        this.player.blood += this.blood;
                        this.player.sacrifices++;
                        if (this.sigils.has("morsel")) {
                            card.stats[0] += this.stats[0];
                            card.stats[1] += this.stats[1];
                        }
                        if (this.sigils.has("haunter")) {
                            try {
                                for (_a = __values(this.sigils), _b = _a.next(); !_b.done; _b = _a.next()) {
                                    sigil = _b.value;
                                    card.sigils.add(sigil);
                                }
                            }
                            catch (e_5_1) { e_5 = { error: e_5_1 }; }
                            finally {
                                try {
                                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                                }
                                finally { if (e_5) throw e_5.error; }
                            }
                            this.sigils.delete("haunter");
                        }
                        if (!!this.sigils.has("many_lives")) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.onDeath(i)];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        if (this.name == "child_13") {
                            this.awakened = !this.awakened;
                            if (this.awakened) {
                                this.stats[0] += 2;
                                this.sigils.add("flying");
                            }
                            else {
                                this.stats[0] = Math.max(0, this.stats[0] - 2);
                                this.sigils.delete("flying");
                            }
                        }
                        if (this.getModelProp("9lives")) {
                            this.sacrifices = (this.sacrifices || 0) + 1;
                            if (this.sacrifices == 9) {
                                this.name = this.getModelProp("9lives");
                                this.stats = __spreadArray([], __read(card_models[this.name].stats), false);
                                this.sigils.delete("many_lives");
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Card.prototype.onKill = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.sigils.has("blood_lust")) {
                    this.stats[0]++;
                }
                return [2 /*return*/];
            });
        });
    };
    Card.prototype.onSetup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tentacles, base_model, grows_into;
            return __generator(this, function (_a) {
                if (this.sigils.has("waterborne") && this.getModelProp("kraken")) {
                    tentacles = ["bell_tentacle", "hand_tentacle", "mirror_tentacle"];
                    this.name = pickRandom(tentacles);
                    this.stats = __spreadArray([], __read(card_models[this.name].stats), false);
                    this.sigils.delete("waterborne");
                }
                if (this.sigils.has("fledgling")) {
                    base_model = card_models[this.name];
                    grows_into = base_model.grows_into;
                    this.sigils.delete("fledgling");
                    if (grows_into) {
                        this.transformInto(grows_into);
                    }
                    else {
                        this.stats[0] += 1;
                        this.stats[1] += 2;
                    }
                }
                if (this.sigils.has("transformer")) {
                    this.awakened = !this.awakened;
                    if (this.awakened) {
                        this.stats[0] += this.getModelProp("transformer_attack") || 0;
                        if (this.getModelProp("transformer_sigil"))
                            this.sigils.add(this.getModelProp("transformer_sigil"));
                    }
                    else {
                        this.stats[0] -= this.getModelProp("transformer_attack") || 0;
                        if (this.getModelProp("transformer_sigil"))
                            this.sigils.delete(this.getModelProp("transformer_sigil"));
                    }
                }
                if (this.humanOwner && this.sigils.has("digger")) {
                    this.player.bones++;
                }
                this.cooldown = Math.max(0, this.cooldown - 1);
                this.moved = false;
                return [2 /*return*/];
            });
        });
    };
    Card.prototype.transformInto = function (card) {
        var e_6, _a, e_7, _b;
        var old_model = card_models[this.name];
        var new_model = card_models[card];
        this.name = card;
        this.stats[0] += (new_model.stats[0] - old_model.stats[0]);
        this.stats[1] += (new_model.stats[1] - old_model.stats[1]);
        this.stats[2] = new_model.stats[2];
        try {
            for (var _c = __values(old_model.sigils), _d = _c.next(); !_d.done; _d = _c.next()) {
                var sigil = _d.value;
                this.sigils.delete(sigil);
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_6) throw e_6.error; }
        }
        try {
            for (var _e = __values(new_model.sigils), _f = _e.next(); !_f.done; _f = _e.next()) {
                var sigil = _f.value;
                this.sigils.add(sigil);
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_7) throw e_7.error; }
        }
    };
    Card.prototype.hydraCheck = function () {
        if (this.sigils.has("hydra_egg")) {
            var tribes_1 = {
                canine: 0,
                insect: 0,
                reptile: 0,
                avian: 0,
                hooved: 0,
                squirrel: 0,
                all: 0
            };
            for (var k = 0; k <= 1; k++) {
                this.battle.field[k].forEach(function (c) {
                    if (!c)
                        return;
                    if (c.tribe == "all")
                        tribes_1.all++;
                    else if (c.tribe)
                        tribes_1[c.tribe] = 1;
                });
            }
            if (tribes_1.canine + tribes_1.insect + tribes_1.reptile + tribes_1.avian + tribes_1.hooved + tribes_1.all >= 5) {
                this.transformInto("hydra");
            }
        }
    };
    Card.prototype.createWithExtraSigils = function (cardName, sigil) {
        if (sigil === void 0) { sigil = null; }
        var card = new Card(cardName);
        this.copyExtraSigils(card);
        if (sigil)
            card.sigils.delete(sigil);
        return card;
    };
    Card.prototype.copyExtraSigils = function (target) {
        var e_8, _a;
        try {
            for (var _b = __values(this.sigils), _c = _b.next(); !_c.done; _c = _b.next()) {
                var sigil = _c.value;
                if (!card_models[this.name].sigils.includes(sigil)) {
                    target.sigils.add(sigil);
                }
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_8) throw e_8.error; }
        }
    };
    Card.prototype.latchEffect = function (field, sigil) {
        var options = field.filter(function (c) { return c && !c.sigils.has(sigil); });
        if (options.length) {
            pickRandom(options).sigils.add(sigil);
            return true;
        }
        return false;
    };
    Card.prototype.tryLatch = function (sigil, player) {
        if (this.sigils.has(sigil)) {
            this.latchEffect(this.battle.field[player], sigil) || this.latchEffect(this.battle.field[player ? 0 : 1], sigil);
        }
    };
    Card.prototype.getCost = function () {
        var cost = this.stats[2];
        if (this.sigils.has("gemified") && this.battle.hasMoxColor(this.owner, "blue")) {
            cost -= (this.cost == "bones" ? 2 : 1);
        }
        return Math.max(0, cost);
    };
    Card.prototype.getPower = function (i) {
        var _a, _b, _c, _d;
        if (!this.battle) {
            console.log(this.fullDisplay.join("\n"));
        }
        var other = (this.owner ? 0 : 1);
        var power = this.stats[0];
        var powerCalc = this.getModelProp("power_calc");
        switch (powerCalc) {
            case "ant":
                power = this.battle.field[this.owner].filter(function (c) { return ((c === null || c === void 0 ? void 0 : c.getModelProp("power_calc")) == "ant"); }).length;
                break;
            case "mirror":
                var otherCard = this.battle.field[other][i];
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
                power = __spreadArray([], __read(this.sigils), false).length;
                break;
            case "damage":
                power = Math.max(0, (this.baseHP || card_models[this.name].stats[1]) - this.stats[1]);
                break;
        }
        if (powerCalc)
            power += card_models[this.name].stats[0]; // in all vanilla cases, this does nothing
        if ((_a = this.battle.field[this.owner][i - 1]) === null || _a === void 0 ? void 0 : _a.sigils.has("leader"))
            power++;
        if ((_b = this.battle.field[this.owner][i + 1]) === null || _b === void 0 ? void 0 : _b.sigils.has("leader"))
            power++;
        if ((_c = this.battle.field[other][i]) === null || _c === void 0 ? void 0 : _c.sigils.has("annoying"))
            power++;
        if (((_d = this.battle.field[other][i]) === null || _d === void 0 ? void 0 : _d.sigils.has("stinky")) && !this.sigils.has("stone"))
            power--;
        if (this.sigils.has("gemified") && this.battle.hasMoxColor(this.owner, "orange"))
            power++;
        if (this.getModelProp("is_mox"))
            power += this.battle.getCardsWithSigil(this.owner, "gem_animator").length;
        var circuit = this.battle.getCircuit(this.owner, i);
        if (circuit) {
            if (circuit[0].sigils.has("buff_conduit"))
                power++;
            if (circuit[1].sigils.has("buff_conduit"))
                power++;
            if (this.sigils.has("powered_buff"))
                power += 2;
        }
        return Math.max(0, power);
    };
    Card.prototype.getModelProp = function (prop) {
        return card_models[this.name][prop];
    };
    Card.prototype.isPlayable = function (maxRawValue) {
        var e_9, _a;
        if (maxRawValue === void 0) { maxRawValue = Infinity; }
        var cost = this.getCost();
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
                if (!this.battle.hasFreeSpace(this.owner))
                    return false;
                try {
                    for (var _b = __values(this.mox), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var mox = _c.value;
                        if (mox == "any") {
                            if (this.battle.countMox(this.owner) == 0)
                                return false;
                        }
                        else if (!this.battle.hasMoxColor(this.owner, mox)) {
                            return false;
                        }
                    }
                }
                catch (e_9_1) { e_9 = { error: e_9_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_9) throw e_9.error; }
                }
                return true;
        }
    };
    Object.defineProperty(Card.prototype, "rare", {
        get: function () {
            return !!card_models[this.name].rare;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Card.prototype, "blood", {
        get: function () {
            if (this.noSacrifice)
                return 0;
            else if (this.sigils.has("worthy_sacrifice"))
                return 3;
            else
                return 1;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Card.prototype, "noBones", {
        get: function () {
            return !!card_models[this.name].no_bones;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Card.prototype, "noSacrifice", {
        get: function () {
            return !!card_models[this.name].no_sacrifice;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Card.prototype, "isConduit", {
        get: function () {
            return !!card_models[this.name].is_conduit;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Card.prototype, "mox", {
        get: function () {
            return card_models[this.name].mox;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Card.prototype, "tribe", {
        get: function () {
            return card_models[this.name].tribe;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Card.prototype, "tail", {
        get: function () {
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
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Card.prototype, "pelt", {
        get: function () {
            switch (this.tribe) {
                case "canine":
                    return "wolf_pelt";
                default:
                    return this.rare ? "golden_pelt" : "rabbit_pelt";
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Card.prototype, "cost", {
        get: function () {
            return card_models[this.name].cost || "free";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Card.prototype, "costDisplay", {
        get: function () {
            switch (this.cost) {
                case "blood":
                    return "".concat("".padEnd(this.stats[2], "&")).padEnd(4, " ");
                case "bones":
                    return "".concat(this.stats[2], "//").padEnd(4, " ");
                case "energy":
                    return "[".concat(this.stats[2], "]").padEnd(4, " ");
                case "mox":
                    return "m".concat(this.mox.map(function (m) { return m[0].toUpperCase(); }).join("")).padEnd(4, " ");
                case "free":
                    return "".padEnd(4, " ");
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Card.prototype, "cardPlayerSigilValue", {
        get: function () {
            return __spreadArray([], __read(this.sigils), false).map(function (c) {
                return sigil_data.__player_sigils.includes(c) ? sigil_data[c].power : 0;
            }).reduce(function (acc, cur) { return (acc + cur); }, 0);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Card.prototype, "cardNonplayerValue", {
        get: function () {
            return this.cardRawValue - this.cardPlayerSigilValue;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Card.prototype, "cardRawValue", {
        get: function () {
            var statsValue = this.stats[0] * 2 + this.stats[1];
            var sigilsValue = __spreadArray([], __read(this.sigils), false).map(function (c) {
                if (!sigil_data[c]) {
                    console.log("Unrecognized sigil ".concat(c));
                }
                return sigil_data[c].power;
            }).reduce(function (acc, cur) { return (acc + cur); }, 0);
            var extraValue = 0;
            if (this.isConduit)
                extraValue += 1;
            if (this.getModelProp("power_calc"))
                extraValue += 3;
            return statsValue + sigilsValue + extraValue;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Card.prototype, "sacrificePriority", {
        get: function () {
            return this.sigils.has("many_lives") ? -Infinity : (this.cardRawValue - (this.sigils.has("worthy_sacrifice") ? 10 : 0) - (this.sigils.has("haunter") ? 5 : 0));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Card.prototype, "cardPlayerValue", {
        get: function () {
            var e_10, _a;
            var costValue = 0;
            if (this.noSacrifice)
                costValue++;
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
                    try {
                        for (var _b = __values(this.mox), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var mox = _c.value;
                            if (mox == "any")
                                costValue += 3;
                            else
                                costValue += 5;
                        }
                    }
                    catch (e_10_1) { e_10 = { error: e_10_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_10) throw e_10.error; }
                    }
                    break;
            }
            return this.cardRawValue - costValue;
        },
        enumerable: false,
        configurable: true
    });
    Card.openSlot = "          \n          \n    ..    \n    ..    \n          \n          ".split("\n");
    return Card;
}());
var Deck = /** @class */ (function () {
    function Deck(cards) {
        if (cards === void 0) { cards = []; }
        this.cards = cards.map(function (c) { return Card.copyCard(c); });
    }
    Deck.prototype.draw = function () {
        if (this.cards.length > 0) {
            return Card.castCardName((this.cards.splice(Math.floor(Math.random() * this.cards.length), 1))[0]);
        }
        else {
            return null;
        }
    };
    Deck.prototype.pick = function () {
        if (this.cards.length > 0) {
            return Card.castCardName(pickRandom(this.cards));
        }
        else {
            return null;
        }
    };
    return Deck;
}());
var SideDeck = /** @class */ (function () {
    function SideDeck(card, count) {
        if (count === void 0) { count = 20; }
        this.card = card;
        this.count = count;
    }
    SideDeck.prototype.draw = function () {
        if (this.count > 0) {
            this.count--;
            return new Card(this.card);
        }
        else {
            return null;
        }
    };
    return SideDeck;
}());
var Item = /** @class */ (function () {
    function Item(type) {
        this.type = type;
    }
    Item.prototype.isUsable = function (battle, player) {
        return true;
    };
    Item.skinningKnife = function (card, i) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(card && card.stats[1] > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, card.takeDamage(i, Infinity)];
                    case 1:
                        _a.sent();
                        if (!card.humanOwner) return [3 /*break*/, 3];
                        // steel trap/skinning knife now retains the killed card's extra sigils, gives gold pelts for rares, and rabbit pelts for non-canines
                        return [4 /*yield*/, card.battle.addToHand(card.createWithExtraSigils(card.pelt), card.owner)];
                    case 2:
                        // steel trap/skinning knife now retains the killed card's extra sigils, gives gold pelts for rares, and rabbit pelts for non-canines
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Item.wiseclock = function (battle) {
        return __awaiter(this, void 0, void 0, function () {
            var traitor1, traitor2, i, i;
            return __generator(this, function (_a) {
                traitor1 = battle.field[1][battle.fieldSize - 1];
                traitor2 = battle.field[0][0];
                for (i = 0; i < battle.fieldSize - 1; i++) {
                    battle.field[1][i + 1] = battle.field[1][i];
                }
                for (i = battle.fieldSize - 1; i > 0; i--) {
                    battle.field[0][i - 1] = battle.field[0][i];
                }
                battle.field[0][battle.fieldSize - 1] = traitor1;
                battle.field[1][0] = traitor2;
                traitor1 === null || traitor1 === void 0 ? void 0 : traitor1.newOwner(0);
                traitor2 === null || traitor2 === void 0 ? void 0 : traitor2.newOwner(1);
                return [2 /*return*/];
            });
        });
    };
    Item.magpieLens = function (battle, player) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, player.addToHand(player.deck.draw())];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Item.prototype.use = function (battle, player) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.isUsable(battle, player))
                            return [2 /*return*/, false];
                        _a = this.type;
                        switch (_a) {
                            case "squirrel": return [3 /*break*/, 1];
                            case "black_goat": return [3 /*break*/, 1];
                            case "boulder": return [3 /*break*/, 1];
                            case "frozen_opossum": return [3 /*break*/, 1];
                            case "bones": return [3 /*break*/, 3];
                            case "battery": return [3 /*break*/, 4];
                            case "armor": return [3 /*break*/, 5];
                            case "pliers": return [3 /*break*/, 6];
                            case "fan": return [3 /*break*/, 8];
                            case "hourglass": return [3 /*break*/, 9];
                            case "wiseclock": return [3 /*break*/, 10];
                            case "skinning_knife": return [3 /*break*/, 12];
                            case "lens": return [3 /*break*/, 13];
                        }
                        return [3 /*break*/, 15];
                    case 1: return [4 /*yield*/, battle.addToHand(new Card(this.type), player)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 15];
                    case 3:
                        battle.getPlayer(player).bones += 4;
                        return [3 /*break*/, 15];
                    case 4:
                        battle.getPlayer(player).energy = battle.getPlayer(player).capacity;
                        return [3 /*break*/, 15];
                    case 5:
                        battle.field[player].forEach(function (c) { return c === null || c === void 0 ? void 0 : c.sigils.add("armored"); });
                        return [3 /*break*/, 15];
                    case 6: return [4 /*yield*/, battle.damage(1)];
                    case 7:
                        _b.sent();
                        return [3 /*break*/, 15];
                    case 8:
                        battle.getPlayer(player).fanUsed = true;
                        return [3 /*break*/, 15];
                    case 9:
                        battle.getPlayer(player).hourglassUsed = true;
                        return [3 /*break*/, 15];
                    case 10: return [4 /*yield*/, Item.wiseclock(battle)];
                    case 11:
                        _b.sent();
                        return [3 /*break*/, 15];
                    case 12: 
                    //await Item.skinningKnife(battle);
                    return [3 /*break*/, 15];
                    case 13: return [4 /*yield*/, Item.magpieLens(battle, battle.getPlayer(player))];
                    case 14:
                        _b.sent();
                        return [3 /*break*/, 15];
                    case 15: return [2 /*return*/, true];
                }
            });
        });
    };
    return Item;
}());
var Battle = /** @class */ (function () {
    function Battle(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.candles, candles = _c === void 0 ? 1 : _c, _d = _b.goal, goal = _d === void 0 ? 5 : _d, _e = _b.scale, scale = _e === void 0 ? 0 : _e, _f = _b.fieldSize, fieldSize = _f === void 0 ? 4 : _f, _g = _b.terrain, terrain = _g === void 0 ? "" : _g;
        this.ended = false;
        this.scale = scale;
        this.goal = goal;
        this.turn = 0;
        this.candles = [candles, candles];
        this.fieldSize = fieldSize;
        this.field = [Array(this.fieldSize).fill(null), Array(this.fieldSize).fill(null)];
        this.log = [];
        this.terrain = terrain;
    }
    Battle.prototype.placeTerrain = function (terrain) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.playCard(new Card(terrain), Math.floor(Math.random() * this.fieldSize), 0)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.playCard(new Card(terrain), Math.floor(Math.random() * this.fieldSize), 1)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(Battle.prototype, "actor", {
        get: function () {
            return (this.turn % 2);
        },
        enumerable: false,
        configurable: true
    });
    Battle.prototype.flushLog = function () {
        var log = this.log.join("\n");
        this.log = [];
        return log;
    };
    Battle.prototype.damage = function (amount, player) {
        if (player === void 0) { player = this.actor; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.scale += amount * (player ? 1 : -1);
                        if (!(Math.abs(this.scale) >= this.goal)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.candleOut(this.scale > 0 ? 0 : 1)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [2 /*return*/, false];
                }
            });
        });
    };
    Battle.prototype.candleOut = function (player) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.candles[player]--;
                        if (!(this.candles[player] <= 0)) return [3 /*break*/, 1];
                        return [2 /*return*/, true];
                    case 1:
                        this.scale = 0;
                        if (!this.isHuman(1)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getPlayer(player).addToHand(new Card("greater_smoke"))];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, false];
                }
            });
        });
    };
    Battle.prototype.setupTurn = function () {
        return __awaiter(this, void 0, void 0, function () {
            var actor, i, card;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        actor = this.actor;
                        this.log.push("Player ".concat(actor + 1, " starts their turn."));
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < this.fieldSize)) return [3 /*break*/, 4];
                        card = this.field[actor][i];
                        if (!card)
                            return [3 /*break*/, 3];
                        return [4 /*yield*/, card.onSetup()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [4 /*yield*/, this.players[actor].setupTurn()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Battle.prototype.attackCard = function (attacker, target, power, owner, j) {
        return __awaiter(this, void 0, void 0, function () {
            var damage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        damage = 0;
                        return [4 /*yield*/, target.takeDamage(j, attacker.sigils.has("death_touch") && !target.sigils.has("stone") ? Infinity : power)];
                    case 1:
                        if (!_a.sent()) return [3 /*break*/, 4];
                        return [4 /*yield*/, target.onHit(attacker)];
                    case 2:
                        _a.sent();
                        if (!(target.stats[1] <= 0)) return [3 /*break*/, 4];
                        if (attacker.sigils.has("piercing")) {
                            damage = Math.max(0, -target.stats[1]);
                        }
                        else if (target.stats[1] < 0) {
                            this.players[owner].overkillDamage(-target.stats[1], j);
                        }
                        return [4 /*yield*/, attacker.onKill()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, damage];
                }
            });
        });
    };
    Battle.prototype.attackField = function (i, j, player) {
        if (player === void 0) { player = this.actor; }
        return __awaiter(this, void 0, void 0, function () {
            var card, damage, other, otherCard, power, k, burrower, d;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        card = this.field[player][i];
                        if (!card)
                            return [2 /*return*/, 0];
                        if (card.sigils.has("sniper"))
                            j = card.target;
                        if (!(j >= 0 && j < this.fieldSize))
                            return [2 /*return*/, 0];
                        damage = 0;
                        other = (player ? 0 : 1);
                        otherCard = this.field[other][j];
                        power = card.getPower(i);
                        if (power <= 0)
                            return [2 /*return*/, 0];
                        if (!!otherCard) return [3 /*break*/, 4];
                        k = 0;
                        _a.label = 1;
                    case 1:
                        if (!(k < this.fieldSize)) return [3 /*break*/, 4];
                        burrower = this.field[other][k];
                        if (!(burrower && burrower.sigils.has("burrower") && (!card.sigils.has("flying") || burrower.sigils.has("leaping")))) return [3 /*break*/, 3];
                        return [4 /*yield*/, burrower.move(k, j)];
                    case 2:
                        _a.sent();
                        otherCard = burrower;
                        return [3 /*break*/, 4];
                    case 3:
                        k++;
                        return [3 /*break*/, 1];
                    case 4:
                        if (!(otherCard && !otherCard.sigils.has("waterborne") &&
                            (otherCard.sigils.has("leaping") || !(card.sigils.has("flying") || this.isHuman(player) && this.getPlayer(player).fanUsed)))) return [3 /*break*/, 11];
                        if (!!otherCard.sigils.has("repulsive")) return [3 /*break*/, 10];
                        if (!otherCard.sigils.has("loose_tail")) return [3 /*break*/, 7];
                        d = (j + 1 < this.fieldSize && !this.field[other][j + 1]) ? 1 : -1;
                        if (!(j + d > 0 && !this.field[other][j + d])) return [3 /*break*/, 7];
                        return [4 /*yield*/, otherCard.move(j, j + d)];
                    case 5:
                        _a.sent();
                        otherCard.sigils.delete("loose_tail");
                        return [4 /*yield*/, this.playCard(otherCard.createWithExtraSigils(otherCard.tail, "loose_tail"), j, other)];
                    case 6:
                        _a.sent();
                        otherCard = this.field[other][j];
                        _a.label = 7;
                    case 7:
                        if (!otherCard) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.attackCard(card, otherCard, power, other, j)];
                    case 8:
                        damage = _a.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        damage = power;
                        _a.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        damage = power;
                        _a.label = 12;
                    case 12:
                        if (!(card.sigils.has("brittle") || card.stats[1] <= 0)) return [3 /*break*/, 14];
                        return [4 /*yield*/, card.onDeath(i)];
                    case 13:
                        _a.sent();
                        _a.label = 14;
                    case 14:
                        if (damage) {
                            this.log.push("".concat(card.name, " deals ").concat(damage, " damage!"));
                        }
                        return [2 /*return*/, damage];
                }
            });
        });
    };
    Battle.prototype.playCard = function (card, i, player) {
        if (player === void 0) { player = this.actor; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, card.onDraw(this, player)];
                    case 1:
                        _a.sent();
                        if (i < 0 || i >= this.fieldSize || this.field[player][i])
                            return [2 /*return*/, false];
                        this.log.push("Player ".concat(player + 1, " plays ").concat(card.name, "!"));
                        this.field[player][i] = card;
                        return [4 /*yield*/, card.onPlay(i)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    Battle.prototype.emptySpaceInDirection = function (player, i, d) {
        for (var j = i; j >= 0 && j < this.fieldSize; j += d) {
            if (!this.field[player][j])
                return j;
        }
        return -1;
    };
    Battle.prototype.executeTurn = function () {
        return __awaiter(this, void 0, void 0, function () {
            var actor, damage, i, card, subdamage, _a, _b, _c, _d, _e, _f, _g, player, i, card, rampager, hefty, jumper, trail, d, t, j, _h, i, circuit;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        actor = this.actor;
                        damage = 0;
                        i = 0;
                        _j.label = 1;
                    case 1:
                        if (!(i < this.fieldSize)) return [3 /*break*/, 16];
                        card = this.field[actor][i];
                        if (!card)
                            return [3 /*break*/, 15];
                        card.resetSigilLoop();
                        if (!(card.sigils.has("gem_dependent") && this.countMox(actor) <= 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, card.onDeath(i)];
                    case 2:
                        _j.sent();
                        return [3 /*break*/, 15];
                    case 3:
                        if (!(card.getPower(i) > 0)) return [3 /*break*/, 15];
                        subdamage = 0;
                        if (!(card.sigils.has("trifurcated") || card.sigils.has("powered_trifurcated") && this.getCircuit(actor, i))) return [3 /*break*/, 7];
                        _a = subdamage;
                        return [4 /*yield*/, this.attackField(i, i - 1)];
                    case 4:
                        _b = (_j.sent());
                        return [4 /*yield*/, this.attackField(i, i)];
                    case 5:
                        _c = _b + (_j.sent());
                        return [4 /*yield*/, this.attackField(i, i + 1)];
                    case 6:
                        subdamage = _a + (_c + (_j.sent()));
                        return [3 /*break*/, 12];
                    case 7:
                        if (!card.sigils.has("bifurcated")) return [3 /*break*/, 10];
                        _d = subdamage;
                        return [4 /*yield*/, this.attackField(i, i - 1)];
                    case 8:
                        _e = (_j.sent());
                        return [4 /*yield*/, this.attackField(i, i + 1)];
                    case 9:
                        subdamage = _d + (_e + (_j.sent()));
                        return [3 /*break*/, 12];
                    case 10:
                        _f = subdamage;
                        return [4 /*yield*/, this.attackField(i, i)];
                    case 11:
                        subdamage = _f + _j.sent();
                        _j.label = 12;
                    case 12:
                        if (!card.sigils.has("double_strike")) return [3 /*break*/, 14];
                        _g = subdamage;
                        return [4 /*yield*/, this.attackField(i, i)];
                    case 13:
                        subdamage = _g + _j.sent();
                        _j.label = 14;
                    case 14:
                        if (card.sigils.has("looter") && subdamage > 0 && this.isHuman(actor)) {
                            player = this.getPlayer(actor);
                            player.drawFrom(player.deck, true, subdamage);
                        }
                        damage += subdamage;
                        _j.label = 15;
                    case 15:
                        i++;
                        return [3 /*break*/, 1];
                    case 16:
                        i = 0;
                        _j.label = 17;
                    case 17:
                        if (!(i < this.fieldSize)) return [3 /*break*/, 32];
                        card = this.field[actor][i];
                        if (!card || card.moved)
                            return [3 /*break*/, 31];
                        rampager = card.sigils.has("rampager");
                        hefty = card.sigils.has("hefty");
                        jumper = card.sigils.has("jumper");
                        trail = card.getModelProp("trail");
                        if (!(card.sigils.has("sprinter") || card.sigils.has("skeleton_crew") || rampager || hefty || jumper)) return [3 /*break*/, 31];
                        d = (card.sprintToLeft ? -1 : 1);
                        t = i + d;
                        if (t < 0 || t >= this.fieldSize || (this.field[actor][t] && !rampager && !(jumper && this.emptySpaceInDirection(actor, i, d) > -1))) {
                            card.sprintToLeft = !card.sprintToLeft;
                            d = -d;
                            t = i + d;
                        }
                        if (!jumper) return [3 /*break*/, 20];
                        t = this.emptySpaceInDirection(actor, i, d);
                        if (!(t > -1)) return [3 /*break*/, 19];
                        card.moved = true;
                        return [4 /*yield*/, card.move(i, t)];
                    case 18:
                        _j.sent();
                        _j.label = 19;
                    case 19: return [3 /*break*/, 31];
                    case 20:
                        if (!hefty) return [3 /*break*/, 26];
                        t = this.emptySpaceInDirection(actor, i, d);
                        if (!(t > -1)) return [3 /*break*/, 25];
                        card.moved = true;
                        j = t;
                        _j.label = 21;
                    case 21:
                        if (!(j != i)) return [3 /*break*/, 25];
                        this.field[actor][j] = this.field[actor][j - d];
                        this.field[actor][j - d] = null;
                        _h = this.field[actor][j];
                        if (!_h) return [3 /*break*/, 23];
                        return [4 /*yield*/, this.field[actor][j].onMovement(j)];
                    case 22:
                        _h = (_j.sent());
                        _j.label = 23;
                    case 23:
                        _h;
                        _j.label = 24;
                    case 24:
                        j -= d;
                        return [3 /*break*/, 21];
                    case 25: return [3 /*break*/, 31];
                    case 26:
                        if (!(!this.field[actor][t] || rampager)) return [3 /*break*/, 31];
                        this.field[actor][i] = this.field[actor][t] || (trail ? new Card(trail) : null);
                        this.field[actor][t] = card;
                        if (!this.field[actor][i]) return [3 /*break*/, 29];
                        return [4 /*yield*/, this.field[actor][i].onDraw(this, actor)];
                    case 27:
                        _j.sent();
                        return [4 /*yield*/, this.field[actor][i].onMovement(i)];
                    case 28:
                        _j.sent();
                        _j.label = 29;
                    case 29:
                        card.moved = true;
                        return [4 /*yield*/, card.onMovement(t)];
                    case 30:
                        _j.sent();
                        i = t;
                        _j.label = 31;
                    case 31:
                        i++;
                        return [3 /*break*/, 17];
                    case 32:
                        if (!this.getPlayer(actor).deck.cards.length) {
                            this.starvation = (this.starvation || 0) + 1;
                            if (this.candles[0] != this.candles[1]) {
                                this.scale += (this.candles[0] > this.candles[1] ? -1 : 1) * this.starvation;
                            }
                            else if (this.scale != 0) {
                                this.scale += (this.scale < 0 ? -1 : 1) * this.starvation;
                            }
                            else if (!damage) {
                                damage -= this.starvation;
                            }
                        }
                        if (!this.getCardsWithSigil(actor, "factory_conduit").length) return [3 /*break*/, 36];
                        i = 1;
                        _j.label = 33;
                    case 33:
                        if (!(i + 1 < this.fieldSize)) return [3 /*break*/, 36];
                        if (this.field[actor][i])
                            return [3 /*break*/, 35];
                        circuit = this.getCircuit(actor, i);
                        if (!(circuit && (circuit[0].sigils.has("factory_conduit") || circuit[1].sigils.has("factory_conduit")))) return [3 /*break*/, 35];
                        return [4 /*yield*/, this.playCard(new Card("l33pb0t"), i, actor)];
                    case 34:
                        _j.sent();
                        _j.label = 35;
                    case 35:
                        i++;
                        return [3 /*break*/, 33];
                    case 36: return [4 /*yield*/, this.damage(damage)];
                    case 37:
                        if (_j.sent()) {
                            this.ended = true;
                            return [2 /*return*/, true];
                        }
                        else {
                            if (!this.isHuman(actor) || !this.getPlayer(actor).hourglassUsed) {
                                this.turn++;
                            }
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Battle.prototype.addToHand = function (card, player) {
        if (player === void 0) { player = this.actor; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getPlayer(player).addToHand(card)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Battle.prototype.hasMoxColor = function (player, mox) {
        var _a;
        if (mox == "any") {
            for (var i = 0; i < this.fieldSize; i++) {
                var card = this.field[player][i];
                if (!card)
                    continue;
                if (card.sigils.has("green_mox") || card.sigils.has("blue_mox") || card.sigils.has("orange_mox"))
                    return true;
            }
        }
        else {
            for (var i = 0; i < this.fieldSize; i++) {
                if ((_a = this.field[player][i]) === null || _a === void 0 ? void 0 : _a.sigils.has("".concat(mox, "_mox")))
                    return true;
            }
        }
        return false;
    };
    Battle.prototype.hasFreeSpace = function (player, sacrificeIsFree) {
        if (sacrificeIsFree === void 0) { sacrificeIsFree = false; }
        for (var i = 0; i < this.fieldSize; i++) {
            if (!this.field[player][i] || sacrificeIsFree && this.field[player][i].blood > 0) {
                return true;
            }
        }
        return false;
    };
    Battle.prototype.getCardsWithSigil = function (player, sigil) {
        var _a;
        var arr = [];
        for (var i = 0; i < this.fieldSize; i++) {
            if ((_a = this.field[player][i]) === null || _a === void 0 ? void 0 : _a.sigils.has(sigil)) {
                arr.push(this.field[player][i]);
            }
        }
        return arr;
    };
    Battle.prototype.countBlood = function (player, maxRawValue) {
        var e_11, _a;
        if (maxRawValue === void 0) { maxRawValue = Infinity; }
        var sacrifices = this.field[player].filter(function (c) { return c && c.blood; }).sort(function (a, b) { return a.sacrificePriority - b.sacrificePriority; });
        var blood = 0;
        var valueTotal = 0;
        try {
            for (var sacrifices_1 = __values(sacrifices), sacrifices_1_1 = sacrifices_1.next(); !sacrifices_1_1.done; sacrifices_1_1 = sacrifices_1.next()) {
                var card = sacrifices_1_1.value;
                valueTotal += card.cardRawValue;
                if (valueTotal >= maxRawValue)
                    continue;
                blood += card.blood || 0;
            }
        }
        catch (e_11_1) { e_11 = { error: e_11_1 }; }
        finally {
            try {
                if (sacrifices_1_1 && !sacrifices_1_1.done && (_a = sacrifices_1.return)) _a.call(sacrifices_1);
            }
            finally { if (e_11) throw e_11.error; }
        }
        return blood;
    };
    Battle.prototype.countMox = function (player) {
        var count = 0;
        for (var i = 0; i < this.fieldSize; i++) {
            var card = this.field[player][i];
            if (!card)
                continue;
            if (card.sigils.has("blue_mox"))
                count++;
            if (card.sigils.has("green_mox"))
                count++;
            if (card.sigils.has("orange_mox"))
                count++;
        }
        return count;
    };
    Battle.prototype.hasCircuit = function (player) {
        var _a;
        var count = 0;
        for (var i = 0; i < this.fieldSize; i++) {
            if ((_a = this.field[player][i]) === null || _a === void 0 ? void 0 : _a.isConduit) {
                if (++count >= 2)
                    return true;
            }
        }
        return false;
    };
    Battle.prototype.getCircuit = function (player, i) {
        var _a, _b;
        var leftCard;
        for (var j = i - 1; j >= 0; j--) {
            if ((_a = this.field[player][j]) === null || _a === void 0 ? void 0 : _a.isConduit) {
                leftCard = this.field[player][j];
                break;
            }
        }
        var rightCard;
        for (var k = i + 1; k < this.fieldSize; k++) {
            if ((_b = this.field[player][k]) === null || _b === void 0 ? void 0 : _b.isConduit) {
                rightCard = this.field[player][k];
                break;
            }
        }
        return leftCard && rightCard ? [leftCard, rightCard] : null;
    };
    Object.defineProperty(Battle.prototype, "display", {
        get: function () {
            var display = "".concat("".padEnd(this.candles[0], "i"), "(").concat(("").padStart(Math.min(this.goal, Math.max(0, this.scale)), "*").padStart(this.goal, " "), "/").concat(("").padEnd(Math.min(this.goal, Math.max(0, -this.scale)), "*").padEnd(this.goal, " "), ")").concat("".padEnd(this.candles[1], "i")).concat(Math.abs(this.scale) > this.goal ? " +".concat(Math.abs(this.scale) - this.goal) : "", "\n").concat(this.players[1].display, "\n");
            for (var p = 1; p >= 0; p--) {
                var arr = [];
                for (var i = 0; i < this.fieldSize; i++) {
                    arr.push((this.field[p][i] ? this.field[p][i].getDisplay(i) : Card.openSlot));
                }
                var arr2 = Array(Card.openSlot.length).fill("");
                for (var j = 0; j < arr2.length; j++) {
                    for (var k = 0; k < arr.length; k++) {
                        arr2[j] += arr[k][j];
                    }
                }
                display += arr2.join("\n") + "\n";
            }
            display += this.players[0].display;
            return display;
        },
        enumerable: false,
        configurable: true
    });
    Battle.prototype.awaitCompletion = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.terrain) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.placeTerrain(this.terrain)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (slow_mode)
                            console.log("\n", this.display);
                        _a.label = 3;
                    case 3:
                        if (!!this.ended) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.setupTurn()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [4 /*yield*/, this.players[this.actor].performAction()];
                    case 6:
                        if (!_a.sent()) return [3 /*break*/, 7];
                        ;
                        return [3 /*break*/, 5];
                    case 7: return [4 /*yield*/, this.executeTurn()];
                    case 8:
                        _a.sent();
                        if (slow_mode)
                            console.log("\n", this.display);
                        return [3 /*break*/, 3];
                    case 9:
                        console.log("\n", this.display);
                        return [2 /*return*/, this.candles[0] ? 0 : 1];
                }
            });
        });
    };
    return Battle;
}());
var SoloBattle = /** @class */ (function (_super) {
    __extends(SoloBattle, _super);
    function SoloBattle(player, options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, options) || this;
        _this.player = player.battlerInstance(_this, 0);
        _this.players = [_this.player, new AutoBattler(_this)];
        if (_this.candles[1] > 1) {
            while (_this.candles[0] > 1) {
                //this.player.addToHand(new Card("the_smoke"));
                _this.candles[0]--;
            }
        }
        _this.log.push("Started AI battle!");
        return _this;
    }
    SoloBattle.prototype.getPlayer = function () {
        return this.player;
    };
    SoloBattle.prototype.isHuman = function (player) {
        return (player == 0);
    };
    return SoloBattle;
}(Battle));
var DuelBattle = /** @class */ (function (_super) {
    __extends(DuelBattle, _super);
    function DuelBattle(player1, player2, options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, options) || this;
        _this.players = [player1.battlerInstance(_this, 0), player2.battlerInstance(_this, 1)];
        _this.log.push("Started duel battle!");
        return _this;
    }
    DuelBattle.prototype.getPlayer = function (player) {
        return this.players[player];
    };
    DuelBattle.prototype.isHuman = function (player) {
        return true;
    };
    return DuelBattle;
}(Battle));
var PlayerBattler = /** @class */ (function () {
    function PlayerBattler(battle, index, deck, sidedeck, hand, totem) {
        this.sacrifices = 0;
        this.bones = 0;
        this.energy = 0;
        this.capacity = 0;
        this.blood = 0;
        this.drawn = true;
        this.fanUsed = false;
        this.hourglassUsed = false;
        this.battle = battle;
        this.index = index;
        this.deck = deck;
        this.sidedeck = sidedeck;
        this.hand = hand;
        this.totem = totem;
        this.items = [];
        this.overkill = Array(battle.fieldSize).fill(0);
    }
    Object.defineProperty(PlayerBattler.prototype, "display", {
        get: function () {
            var _this = this;
            var cards = "Cards: ".concat(this.hand.length.toString().padStart(2, " "), "/").concat(this.deck.cards.length.toString().padEnd(2, " "));
            var mox = "m(".concat(["blue", "green", "orange"].map(function (c) { return _this.battle.hasMoxColor(_this.index, c) ? c[0].toUpperCase() : " "; }).join(""), ")");
            var energy = "[".concat("".padStart(this.energy, "#").padStart(this.capacity, "0").padStart(MAX_ENERGY, "."), "]");
            var bones = "".concat(this.bones, "//");
            return "".concat(cards, " ").concat(mox, " ").concat(energy, " ").concat(bones);
        },
        enumerable: false,
        configurable: true
    });
    PlayerBattler.prototype.setupTurn = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.drawn = false;
                this.sacrifices = 0;
                this.capacity = Math.min(MAX_ENERGY, this.capacity + 1);
                this.energy = this.capacity;
                this.fanUsed = false;
                this.hourglassUsed = false;
                return [2 /*return*/];
            });
        });
    };
    PlayerBattler.prototype.endTurn = function () {
        this.overkill.fill(0);
    };
    PlayerBattler.prototype.overkillDamage = function (amount, i) {
        if (!this.battle.isHuman(1))
            return;
        this.overkill[i] += amount;
    };
    PlayerBattler.prototype.drawFrom = function (src, force, count) {
        if (force === void 0) { force = false; }
        if (count === void 0) { count = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var cardsDrawn, card;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!force && this.drawn || count <= 0)
                            return [2 /*return*/, 0];
                        cardsDrawn = 0;
                        _a.label = 1;
                    case 1:
                        if (!(count > 0)) return [3 /*break*/, 3];
                        card = src.draw();
                        if (!card)
                            return [3 /*break*/, 3];
                        return [4 /*yield*/, this.addToHand(card)];
                    case 2:
                        _a.sent();
                        cardsDrawn++;
                        count--;
                        return [3 /*break*/, 1];
                    case 3:
                        this.drawn = true;
                        return [2 /*return*/, cardsDrawn];
                }
            });
        });
    };
    PlayerBattler.prototype.addToHand = function (card) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!card)
                            return [2 /*return*/];
                        if (this.totem && (card.tribe == this.totem.tribe || card.tribe == "all")) {
                            card.sigils.add(this.totem.sigil);
                        }
                        return [4 /*yield*/, card.onDraw(this.battle, this.index)];
                    case 1:
                        _a.sent();
                        this.hand.push(card);
                        return [2 /*return*/];
                }
            });
        });
    };
    PlayerBattler.prototype.playFromHand = function (h, i) {
        return __awaiter(this, void 0, void 0, function () {
            var card, cost, _a, sacrifices, i_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        card = this.hand[h];
                        if (!card || !card.isPlayable(card.cardRawValue) || this.battle.field[this.index][i])
                            return [2 /*return*/, false];
                        cost = card.getCost();
                        _a = card.cost;
                        switch (_a) {
                            case "blood": return [3 /*break*/, 1];
                            case "bones": return [3 /*break*/, 6];
                            case "energy": return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 8];
                    case 1:
                        if (!(this.blood < cost)) return [3 /*break*/, 5];
                        sacrifices = this.battle.field[this.index].filter(function (c) { return c && c.blood; }).sort(function (a, b) { return a.sacrificePriority - b.sacrificePriority; });
                        i_1 = 0;
                        _b.label = 2;
                    case 2:
                        if (!(i_1 < sacrifices.length)) return [3 /*break*/, 5];
                        return [4 /*yield*/, sacrifices[i_1].onSacrifice(this.battle.field[this.index].indexOf(sacrifices[i_1]), card)];
                    case 3:
                        _b.sent();
                        if (this.blood >= cost)
                            return [3 /*break*/, 5];
                        _b.label = 4;
                    case 4:
                        i_1++;
                        return [3 /*break*/, 2];
                    case 5:
                        this.blood = 0;
                        return [3 /*break*/, 8];
                    case 6:
                        this.bones = Math.max(0, this.bones - cost);
                        return [3 /*break*/, 8];
                    case 7:
                        this.energy = Math.max(0, this.energy - cost);
                        return [3 /*break*/, 8];
                    case 8: return [4 /*yield*/, this.battle.playCard(card, i)];
                    case 9:
                        if (_b.sent()) {
                            this.hand.splice(h, 1);
                            return [2 /*return*/, true];
                        }
                        else {
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(PlayerBattler.prototype, "field", {
        get: function () {
            return this.battle.field[this.index];
        },
        enumerable: false,
        configurable: true
    });
    PlayerBattler.prototype.useHammer = function (i) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.drawn || !this.field[i])
                            return [2 /*return*/];
                        this.drawn = true;
                        return [4 /*yield*/, this.field[i].takeDamage(i, 100)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PlayerBattler.prototype.performAction = function () {
        return __awaiter(this, void 0, void 0, function () {
            var hasOption, i, card, plays, _a, i, card;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, sleep(AI_SPEED)];
                    case 1:
                        _b.sent();
                        hasOption = false;
                        for (i = 0; i < this.battle.fieldSize; i++) {
                            card = this.battle.field[this.index][i];
                            if (!card || card.getPower(i) > 0) {
                                hasOption = true;
                                break;
                            }
                        }
                        if (!!hasOption) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.useHammer(Math.floor(Math.random() * this.battle.fieldSize))];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.drawFrom(this.deck.cards.length && (this.hand.filter(function (c) { return sidedecks.includes(c.name); }).length >= 2 || Math.random() < 0.7) ? this.deck : this.sidedeck)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        plays = 0;
                        _b.label = 6;
                    case 6:
                        _a = ++plays < 50;
                        if (!_a) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.playFromHand(Math.floor(Math.random() * this.hand.length), Math.floor(Math.random() * this.battle.fieldSize))];
                    case 7:
                        _a = ((_b.sent()) || Math.random() < 0.9);
                        _b.label = 8;
                    case 8:
                        if (!_a) return [3 /*break*/, 9];
                        ;
                        return [3 /*break*/, 6];
                    case 9:
                        i = 0;
                        _b.label = 10;
                    case 10:
                        if (!(i < this.battle.fieldSize)) return [3 /*break*/, 14];
                        card = this.battle.field[this.index][i];
                        if (!(card === null || card === void 0 ? void 0 : card.ability)) return [3 /*break*/, 13];
                        _b.label = 11;
                    case 11:
                        if (!(++plays < 50 && card.canActivate(i) && Math.random() < 0.8)) return [3 /*break*/, 13];
                        return [4 /*yield*/, card.activate(i)];
                    case 12:
                        _b.sent();
                        return [3 /*break*/, 11];
                    case 13:
                        i++;
                        return [3 /*break*/, 10];
                    case 14:
                        this.endTurn();
                        return [2 /*return*/, false];
                }
            });
        });
    };
    return PlayerBattler;
}());
var AutoBattler = /** @class */ (function () {
    function AutoBattler(battle, cardPool) {
        if (cardPool === void 0) { cardPool = []; }
        this.battle = battle;
        this.backfield = Array(battle.fieldSize).fill(null);
        if (!cardPool.length) {
            var selection = default_auto.filter(function (c) {
                var model = card_models[c];
                return model.nonplayerValue >= 3;
            });
            cardPool = randomSelectionFrom(selection, 3 + Math.floor(Math.random() * 6));
        }
        this.cardPool = cardPool;
        this.playRandomBackfield();
    }
    Object.defineProperty(AutoBattler.prototype, "display", {
        get: function () {
            var display = "";
            for (var i = 0; i < this.backfield.length; i++) {
                display += this.backfield[i] ? "[".concat(padTrim(this.backfield[i].name.replace("_", ""), 8, '='), "]") : "".padEnd(10, " ");
            }
            return display;
        },
        enumerable: false,
        configurable: true
    });
    AutoBattler.prototype.setupTurn = function () {
        return __awaiter(this, void 0, void 0, function () {
            var i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < this.battle.fieldSize)) return [3 /*break*/, 4];
                        if (!(!this.battle.field[1][i] && this.backfield[i])) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.battle.playCard(this.backfield[i], i)];
                    case 2:
                        _a.sent();
                        this.backfield[i] = null;
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        if (!(Math.random() < 0.4)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.playRandomBackfield()];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    AutoBattler.prototype.playBackfield = function (card, i) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.backfield[i]) return [3 /*break*/, 2];
                        this.backfield[i] = Card.castCardName(card);
                        return [4 /*yield*/, this.backfield[i].onDraw(this.battle, 1)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    AutoBattler.prototype.playRandomBackfield = function () {
        return __awaiter(this, void 0, void 0, function () {
            var card, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        card = pickRandom(this.cardPool);
                        i = this.getRandomOpenSlot();
                        if (!(i > -1)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.playBackfield(card, i)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    AutoBattler.prototype.getRandomOpenSlot = function () {
        var open = [];
        for (var i = 0; i < this.battle.fieldSize; i++) {
            if (!this.backfield[i])
                open.push(i);
        }
        return open.length ? pickRandom(open) : -1;
    };
    AutoBattler.prototype.overkillDamage = function (amount, i) {
        if (this.backfield[i]) {
            this.backfield[i].stats[1] -= amount;
            if (this.backfield[i].stats[1] <= 0) {
                this.backfield[i] = null;
            }
        }
    };
    AutoBattler.prototype.performAction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, sleep(AI_SPEED)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, false];
                }
            });
        });
    };
    return AutoBattler;
}());
var Player = /** @class */ (function () {
    function Player() {
        this.boonBones = 0;
        //this.deck = new Deck(randomSelectionFrom(default_deck, 20 + Math.floor(Math.random() * 30)));
        var sidedeck = pickRandom(sidedecks);
        this.sidedeck = new Card(sidedeck);
        this.deck = Player.generateDeck(sidedeck);
    }
    Player.generateDeck = function (sidedeck) {
        // Selects 50 random cards from the given sidedeck theme (10% for out-of-theme cards, 100% for rare cards)
        // Then sorts by player value and returns deck with N most valuable cards
        var selection = randomSelectionFrom(default_deck.filter(function (c) {
            var model = card_models[c];
            if (!model.cost && !model.mox || model.rare || Math.random() < 0.1)
                return true;
            switch (sidedeck) {
                case "squirrel": return model.cost == "blood";
                case "empty_vessel": return model.cost == "energy";
                case "skeleton": return model.cost == "bones";
                case "mox_crystal": return !!model.mox;
                default: return true;
            }
        }), 50).sort(function (a, b) {
            return card_models[b].playerValue - card_models[a].playerValue;
        });
        return new Deck(selection.slice(0, 20 + Math.floor(Math.random() * 20)));
    };
    Player.prototype.battlerInstance = function (battle, index) {
        var player = new PlayerBattler(battle, index, new Deck(this.deck.cards), new SideDeck(this.sidedeck), [], this.totem);
        player.drawFrom(player.sidedeck, true);
        player.drawFrom(player.deck, true, 3);
        player.drawn = true;
        player.bones += this.boonBones;
        return player;
    };
    return Player;
}());
for (var name_1 in card_models) {
    var model = card_models[name_1];
    model.stats = model.stats || [0, 1, 0];
    model.sigils = model.sigils || [];
    model.playerValue = (new Card(name_1)).cardPlayerValue;
    model.nonplayerValue = (new Card(name_1)).cardNonplayerValue;
    if (model.modded)
        continue;
    default_auto.push(name_1);
    if (model.event == "none")
        continue;
    default_deck.push(name_1);
    default_deck.push(name_1); //*/
}
function testBattle() {
    return __awaiter(this, void 0, void 0, function () {
        var stats, i, player1, player2, options, battle, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    stats = {
                        duel: [0, 0],
                        solo: [0, 0]
                    };
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 4];
                    player1 = new Player();
                    player2 = new Player();
                    options = {
                        candles: 3,
                        fieldSize: Math.random() < 0.5 ? 4 : 5,
                        terrain: pickRandom(terrains),
                        scale: i % 2 == 0 ? 0 : -1
                    };
                    battle = (i % 2 == 0) ? new SoloBattle(player1, options) : new DuelBattle(player1, player2, options);
                    return [4 /*yield*/, battle.awaitCompletion()];
                case 2:
                    result = _a.sent();
                    stats[battle.isHuman(1) ? "duel" : "solo"][result]++;
                    console.log("\nPlayer ".concat(result, " wins!"), stats);
                    return [4 /*yield*/, sleep(AI_SPEED)];
                case 3:
                    _a.sent();
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
testBattle();
