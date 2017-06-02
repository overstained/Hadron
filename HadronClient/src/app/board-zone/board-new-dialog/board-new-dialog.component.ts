import { Component, ViewChild} from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';
import { BoardService } from '../board/board.service';
import { BoardSignature } from '../../models/board-signature';

@Component({
  selector: 'boad-new-dialog',
  templateUrl: './board-new-dialog.component.html'
})
export class BoardNewDialogComponent {
  @ViewChild('boardNameInput')
  private boardNameInput :any;
  
  constructor(private boardDialogRef: MdDialogRef<BoardNewDialogComponent>) {
  }

  createBoard() {
    this.boardDialogRef.close(this.boardNameInput.nativeElement.value);
  }
}