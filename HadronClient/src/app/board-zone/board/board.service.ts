import { Injectable } from '@angular/core';
import { Board } from '../../models/board';
import { Path } from '../../models/path';
import { User } from '../../models/user';
import { RoomUsers } from '../../models/room-users';
import { GraphicDocument } from '../../models/graphic-document';
import { BoardSignature} from '../../models/board-signature';
import { AuthenticationService } from '../../authentication-zone/app-authentication/authentication.service';
import { GenericConstants } from '../../generics/generics.constants';
import { Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { HadronHttp } from '../../generics/generics.interceptor';
import { Tools } from '../../generics/generics.tools';
import { BoardConstants } from './board.constants';
import { PriorityQueue } from '../../models/priority-queue';
import { RemoteDelta } from '../../models/remote-delta';
import { URLSearchParams } from '@angular/http';
import { Uploader }      from 'angular2-http-file-upload';
import { QuillUpload }  from '../../models/quill-upload';
import { Subject } from 'rxjs/Subject';

import * as io from 'socket.io-client'; 
	
declare var paper: any;

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class BoardService {
	private board :Board;
	private quillEditor :any;
	private quillBuffer :Array<any>;
	private paper :any;
	private saveTimerId :any;
	private lastModifiedTime :number; 
	private socket :any;
	private deltaQueue :PriorityQueue<RemoteDelta>;
	private lastCursorIndexPosition :number;

	private logout = new Subject<boolean>();
	logout$ = this.logout.asObservable();

	private updateRoomUsers = new Subject<RoomUsers>();
	updateRoomUsers$ = this.updateRoomUsers.asObservable();

	private lastUploadedFileName :string;

	constructor(private hadronHttp :HadronHttp,
		private authenticationService: AuthenticationService,
		private uploaderService: Uploader) {
		hadronHttp.logout$.subscribe(logout => {
			if(logout) {
				this.clearAndLogout();
				this.logout.next(true);
			}
	    });
	    this.deltaQueue = new PriorityQueue<RemoteDelta>();
	    this.quillBuffer = [];
	}

	createBoard(name :string) {
		return this.hadronHttp
        .post(`${GenericConstants.BASE_URL}${BoardConstants.CREATE_BOARD_URL}`, { name })
        .map((response :Response) => {
        	if(this.socket && this.socket.connected) {
        		this.socket.disconnect();
        	}
        	this.board = Tools.mapToBoard(response.json());
        	this.board.graphicDocument = new GraphicDocument();
			return {};
        })
        .catch((error :Response | any) => {
			return Observable.throw(error);
        });
	}

	createTextDocument(name :string) {
		return this.hadronHttp
        .post(`${GenericConstants.BASE_URL}${BoardConstants.CREATE_TEXT_DOCUMENT_URL}`, { 
        	ownerEmail: this.board.ownerEmail,
        	boardName: this.board.name,
        	textDocumentName: name
         })
        .map((response :Response) => {
        	this.board.textDocument = Tools.mapToTextDocument(response.json());
        	if(this.socket && this.socket.connected) {
        		this.socket.disconnect();
        	}
        	if(this.isShared() && this.hasTextDocument()) {
        		this.connectToServer(this.getTextDocumentRoomId());
        	}
			return {};
        })
        .catch((error :Response | any) => {
			return Observable.throw(error);
        });
	}

	getLastModifiedBoard() {
		return this.hadronHttp
        .get(`${GenericConstants.BASE_URL}${BoardConstants.GET_LAST_MODIFIED_BOARD_URL}`)
        .map((response :Response) => {
        	this.board = Tools.mapToBoard(response.json());
        	this.board.graphicDocument = new GraphicDocument();
        	if(this.socket && this.socket.connected) {
        		this.socket.disconnect();
        	}
        	if(this.isShared() && this.hasTextDocument() && !this.isConnected()) {
        		this.connectToServer(this.getTextDocumentRoomId());
        	}
        	if(!this.isShared() || this.isMaster()) {
        		this.updateQuillFromTextDocument();
				this.quillEditor.enable();
        	}
			return {};
        })
        .catch((error :Response | any) => {
			return Observable.throw(error);
        });
	}

	getMembers() {
		return this.hadronHttp
        .post(`${GenericConstants.BASE_URL}${BoardConstants.GET_BOARD_MEMBERS_URL}`, {
        	boardName: this.board.name
        })
        .map((response :Response) => {
			return response.json() || {};
        })
        .catch((error :Response | any) => {
			return Observable.throw(error);
        });
	}

	shareBoard(email) {
		return this.hadronHttp
        .post(`${GenericConstants.BASE_URL}${BoardConstants.SHARE_BOARD_URL}`, {
        	shareEmail: email,
        	boardName: this.board.name
        })
        .map((response :Response) => {
			return response.json() || {};
        })
        .catch((error :Response | any) => {
			return Observable.throw(error);
        });
	}

	changeBoardName(newBoardName :string) {
		return this.hadronHttp
        .post(`${GenericConstants.BASE_URL}${BoardConstants.CHANGE_BOARD_NAME_URL}`, {
        	ownerEmail: this.board.ownerEmail,
        	boardName: this.board.name,
        	newBoardName: newBoardName
         })
        .map((response :Response) => {
			return {};
        })
        .catch((error :Response | any) => {
			return Observable.throw(error);
        });
	}

	changeTextDocumentName(newTextDocumentName :string) {
		return this.hadronHttp
        .post(`${GenericConstants.BASE_URL}${BoardConstants.CHANGE_TEXT_DOCUMENT_NAME_URL}`, {
        	boardName: this.board.name,
        	ownerEmail: this.board.ownerEmail,
        	textDocumentName: this.board.textDocument.name,
        	newTextDocumentName: newTextDocumentName
         })
        .map((response :Response) => {
			return {};
        })
        .catch((error :Response | any) => {
			return Observable.throw(error);
        });
	}

	getBoard(ownerEmail :string, boardName :string) {
		if(this.saveTimerId) {
			clearInterval(this.saveTimerId);
			this.saveTimerId = null;
			this.lastModifiedTime = null;
		}
		this.saveTextDocumentContent()
		.subscribe(data =>{},error=>{});
		return this.hadronHttp
        .post(`${GenericConstants.BASE_URL}${BoardConstants.GET_BOARD_BY_NAME_URL}`, {
        	ownerEmail: ownerEmail,
        	boardName: boardName
        })
        .map((response :Response) => {
        	this.board = Tools.mapToBoard(response.json());
        	this.board.graphicDocument = new GraphicDocument();
        	if(this.socket && this.socket.connected) {
        		this.socket.disconnect();
        	}
        	if(this.isShared() && this.hasTextDocument() && !this.isConnected()) {
        		this.connectToServer(this.getTextDocumentRoomId());
        	}
        	if(!this.isShared() || this.isMaster()) {
        		this.updateQuillFromTextDocument();
				this.quillEditor.enable();
        	}
			return {};
        })
        .catch((error :Response | any) => {
			return Observable.throw(error);
        });
	}

	hasBoard() :boolean{
		return this.board != null;
	}

	isOwner() :boolean {
		return this.authenticationService.getClaims().email === this.board.ownerEmail;
	}

	isShared() {
		return this.board.isShared;
	}

	hasTextDocument() :boolean {
		return this.board.textDocument != null;	
	}

	getTextDocumentRoomId() :string {
		return this.board.textDocument.roomId;
	}

	getOwnerEmail() {
		return this.board.ownerEmail;
	}

	getCurrentBoardName() :string{
		return this.board.name;
	}

	getCurrentTextDocumentName() {
		return this.board.textDocument.name;
	}

	getBoardList() {
		return this.hadronHttp
        .get(`${GenericConstants.BASE_URL}${BoardConstants.LIST_BOARDS_URL}`)
        .map((response :Response) => {
        	let  boardList = Tools.mapToBoardList(response.json());
			return boardList || {};
        })
        .catch((error :Response | any) => {
			return Observable.throw(error);
        });
	}

	getTextDocumentList() {
		return this.hadronHttp
        .post(`${GenericConstants.BASE_URL}${BoardConstants.LIST_TEXT_DOCUMENTS_URL}`, {
        	boardName: this.board.name
        })
        .map((response :Response) => {
        	let  textDocumentList = Tools.mapToBoardList(response.json());
			return textDocumentList || {};
        })
        .catch((error :Response | any) => {
			return Observable.throw(error);
        });
	}

	getTextDocument(ownerEmail, name) {
		if(this.saveTimerId) {
			clearInterval(this.saveTimerId);
			this.saveTimerId = null;
			this.lastModifiedTime = null;
		}
		this.saveTextDocumentContent()
		.subscribe(data =>{},error=>{});
		return this.hadronHttp
        .post(`${GenericConstants.BASE_URL}${BoardConstants.GET_TEXT_DOCUMENT_BY_NAME_URL}`, {
        	ownerEmail: ownerEmail,
        	boardName: this.board.name,
        	textDocumentName: name
        })
        .map((response :Response) => {
        	let  textDocument = Tools.mapToTextDocument(response.json());
        	this.board.textDocument = textDocument;
        	if(this.socket && this.socket.connected) {
        		this.socket.disconnect();
        	}
        	if(this.isShared() && this.hasTextDocument() && !this.isConnected()) {
        		this.connectToServer(this.getTextDocumentRoomId());
        	}
        	if(!this.isShared() || this.isMaster()) {
        		this.updateQuillFromTextDocument();
				this.quillEditor.enable();
        	}
			return textDocument || {};
        })
        .catch((error :Response | any) => {
			return Observable.throw(error);
        });
	}

	updateQuillFromTextDocument() {
		if(this.board && this.board.textDocument && this.board.textDocument.content && this.quillEditor) {
			this.quillEditor.setContents(this.board.textDocument.content, 'initial');
		}
	}

	setBoard(board :Board) :void{
		this.board = board;
        this.board.graphicDocument = new GraphicDocument();
        if(this.quillEditor)
		if(!this.isShared() || this.isMaster()) {
			this.updateQuillFromTextDocument();
			this.quillEditor.enable();
		}
		if(this.isShared() && !this.isConnected()) {
			this.connectToServer(this.board.textDocument.roomId);
		}
	}

	saveTextDocumentContent() {
		console.log('saving');
		return this.hadronHttp
        .post(`${GenericConstants.BASE_URL}${BoardConstants.SAVE_TEXT_DOCUMENT_URL}`, {
        	ownerEmail: this.board.ownerEmail,
        	boardName: this.board.name,
        	textDocumentName: this.board.textDocument.name,
        	delta: this.quillEditor.getContents()
        })
        .map((response :Response) => {
			return {};
        })
        .catch((error :Response | any) => {
			return Observable.throw(error);
        });
	}

	setPaper(paper :any) :void {
		this.paper = paper;
	}

	addPath(path :any, color: string) :void {
		if(this.board && this.board.graphicDocument) {
			let newPath = new Path();
			newPath.path = path;
			newPath.colorStroke = color;
			this.board.graphicDocument.pushToContent(newPath);
		}
	}

	getGraphicContent() :Array<Path> {
		return this.board.graphicDocument.content;
	}

	uploadBlob(blob: any) {
		let quillUpload = new QuillUpload(blob);
    	quillUpload.formData = { email: this.board.ownerEmail, boardId: this.board.id };
    	this.uploaderService.onSuccessUpload = (item, response, status, headers) => {
          	this.lastUploadedFileName = response.name;
        };
        this.uploaderService.onErrorUpload = (item, response, status, headers) => {
        };
        this.uploaderService.onCompleteUpload = (item, response, status, headers) => {
            this.lastUploadedFileName = response.name;
        };
    	this.uploaderService.upload(quillUpload);
	}

	insertLastUploadedFile() {
		if(this.lastUploadedFileName) {
			this.quillEditor.insertEmbed(this.quillEditor.getText().length, 'image', `${GenericConstants.BASE_FILE_URL}${this.lastUploadedFileName}`);
		}
	}

	insertFromGallery(url) {
		this.quillEditor.insertEmbed(this.quillEditor.getText().length, 'image', url);
	}

	getFilesForUser() {
		if(this.isOwner()) {
			return this.hadronHttp
	        .get(`${GenericConstants.BASE_URL}${BoardConstants.GET_FILES_FOR_USER_URL}`)
	        .map((response :Response) => {
				return Tools.mapToFileArray(response.json());
	        })
	        .catch((error :Response | any) => {
				return Observable.throw(error);
	        });
		} else {
			return this.hadronHttp
	        .post(`${GenericConstants.BASE_URL}${BoardConstants.GET_FILES_FOR_BOARD_URL}`, {
	        	ownerEmail: this.board.ownerEmail,
	        	boardId: this.board.id
	        })
	        .map((response :Response) => {
				return Tools.mapToFileArray(response.json());
	        })
	        .catch((error :Response | any) => {
				return Observable.throw(error);
	        });
		}
	}

	clearCanvasPaths() {
		this.board.graphicDocument.clearContent();
	}

    popCanvasPath() {
    	this.board.graphicDocument.popFromContent();
    }


	setQuillEditor(quillEditor :any) :void {
		this.quillEditor = quillEditor;
		this.quillEditor.disable();
		if(this.hasBoard())
		if(!this.isShared() || this.isMaster()) {
			this.updateQuillFromTextDocument();
			this.quillEditor.enable();
		}
		this.quillEditor.on('editor-change', (eventName, ...args) => {
			if(eventName === 'selection-change' && args[2] !== 'self') {
				this.lastCursorIndexPosition = args[0].index;
			}
		});
		this.quillEditor.on('text-change', (newDelta, oldDelta, source) => {
				if(this.isShared()) {
					if(source !== 'initial' && source !== 'remote') {
						this.socket.emit('deltaSyncEvent', {
							delta: newDelta,
							timestamp: Date.parse(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}))
						});
					}
				}
				if (this.isMaster() || !this.isShared()) { 
				  	  this.lastModifiedTime = Date.now();
			 		  if(source !== 'initial') {
					  	if(!this.saveTimerId) {
					  		this.saveTimerId = setInterval(() => {
							  	if(Date.now() - this.lastModifiedTime > (BoardConstants.IDLE_INTERVAL * 1000)) {
							  		clearInterval(this.saveTimerId);
							  		this.saveTimerId = null;
							  	}
					  			this.saveTextDocumentContent().subscribe(data=>{},error=>{});
					  		}, BoardConstants.QUILL_SAVE_INTERVAL * 1000);
					  	}
					  } else {
					  	this.quillEditor.enable();
					  }
				}
				if(this.isShared() && !this.isMaster()) {
					if(this.deltaQueue) {
					  	for(let remoteDelta of this.deltaQueue.asArray()) {
					  		this.quillEditor.updateContents(remoteDelta.delta, 'remote');
					  	}
						this.deltaQueue = null;
				  	}
					this.quillEditor.enable();
				}
		});
	}

	clearAndLogout() :void{
		this.authenticationService.logout();
		this.board = null;
    	if(this.socket && this.socket.connected) {
    		this.socket.disconnect();
    	}
	}

	unfocusQuillEditor() :void {
		this.quillEditor.blur();
	}

	public isMaster() :boolean {
		return this.board.textDocument.master;
	}

	public isConnected() {
		return this.socket && this.socket.connected;
	}

	public setMaster(value :boolean) {
		this.board.textDocument.master = value;
	}

	public connectToServer(roomId :string) :void {
		let user = this.authenticationService.getClaims();
		this.socket = io(GenericConstants.BASE_SOCKET_URL, {
			reconnection: true,
			query: {
				roomId: roomId,
				assignedUserColor: user.assignedUserColor,
				email: user.email
			}
		});

		this.socket.on('connect', () => {
			let roomUsers = new RoomUsers();
			roomUsers.addUser(user);
			this.board.textDocument.roomUsers = roomUsers;
			this.updateRoomUsers.next(roomUsers);
		});

		this.socket.on('newArrival', newArrival => {
			this.board.textDocument.addRoomUser(new User(newArrival.email, newArrival.assignedUserColor));
		});

		this.socket.on('someoneLeft', data => {
			let roomUsers = this.board.textDocument.roomUsers.getUsers();
			let index = -1;
			for(let i=0;i<roomUsers.length;i++) {
				if(roomUsers[i].email === data.email) {
					index = i;
				}
			}
			if(index > -1) {
				roomUsers.splice(index,index);
			}
			this.updateRoomUsers.next(this.board.textDocument.roomUsers);
		});

		this.socket.on('roomiesListEvent', data => {
			for(let i=0;i<data.roomies.length;i++) {
				var user = new User(data.roomies[i].email, data.roomies[i].assignedUserColor);
				this.board.textDocument.addRoomUser(user);
			}
			this.updateRoomUsers.next(this.board.textDocument.roomUsers);
		});

		this.socket.on('masterAssignEvent', () => {
			this.setMaster(true);
			//if it's not updated
			if(this.quillEditor.getText().trim().length === 0) {
				this.updateQuillFromTextDocument();
			}
			this.deltaQueue = null;
		});

		this.socket.on('noobSyncRequestEvent', data => {
			if(this.isMaster()) {
				this.socket.emit('contentSyncEvent', {
					socketId: data.socketId,
					content: this.quillEditor.getContents(),
					timestamp: Date.parse(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}))
				});
			}
		});

		this.socket.on('contentSyncEvent', data => {
			this.quillEditor.setContents(data.content, 'initial');
		});

		this.socket.on('deltaSyncEvent', data => {
			if(this.deltaQueue) {
				this.deltaQueue.push(new RemoteDelta(data.delta, data.timestamp));
			} else {
				if(this.lastCursorIndexPosition) {
					this.quillEditor.setSelection(this.lastCursorIndexPosition, 0, 'self');
				}
				this.quillEditor.updateContents(data.delta, 'remote');
			}
		});
	}

}