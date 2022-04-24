import { jsonArrayMember, jsonMember, jsonObject } from "typedjson";
import { Player } from "./Game";
import { generateRandomID } from "./util";

export type eventType = "battle"|"totem_battle"|"boss_battle"|
	"campfire"|"sigil_sacrifice"|"bone_sacrifice"|
	"pick_random"|"pick_tribe"|"pick_cost"|"card_pack"|
	"mushrooms"|"trapper"|"trader"|"woodcarver";

const eventEmojis = new Map<eventType, string>([
	["battle", "⚔️"],
	["totem_battle", "⚔️"],
	["boss_battle", "⚔️"],
	["campfire", "🏕️"],
	["sigil_sacrifice", "🗡️"],
	["bone_sacrifice", "🗡️"],
	["pick_random", "🃏"],
	["pick_tribe", "🃏"],
	["pick_cost", "🃏"],
	["card_pack", "🃏"],
	["mushrooms", "🍄"],
	["trapper", "🪤"],
	["trader", "💰"],
	["woodcarver", "🗿"]
])

@jsonObject
export class Campaign {
	@jsonMember
	player: Player;
	@jsonArrayMember(String)
	map: eventType[];
}
