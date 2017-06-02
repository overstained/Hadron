import { Comparable } from './comparable';

export class Path {
	private _colorStroke :string;
	private _brushSize :string;
	private _path :Array<[number, number]>;

	constructor() {
	}

	set colorStroke(colorStroke :string) {
		this._colorStroke = colorStroke;
	}

	get colorStroke() :string {
		return this._colorStroke;
	}

	set brushSize(brushSize :string) {
		this._brushSize = brushSize;
	}

	get brushSize() :string {
		return this._brushSize;
	}

	set path(path :Array<[number, number]>) {
		this._path = path;
	}

	get path() :Array<[number, number]> {
		return this._path;
	}
}