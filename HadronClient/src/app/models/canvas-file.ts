import { GenericConstants } from '../generics/generics.constants';

export class CanvasFile {
	private _name :string;
	private _uploadedDate :number;
	private _size :number;
	private _url :string;

	contructor(name :string, size: number, uploadedDate: number) {
		this._name = name;
		this._size = size; 
		this._uploadedDate = uploadedDate;
	}

	set name(name :string) {
		this._name = name;
	}

	get name() :string {
		return this._name;
	}
	set size(size :number) {
		this._size = size;
	}

	get size() :number {
		return this._size;
	}

	set uploadedDate(uploadedDate :number) {
		this._uploadedDate = uploadedDate;
	}

	get uploadedDate() :number {
		return this._uploadedDate;
	}

	buildUrl() {
		this._url = `${GenericConstants.BASE_FILE_URL}${this._name}.png`;
	}

	get url() :string {
		return this._url;
	}
}