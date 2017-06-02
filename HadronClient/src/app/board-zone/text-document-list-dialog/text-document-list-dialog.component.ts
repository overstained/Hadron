import { Component, ElementRef} from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';
import { BoardService } from '../board/board.service';
import { BoardSignature } from '../../models/board-signature';

@Component({
  selector: 'text-document-list-dialog',
  templateUrl: './text-document-list-dialog.component.html',
  styleUrls: ['./text-document-list-dialog.component.css']
})
export class TextDocumentListDialogComponent {
  private textDocumentList :Array<BoardSignature>;
  private selectedTextDocument :BoardSignature;

  constructor(private boardDialogRef: MdDialogRef<TextDocumentListDialogComponent>,
  			 private boardService: BoardService,
  			 private elementRef : ElementRef
  			 ) {
  	boardService.getTextDocumentList().subscribe(data => {
  		this.textDocumentList = data;
  	}, error => {
  	});
  }



  markOrChangeTextDocument(event, index, textDocument) {
  	let element = this.elementRef.nativeElement.querySelector('#text_document_element_' + index);
  	if(element.className.indexOf('list-group-item-success') >= 0) {
  		this.boardDialogRef.close(this.selectedTextDocument);
  	} else {
  		this.removeMarkClass();
  		this.selectedTextDocument = textDocument;
  		element.className += " list-group-item-success";
  	}
  }

  removeMarkClass() {
  	let elements = this.elementRef.nativeElement.querySelectorAll("a[id^=text_document_element]");
  	for(let element of elements) {
  		element.className = "list-group-item";
  	}
  }

}