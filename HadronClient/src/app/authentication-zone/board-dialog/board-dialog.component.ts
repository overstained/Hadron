import { Component, ViewChild} from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';

@Component({
  selector: 'boad-dialog',
  templateUrl: './board-dialog.component.html'
})
export class BoardDialogComponent {
  @ViewChild('boardNameInput')
  private boardNameInput :any;

  constructor(private boardDialogRef: MdDialogRef<BoardDialogComponent>) {
  }

  nameBoard() {
  	   this.boardDialogRef.close(this.boardNameInput.nativeElement.value);
  }
}