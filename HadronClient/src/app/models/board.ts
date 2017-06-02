import { TextDocument } from './text-document';
import { GraphicDocument } from './graphic-document';

export class Board {
	private _id :string;
	private _name :string;
	private _textDocument :TextDocument;
	private _graphicDocument :GraphicDocument;
	private _isShared :boolean;
	private _ownerEmail :string;

	constructor(id: string, name :string, ownerEmail :string) {
		this._id = id;
		this._name = name;
		this._ownerEmail = ownerEmail;
	}

	set id(id :string) {
		this._id = id;
	}

	get id() :string {
		return this._id;
	}

	set name(name :string) {
		this._name = name;
	}

	get name() :string {
		return this._name;
	}

	set textDocument(textDocument :TextDocument) {
		this._textDocument = textDocument;
	}

	get textDocument() :TextDocument {
		return this._textDocument;
	}

	set graphicDocument(graphicDocument :GraphicDocument) {
		this._graphicDocument = graphicDocument;
	}

	get graphicDocument() :GraphicDocument {
		return this._graphicDocument;
	}

	set isShared(isShared :boolean) {
		this._isShared = isShared;
	}

	get isShared() :boolean {
		return this._isShared;
	}

	set ownerEmail(ownerEmail :string) {
		this._ownerEmail = ownerEmail;
	}

	get ownerEmail() :string {
		return this._ownerEmail;
	}
}