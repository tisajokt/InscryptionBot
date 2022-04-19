import { readFileSync, writeFile } from "fs";
import { jsonArrayMember, jsonMember, jsonObject, TypedJSON } from "typedjson";
import { BattleOptions } from "./commands/battle";
import { Player } from "./Game";
import { resolve } from "path";

const usersDataFilePath = resolve(__dirname, "../data/user/users.json");

@jsonObject
export class AppUser {
	@jsonMember
	id: string;
	@jsonMember
	battleOptions: BattleOptions;
	@jsonArrayMember(Player)
	players: Player[];
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
	static savePromise: Promise<void>;
	static async saveUsersData(): Promise<void> {
		if (AppUser.savePromise) {
			await AppUser.savePromise;
		}
		const data = userSerializer.stringifyAsArray(AppUser.usersList);
		AppUser.savePromise = new Promise((resolve, reject) => {
			writeFile(usersDataFilePath, data, (err) => {
				delete AppUser.savePromise;
				if (err) reject(err);
				else resolve();
			});
		});
		return AppUser.savePromise;
	}
}
const userSerializer = new TypedJSON(AppUser);
AppUser.initUsersData();
