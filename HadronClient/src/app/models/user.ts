import { RoadMap } from './road-map';

export class User {
	private _email :string;
	private _assignedUserColor :string;
	private _roadMap :RoadMap;

	constructor(email :string, assignedUserColor :string) {
		this._email = email;
		this._assignedUserColor = assignedUserColor;
	}

	get email() :string {
		return this._email;
	}

	set email(email :string) {
		this._email = email;
	}

	get assignedUserColor() :string {
		return this._assignedUserColor;
	}

	set assignedUserColor(assignedUserColor :string) {
		this._assignedUserColor = assignedUserColor;
	}

	get roadMap() :RoadMap {
		return this._roadMap;
	}

	set roadMap(roadMap :RoadMap) {
		this._roadMap = roadMap;
	}
}