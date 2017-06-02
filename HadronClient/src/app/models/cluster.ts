export class Cluster {
	private _id :number;
	private _color :string;
	private _label :string;
	private _description :string;

	Cluster(id: number) {
		this._id = id;
	}

	get id() :number {
		return this._id;
	}

	set id(id :number) {
		this._id = id;
	}

	get color() :string {
		return this._color;
	}

	set color(color :string) {
		this._color = color;
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