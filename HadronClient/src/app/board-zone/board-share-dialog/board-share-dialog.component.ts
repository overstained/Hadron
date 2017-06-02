import { Component, ViewChild} from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';

@Component({
  selector: 'boad-share-dialog',
  templateUrl: './board-share-dialog.component.html'
})
export class BoardShareDialogComponent {
  @ViewChild('emailInput')
  private emailInput :any;
  private memberList :Array<string>;
  
  constructor(private boardDialogRef: MdDialogRef<BoardShareDialogComponent>) {
  	this.memberList = boardDialogRef.config.data;
  }

  shareBoard() {
    this.boardDialogRef.close(this.emailInput.nativeElement.value);
  }
}