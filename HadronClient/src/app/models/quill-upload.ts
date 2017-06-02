import { UploadItem } from 'angular2-http-file-upload';
import { GenericConstants } from '../generics/generics.constants';
import { BoardConstants } from '../board-zone/board/board.constants';
 
export class QuillUpload extends UploadItem {
    constructor(file: any) {
        super();
        this.url = `${GenericConstants.BASE_URL}${BoardConstants.UPLOAD_URL}`;
        this.file = file;
    }
}