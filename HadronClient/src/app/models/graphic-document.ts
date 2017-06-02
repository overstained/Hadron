import { Path } from './path';
import { PriorityQueue } from './priority-queue';

export class GraphicDocument {
	private _content :Array<Path>;

	constructor() {
		this._content = [];
	}

	peekAtPath() :Path {
		return this._content[this._content.length -1];
	}

	popFromContent() {
		if(this._content.length !== 0) {
			this._content.pop();
		}
	}

	pushToContent(path :Path) {
		this._content.push(path);
	}

	clearContent() {
		this._content = [];
	}

	get content() :Array<Path> {
		return this._content;
	}
}