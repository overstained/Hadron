export class BoardSignature {
	private _name :string;
	private _ownerEmail: string;
	private _isShared :boolean;

	constructor(name :string, ownerEmail: string, isShared :boolean) {
		this._name = name;
		this._ownerEmail = ownerEmail;
		this._isShared = isShared;
	}

	get name() :string {
		return this._name;
	}

	set name(name : string) {
		this._name = name;
	}

	get ownerEmail() :string {
		return this._ownerEmail;
	}

	set ownerEmail(ownerEmail :string) {
		this._ownerEmail = ownerEmail;
	}

	get isShared() :boolean {
		return this._isShared;
	}

	set isShared(isShared :boolean) {
		this._isShared = isShared;
	}
}