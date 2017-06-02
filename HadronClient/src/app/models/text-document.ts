import { RoomUsers } from './room-users'; 
import { User } from './user';

export class TextDocument {
	private _name :string;
	private _content :any;
	private _roomId :string;
	private _master :boolean;
	private _roomUsers :RoomUsers;

	constructor(name :string) {
		this._name = name;
	}

	set name(name :string) {
		this._name = name;
	}

	get name() :string {
		return this._name;
	}

	set content(content :any) {
		this._content = content;
	}

	get content() :any {
		return this._content;
	}

	set roomId(roomId :string) {
		this._roomId = roomId;
	}

	get roomId() :string {
		return this._roomId;
	}

	set master(master :boolean) {
		this._master = master;
	}

	get master() :boolean {
		return this._master;
	}

	set roomUsers(roomUsers :RoomUsers) {
		this._roomUsers = roomUsers;
	}

	get roomUsers() :RoomUsers {
		return this._roomUsers;
	}

	addRoomUser(user :User) {
		this._roomUsers.addUser(user);
	}
}