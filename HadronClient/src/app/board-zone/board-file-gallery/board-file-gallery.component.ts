import { Component, ViewChild, NgZone} from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';
import { BoardService } from '../board/board.service';
import { CanvasFile } from '../../models/canvas-file';

@Component({
  selector: 'boad-file-gallery',
  templateUrl: './board-file-gallery.component.html'
})
export class BoardFileGalleryComponent {

  private files :Array<CanvasFile>;
  
  constructor(private boardDialogRef: MdDialogRef<BoardFileGalleryComponent>,
    private boardService :BoardService,
    private zone: NgZone) {
    this.boardService
    .getFilesForUser()
    .subscribe(data => {
      this.zone.run(() => {
       this.files = data;
     });
    }, error => {});
  }

  closeAndInsertIntoEditor(url) {
    this.boardDialogRef.close();
    this.boardService.insertFromGallery(url);
  }
}