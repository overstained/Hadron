import { Component, ViewChild, OnInit, EventEmitter, HostListener} from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';
import { BoardService } from '../board/board.service';
import { Uploader } from 'angular2-http-file-upload';
import { ColorPickerService } from 'angular2-color-picker';
import { QuillUpload }  from '../../models/quill-upload';

declare var paper: any;

@Component({
  selector: 'boad-canvas-dialog',
  templateUrl: './board-canvas-dialog.component.html',
  styleUrls: ['./board-canvas-dialog.component.css']
})
export class BoardCanvasDialogComponent implements OnInit {
  @ViewChild('whiteBoard')
  private canvas :any;

  @ViewChild('clipCanvas')
  private clipCanvas :any;


  private ctrlDown :boolean;
  private leftMouseDown :boolean;
  private currentPath : any;
  private clipRectangleStart : any;
  private scope :any;
  private meter :any;
  private blob :any;
  private color: string = "#127bdc";
  private pathStack: Array<any>;
  
  constructor(private boardDialogRef: MdDialogRef<BoardCanvasDialogComponent>,
    private boardService : BoardService,
    private cpService: ColorPickerService) {
    this.ctrlDown = false;
    this.leftMouseDown = false;
    this.pathStack = [];
  }

  closeCanvas() {
    this.boardDialogRef.close(this.blob);
  }

  clearCanvas() {
     this.boardService.clearCanvasPaths();
     for(let path of this.pathStack) {
       path.remove();
     }
     this.pathStack = [];
  }

  undo() {
     this.boardService.popCanvasPath();
     if(this.pathStack.length !== 0) {
       let path = this.pathStack.pop();
       path.remove();
     }
  }

   ngOnInit() {
     var scope = new paper.PaperScope();
     scope.setup(this.canvas.nativeElement);
     this.boardService.setPaper(scope);
     this.scope = scope;
      if(this.boardService.hasBoard()) {
       let paths = this.boardService.getGraphicContent();
       for(let path of paths) {
          let canvasPath = new this.scope.Path({
              segments: path.path,
              strokeColor: path.colorStroke,
              fullySelected: false
          });
          canvasPath.simplify(2);
          this.pathStack.push(canvasPath);
       }
      }
   } 

  @HostListener('document:mouseup', ['$event'])
  onMouseup(event: MouseEvent) {
    if(!this.canvas.nativeElement.contains(event.target)) {
      return;
    }
    if(!this.ctrlDown && !this.meter) {
      if(this.leftMouseDown && this.currentPath) {
        if(this.currentPath.segments.length === 1) {
          this.currentPath.remove();
          this.currentPath = null;
          return;
        }
        this.currentPath.simplify(2);
        this.pathStack.push(this.currentPath);
        let currentSegments = [];
        for(let segment of this.currentPath.segments) {
          currentSegments.push([segment.point.x, segment.point.y]);
        }

        this.boardService.addPath(currentSegments, this.currentPath.strokeColor);
        this.currentPath = null; 
      }   
    } else {
      if(this.meter) {
        let meterSegments =  this.meter.segments;
        let minX = this.canvas.nativeElement.width, maxX = 0, minY = this.canvas.nativeElement.height, maxY = 0;
        for(let segment of meterSegments) {
          if(minX > segment.point.x) {
            minX = segment.point.x;
          }
          if(maxX < segment.point.x) {
            maxX = segment.point.x;
          }
          if(minY > segment.point.y) {
            minY = segment.point.y;
          }
          if(maxY < segment.point.y) {
            maxY = segment.point.y;
          }
        }
        let width = maxX - minX, height = maxY - minY;
        let clipCanvasNative = this.clipCanvas.nativeElement;
        clipCanvasNative.width = width;
        clipCanvasNative.height = height;
        let clipContext = clipCanvasNative.getContext('2d');
        clipContext.drawImage(
            this.canvas.nativeElement, 
            minX+1,
            minY+1,
            width-2,
            height-2,
            0,
            0,
            clipCanvasNative.width,
            clipCanvasNative.height
        );
        var data = clipCanvasNative.toBlob(blob => {
          this.blob = blob;
          this.blob.name = 'temp_name';
          this.blob.lastModifiedDate = new Date();
          this.boardService.uploadBlob(this.blob);
        });
        this.meter.remove();
        this.meter = null;
      }
      this.clipRectangleStart = null;
    }
    this.leftMouseDown = false;
  }

  @HostListener('document:mousemove', ['$event'])
  onMousemove(event: MouseEvent) { 
    if(!this.canvas.nativeElement.contains(event.target)) {
      return;
    }
    let mousePos = this.getMousePos(event);
    if(this.leftMouseDown) {
      if(!this.ctrlDown) {
        if(this.currentPath) {
          this.currentPath.add(mousePos);
        }
      } else {
        if(this.clipRectangleStart) {
          if(this.meter) {
            this.meter.remove();
            this.meter = null;
          }
          let size = new this.scope.Size( mousePos[0] - this.clipRectangleStart.x, mousePos[1] - this.clipRectangleStart.y);
          console.log(size, this.clipRectangleStart);
          this.meter = new this.scope.Path.Rectangle(this.clipRectangleStart, size);
          this.meter.strokeColor = 'black';
          this.scope.view.update();
        }
      }
    }
  }

  @HostListener('document:mousedown', ['$event'])
  onMousedown(event: MouseEvent) {
    if(!this.canvas.nativeElement.contains(event.target)) {
      return;
    }
    this.leftMouseDown = true;
    let mousePos = this.getMousePos(event);
    if(this.ctrlDown) {
      this.clipRectangleStart = new this.scope.Point(mousePos[0], mousePos[1]);
    } else {
      this.currentPath = new this.scope.Path({
          segments: [mousePos],
          strokeColor: this.color,
          fullySelected: false
      });
    }
  }

  @HostListener('document:keydown', ['$event'])
  onCtrldown(event :KeyboardEvent) {
    if(event.key === 'Control') {
      if(!this.leftMouseDown) {
        this.ctrlDown = true;
      }
    }
  }

  @HostListener('document:keyup', ['$event'])
  onCtrlup(event :KeyboardEvent) {
    if(event.key === 'Control') {
      this.ctrlDown = false;
      if(this.leftMouseDown) {
        this.clipRectangleStart = null;
      }
    }
  }

  getMousePos(e) {
      var rect = this.canvas.nativeElement.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top];
  }

}