import { Component, ViewChild} from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';
import { BoardService } from '../board/board.service';
import { BoardSignature } from '../../models/board-signature';

@Component({
  selector: 'text-document-new-dialog',
  templateUrl: './text-document-new-dialog.component.html'
})
export class TextDocumentNewDialogComponent {
  @ViewChild('textDocumentNameInput')
  private boardNameInput :any;
  
  constructor(private boardDialogRef: MdDialogRef<TextDocumentNewDialogComponent>) {
  }

  createTextDocument() {
    this.boardDialogRef.close(this.boardNameInput.nativeElement.value);
  }
}