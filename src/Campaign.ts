import { jsonArrayMember, jsonMember, jsonObject } from "typedjson";
import { Player } from "./Game";
import { generateRandomID } from "./util";

export type eventType = "battle"|"totem_battle"|"boss_battle"|
	"campfire"|"sigil_sacrifice"|"bone_sacrifice"|
	"pick_random"|"pick_tribe"|"pick_cost"|"card_pack"|
	"mushrooms"|"trapper"|"trader"|"woodcarver";

@jsonObject
export class Event {
	@jsonMember
	id: string;
	@jsonMember
	type: eventType;
	@jsonMember
	completed: boolean;
	constructor(type: eventType) {
		this.id = generateRandomID(8);
		this.type = type;
	}
	continue: (value: unknown)=>void;
	async waitForContinue(): Promise<unknown> {
		return await new Promise(resolve => {
			this.continue = (value: unknown) => {
				delete this.continue;
				resolve(value);
			}
		})
	}
	async activate(): Promise<void> {
		await this.waitForContinue();
	}
}

@jsonObject
export class Campaign {
	@jsonMember
	player: Player;
}
