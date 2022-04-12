import users from "../data/users/users.json";

export class User {
	constructor(userId: string) {

	}
	static users = {};
	static get(userId: string): User {
		const user = User.users[userId] || new User(userId);
		return User[userId] = user;
	}
}
