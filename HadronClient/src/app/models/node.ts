export class Node {
	private _id :number;
	private _clusterId :string;
	private _label :string;
	private _description :string;

	Node(id :number) {
		this._id = id;
	}

	get id() :number {
		return this._id;
	}

	set id(id :number) {
		this._id = id;
	}

	get label() :string {
		return this._label;
	}

	set label(label :string) {
		this._label = label;
	}

	get description() :string {
		return this._description;
	}

	set description(description :string) {
		this._description = description;
	}
}