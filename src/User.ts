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
	@jsonMember
	battleOptions: BattleOptions;
	@jsonMember
	_soloPlayer: Player;
	@jsonMember
	_duelPlayer: Player;
	constructor(id: string) {
		this.id = id;
		this.battleOptions = new BattleOptions();
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
			console.log(`User ${id} found in index`);
			return this.usersMap.get(id);
		}
		var user = this.usersList.find(u => u.id == id);
		if (!user) {
			user = new User(id);
			this.usersList.push(user);
			User.saveUsersData();
			console.log(`User ${id} created`);
		} else {
			console.log(`User ${id} found from savedata`);
		}
		this.usersMap.set(id, user);
		return user;
	}
	static savePromise: Promise<void>;
	static async saveUsersData(): Promise<void> {
		if (User.savePromise) {
			await User.savePromise;
		}
		const data = userSerializer.stringifyAsArray(User.usersList);
		User.savePromise = new Promise((resolve, reject) => {
			writeFile(usersDataFilePath, data, (err) => {
				delete User.savePromise;
				if (err) reject(err);
				else resolve();
			});
		});
		return User.savePromise;
	}
}
const userSerializer = new TypedJSON(User);
User.initUsersData();
