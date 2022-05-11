import { readFileSync, writeFileSync } from "fs";
import { jsonArrayMember, jsonMember, jsonObject, TypedJSON } from "typedjson";
import { BattleOptions } from "./commands/battle";
import { Card, cardName, MIN_COMPETITIVE_CARDS, Player } from "./Game";
import { resolve } from "path";

const usersDataFilePath = resolve(__dirname, "../data/user/users.json");

@jsonObject({
	onDeserialized: "onDeserialized"
})
export class AppUser {
	@jsonMember
	id: string;
	@jsonMember
	battleOptions: BattleOptions;
	@jsonArrayMember(Player)
	players: Player[];
	@jsonMember
	activePlayer: number;
	constructor(id: string) {
		this.id = id;
		this.battleOptions = new BattleOptions();
		this.players = [];
	}
	static usersList = [];
	static usersMap: Map<string, AppUser> = new Map();
	static initUsersData(): void {
		const data = String(readFileSync(usersDataFilePath)) || "[]";
		this.usersList = userSerializer.parseAsArray(data);
	}
	static get(id: string): AppUser {
		if (this.usersMap.has(id)) {
			console.log(`User ${id} found in index`);
			return this.usersMap.get(id);
		}
		var user = this.usersList.find(u => u.id == id);
		if (!user) {
			user = new AppUser(id);
			this.usersList.push(user);
			AppUser.saveUsersData();
			console.log(`User ${id} created`);
		} else {
			console.log(`User ${id} found from savedata`);
		}
		this.usersMap.set(id, user);
		return user;
	}
	static isSavePending: boolean;
	static saveUsersData(immediate: boolean=false): void {
		if (AppUser.isSavePending) return;
		AppUser.isSavePending = true;
		setTimeout(() => {
			const data = userSerializer.stringifyAsArray(AppUser.usersList);
			writeFileSync(usersDataFilePath, data);
			AppUser.isSavePending = false;
		}, immediate ? 0 : 10000);
	}
	onDeserialized(): void {
		AppUser.usersMap.set(this.id, this);
	}
	getActivePlayer(competitive: boolean=false): Player {
		if (!competitive) {
			return this.players[this.activePlayer];
		} else {
			const player = this.players[this.activePlayer];
			if (player && player.deck.cards.length >= MIN_COMPETITIVE_CARDS) {
				return player;
			}
		}
	}
	createPlayer(sidedeck?: cardName, deck?: (cardName|Card)[]): Player {
		if (this.players.length < 5) {
			const player = new Player(sidedeck, deck);
			this.activePlayer = this.players.length;
			this.players.push(player);
			AppUser.saveUsersData();
			return player;
		}
	}
}
const userSerializer = new TypedJSON(AppUser);
