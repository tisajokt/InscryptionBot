import { readFileSync, writeFile } from "fs";
import { jsonMember, jsonObject, TypedJSON } from "typedjson";
import { BattleOptions } from "./commands/battle";
import { Player } from "./Game";
import { resolve } from "path";

const usersDataFilePath = resolve(__dirname, "../data/user/users.json");

@jsonObject
export class User {
	@jsonMember
	id: string;
	battleOptions: BattleOptions;
	_soloPlayer: Player;
	_duelPlayer: Player;
	constructor(id: string) {
		this.id = id;
		this.battleOptions = {};
	}
	get soloPlayer(): Player {
		this._soloPlayer = this._soloPlayer || new Player();
		return this._soloPlayer;
	}
	get duelPlayer(): Player {
		this._duelPlayer = this._duelPlayer || new Player();
		return this._duelPlayer;
	}
	static usersList = [];
	static usersMap: Map<string, User> = new Map();
	static initUsersData(): void {
		const data = String(readFileSync(usersDataFilePath));
		this.usersList = userSerializer.parseAsArray(data);
	}
	static get(id: string): User {
		if (this.usersMap.has(id)) {
			console.log(`User ${id} found in index`)
			return this.usersMap.get(id);
		}
		var user = this.usersList.find(u => u.id == id);
		if (!user) {
			user = new User(id);
			this.usersList.push(user);
			console.log(`User ${id} created`)
		} else {
			console.log(`User ${id} found from savedata`)
		}
		this.usersMap.set(id, user);
		return user;
	}
	static async saveUsersData(): Promise<void> {
		const data = userSerializer.stringifyAsArray(this.usersList);
		await writeFile(usersDataFilePath, data, null);
	}
}
const userSerializer = new TypedJSON(User);
User.initUsersData();
