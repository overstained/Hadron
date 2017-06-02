import { User } from './user';

export class RoomUsers {
	private _users: Array<User>;

	constructor() {
		this._users = [];
	}

	public addUser(user: User) {
		this._users.push(user);
	}

	public getUsers() :Array<User> {
		return this._users;
	}
}