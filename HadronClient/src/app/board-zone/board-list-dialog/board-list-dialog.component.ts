import { Component, ElementRef} from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';
import { BoardService } from '../board/board.service';
import { BoardSignature } from '../../models/board-signature';

@Component({
  selector: 'boad-list-dialog',
  templateUrl: './board-list-dialog.component.html',
  styleUrls: ['./board-list-dialog.component.css']
})
export class BoardListDialogComponent {
  private boardList :Array<BoardSignature>;
  private selectedBoard :BoardSignature;

  constructor(private boardDialogRef: MdDialogRef<BoardListDialogComponent>,
  			 private boardService: BoardService,
  			 private elementRef : ElementRef
  			 ) {
  	boardService.getBoardList().subscribe(data => {
  		this.boardList = data;
  	}, error => {
  	});
  }



  markOrChangeBoard(event, index, board) {
  	let element = this.elementRef.nativeElement.querySelector('#board_element_' + index);
  	if(element.className.indexOf('list-group-item-success') >= 0) {
  		this.boardDialogRef.close(this.selectedBoard);
  	} else {
  		this.removeMarkClass();
  		this.selectedBoard = board;
  		element.className += " list-group-item-success";
  	}
  }

  removeMarkClass() {
  	let elements = this.elementRef.nativeElement.querySelectorAll("a[id^=board_element]");
  	for(let element of elements) {
  		element.className = "list-group-item";
  	}
  }

}