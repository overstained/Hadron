import { Component, NgZone, ViewChild, OnInit } from '@angular/core';
import { Board } from '../models/board';
import { RoomUsers } from '../models/room-users';
import { BoardService } from '../board-zone/board/board.service';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication-zone/app-authentication/authentication.service';
import { MdDialog } from '@angular/material';
import { BoardListDialogComponent } from './board-list-dialog/board-list-dialog.component';
import { BoardNewDialogComponent } from './board-new-dialog/board-new-dialog.component';
import { BoardCanvasDialogComponent } from './board-canvas-dialog/board-canvas-dialog.component';
import { TextDocumentNewDialogComponent } from './text-document-new-dialog/text-document-new-dialog.component';
import { BoardConstants } from '../board-zone/board/board.constants';
import { TerminalService } from '../terminal-zone/terminal-service';
import { RoadMapDialogComponent } from './road-map-dialog/road-map-dialog.component';
import { TextDocumentListDialogComponent } from './text-document-list-dialog/text-document-list-dialog.component';
import { BoardShareDialogComponent } from './board-share-dialog/board-share-dialog.component';
import { BoardFileGalleryComponent } from './board-file-gallery/board-file-gallery.component';

import * as Quill from 'quill';

const Parchment = Quill.import('parchment');
let Block = Parchment.query('block');

Block.tagName = 'DIV';
Quill.register(Block, true);

declare var hljs :any;
declare var jsPDF :any;
declare var html2canvas :any;

@Component({
  selector: 'board-zone',
  templateUrl: './board-zone.component.html',
  styleUrls: ['./board-zone.component.css']
})
export class BoardZoneComponent {
   private boardName :string;
   private textDocumentName :string;
   private newBoardName :string;
   private roomUsers :RoomUsers;
   private newTextDocumentName :string;
   private showChangeBoardNameInput :boolean;
   private showChangeTextDocumentNameInput :boolean;
   private boardNameTimeoutId :any;
   private textDocumentNameTimeoutId :any;
   private quillEditor :any;
   private quillModules :any = BoardConstants.QUILL_MODULES;

   @ViewChild("quillElement")
   private quillElement :any;

   constructor(private boardService :BoardService, 
     private authenticationService :AuthenticationService,
     private terminalService: TerminalService,
     private zone: NgZone,
     private dialog: MdDialog,
     private router: Router,) {

     hljs.configure({
      languages: ['javascript', 'ruby', 'python', 'java']
     });

     boardService.logout$.subscribe(logout => {
       if(logout) {
         this.clearAndLogout();
       }
       this.terminalService.print('Successfully logged out!');
     });
     boardService.updateRoomUsers$.subscribe(roomUsers => {
       this.zone.run(() => {
         this.roomUsers = roomUsers;
         let message = 'Room users updated: ';
         for(let user of roomUsers.getUsers()) {
           message += user.email;
         }
         this.terminalService.print(message);
       });
     });
     if(!authenticationService.isAuthenticated()) {
       this.router.navigateByUrl('/login');
       this.terminalService.print('Logged in!');
     }

     if(!boardService.hasBoard()) {
       boardService.getLastModifiedBoard().subscribe(data => {
         this.zone.run(() => {
           this.boardName = boardService.getCurrentBoardName();
           this.textDocumentName = boardService.getCurrentTextDocumentName();
           this.terminalService.print('Loaded last modified board: ' + this.boardName);
         });
       }, error => {});
     } else {
       this.boardName = boardService.getCurrentBoardName();
       this.textDocumentName = boardService.getCurrentTextDocumentName();
     }
     this.roomUsers = new RoomUsers();
     this.showChangeBoardNameInput = false;
     this.showChangeTextDocumentNameInput = false;
   }

   adaptElement(element :any) {
     var pdf = new jsPDF('p','pt','a4');
     let canvas = document.createElement("canvas");
     let images = element.getElementsByTagName("IMG");
     let count = images.length;
     for(let image of images) {
      let newImage = new Image();
      canvas.width = image.width;
      canvas.height = image.height;
      let ctx = canvas.getContext("2d");
      newImage.setAttribute('crossOrigin', 'Anonymous');
      newImage.setAttribute('src', image.src);
      newImage.onload = () => {
        ctx.drawImage(newImage, 0, 0);
        let dataURL = canvas.toDataURL("image/png");
        image.setAttribute('src', dataURL);
        image.onload = () => {
          --count;
          if(count === 0) {
            html2canvas(element, {
              onrendered: function(canvas) {
                pdf.addImage(canvas.toDataURL("image/png"),"png",0,0);
                pdf.output('save', 'test.pdf');
              },
              allowTaint: true,
              logging: true
            });
          }
        }
      };

      newImage.onerror = (error) => {
      };
     }
   }

  htmlToCanvas() {
    let clone = document.querySelector('.ql-editor').cloneNode(true);
    this.adaptElement(clone);
  }
   
  whiteBoardOpen() {
    this.boardService.unfocusQuillEditor();
     this.dialog.closeAll();
     this.dialog
     .open(BoardCanvasDialogComponent, {width: '100vw', height: '100vh', position: 'right', disableClose: true});
  }

  insertLastUploadedFile() {
    this.boardService.insertLastUploadedFile();
  }

