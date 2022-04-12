
export class User {
	constructor(userId: string) {

	}
	static users: Map<string, User> = new Map();
	static get(userId: string): User {
		const user = User.users[userId] || new User(userId);
		return User[userId] = user;
	}
}
