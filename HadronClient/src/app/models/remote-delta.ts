import { Comparable } from './comparable';

export class RemoteDelta extends Comparable<RemoteDelta> {
	private _delta :any;
	private _timestamp :number;

	constructor(delta :any, timestamp :number) {
		super();
		this._delta = delta;
		this._timestamp = timestamp;
	}

	get delta() :any {
		return this._delta;
	}

	get timestamp() :number {
		return this._timestamp;
	}

	compareTo(object :RemoteDelta) :number {
		return this._timestamp - object.timestamp;
	}
}