  openFileGallery() {
    this.boardService.unfocusQuillEditor();
     this.dialog.closeAll();
     this.dialog
     .open(BoardFileGalleryComponent, {width: '100vw', height: '100vh'});
  }

   setQuillEditor(event) {
     this.boardService.setQuillEditor(event);
   }

   shareBoard() {
     if(this.boardService.isOwner()) {
       this.boardService.unfocusQuillEditor();
       this.dialog.closeAll();
       this.boardService
       .getMembers()
       .subscribe(data => {
          this.dialog
         .open(BoardShareDialogComponent, {width: "55vw", data: data.userIds})
         .afterClosed().subscribe(result => {
                if(result && result.length !== 0) {
                  if(data.userIds.indexOf(result) < 0 && data.userIds.indexOf(this.boardService.getOwnerEmail()) < 0) {
                    this.boardService
                    .shareBoard(result)
                    .subscribe(data =>{},error=>{});
                  }
                }
         });
       }, error => {});
       
     }
   }

   changeBoard() {
     this.boardService.unfocusQuillEditor();
     this.dialog.closeAll();
     this.dialog
     .open(BoardListDialogComponent, {width: "55vw"})
     .afterClosed().subscribe(result => {
          if(result && result.name !== this.boardName) {
            this.boardService
            .getBoard(result.ownerEmail, result.name)
            .subscribe(data => {
              this.zone.run(() => {
               this.boardName = this.boardService.getCurrentBoardName();
               this.textDocumentName = this.boardService.getCurrentTextDocumentName();
              });
            }, error => {});
          }
     });
   }

   showRoadMap() {
     this.boardService.unfocusQuillEditor();
     this.dialog.closeAll();
     this.dialog
     .open(RoadMapDialogComponent, {width: "65vw"})
     .afterClosed().subscribe(result => {
     });
   }

   newBoard() {
     this.boardService.unfocusQuillEditor();
     this.dialog.closeAll();
     this.dialog
     .open(BoardNewDialogComponent)
     .afterClosed().subscribe(result => {
       if(result) {
         this.boardService
         .createBoard(result)
         .subscribe(data => {
           this.zone.run(() => {
             this.boardName = this.boardService.getCurrentBoardName();
             this.textDocumentName = this.boardService.getCurrentTextDocumentName();
           });
         }, error => {});
       }
     });
   }

   newTextDocument() {
     this.boardService.unfocusQuillEditor();
     this.dialog.closeAll();
     this.dialog
     .open(TextDocumentNewDialogComponent)
     .afterClosed().subscribe(result => {
       if(result) {
         this.boardService
         .createTextDocument(result)
         .subscribe(data => {
           this.zone.run(() => {
             this.textDocumentName = this.boardService.getCurrentTextDocumentName();
           });
         }, error => {});
       }
     });
   }

   changeTextDocument() {
     this.boardService.unfocusQuillEditor();
     this.dialog.closeAll();
     this.dialog
     .open(TextDocumentListDialogComponent, {width: "55vw"})
     .afterClosed().subscribe(result => {
          if(result && result.name !== this.boardName) {
            this.boardService
            .getTextDocument(result.ownerEmail, result.name)
            .subscribe(data => {
              this.zone.run(() => {
               this.textDocumentName = this.boardService.getCurrentTextDocumentName();
              });
            }, error => {});
          }
     });
   }

   showChangeBoardName() {
     if(!this.boardService.isOwner() || this.boardService.isShared()) {
       return;
     }
     this.zone.run(() => {
       this.newBoardName = this.boardName;
       this.showChangeBoardNameInput = true;
       this.boardNameTimeoutId = setTimeout(() => { this.showChangeBoardNameInput = false}, 2000);
     });
   }

   showChangeTextDocumentName() {
     this.zone.run(() => {
       this.newTextDocumentName = this.textDocumentName;
       this.showChangeTextDocumentNameInput = true;
       this.textDocumentNameTimeoutId = setTimeout(() => { this.showChangeTextDocumentNameInput = false}, 2000);
     });
   }

   focusedBoardNameInput() {
     clearTimeout(this.boardNameTimeoutId);
   }

   focusedTextDocumentNameInput() {
     clearTimeout(this.textDocumentNameTimeoutId);
   }

   changeBoardName() {
     if(this.newBoardName !== this.boardName &&
        !this.boardService.isShared()) {
       this.boardService
       .changeBoardName(this.newBoardName)
       .subscribe(data => {
           this.boardName = this.newBoardName;
       }, error => {});
     }
     this.showChangeBoardNameInput = false;
   }

   changeTextDocumentName() {
     if(this.newTextDocumentName !== this.textDocumentName) {
       this.boardService
       .changeTextDocumentName(this.newTextDocumentName)
       .subscribe(data => {
           this.textDocumentName = this.newTextDocumentName;
       }, error => {});
     }
     this.showChangeTextDocumentNameInput = false;
   }

   hideBoardNameInput() {
     this.showChangeBoardNameInput = false;
   }

   hideTextDocumentNameInput() {
     this.showChangeTextDocumentNameInput = false;
   }

   clearAndLogout() {
     this.dialog.closeAll();
     this.boardService.clearAndLogout();
     this.router.navigateByUrl('/login');
   }

}