import { TextDocument } from '../models/text-document';
import { User } from '../models/user';
import { Path } from '../models/path';
import { GraphicDocument } from '../models/graphic-document';
import { Board } from '../models/board';
import { BoardSignature} from '../models/board-signature';
import { CanvasFile } from '../models/canvas-file';

export class Tools {
	public static mapToFileArray(data :Array<any>) :Array<File> {
		if(!data) {
			return [];
		}
		let files = [];
		for(let file of data) {
			let canvasFile = new CanvasFile();
			canvasFile.name = file.name;
			canvasFile.size = file.size;
			canvasFile.uploadedDate = file.uploadedDate;
			canvasFile.buildUrl();
			files.push(canvasFile);
		}
		return files;
	}

	public static mapToBoardList(data :Array<any>) :Array<BoardSignature> {
		if(!data) {
			return null;
		} else {
			let boardList = [];
			for(let boardSignature of data) {
				boardList.push(new BoardSignature(boardSignature.name, boardSignature.ownerEmail, boardSignature.isShared));
			}
			return boardList;
		}
	}

	public static mapToBoard(data: any) :Board {
		if(!data) {
        		return null;
    	} else {
			let boardInst = new Board(data.id, data.name, data.ownerEmail);
                boardInst.textDocument = Tools.mapToTextDocument(data.textDocument);
    			boardInst.isShared = data.shared.userIds.length > 0;
    		return boardInst;
    	}
	}

	public static mapToTextDocument(data :any) :TextDocument {
		if(!data) {
			return null;
		} else {
			let textDocument = new TextDocument(data.name);
			if(data.roomId) {
				textDocument.roomId = data.roomId;
			}
			if(data.content) {
				textDocument.content = data.content;
			}
			return textDocument;
		}
	}
}
