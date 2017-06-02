import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, Http, XHRBackend, RequestOptions, ConnectionBackend, Request, RequestOptionsArgs, Response } from '@angular/http';
import { BoardDialogComponent } from './authentication-zone/board-dialog/board-dialog.component';
import { AuthenticationZoneComponent } from './authentication-zone/authentication-zone.component';
import { BoardZoneComponent } from './board-zone/board-zone.component';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { FacebookComponent } from './authentication-zone/facebook-login/facebook.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HadronHttp } from './generics/generics.interceptor';
import { BoardService } from './board-zone/board/board.service';
import { BoardNewDialogComponent } from './board-zone/board-new-dialog/board-new-dialog.component';
import { BoardCanvasDialogComponent } from './board-zone/board-canvas-dialog/board-canvas-dialog.component';
import { BoardShareDialogComponent } from './board-zone/board-share-dialog/board-share-dialog.component';
import { BoardListDialogComponent } from './board-zone/board-list-dialog/board-list-dialog.component';
import { TerminalZoneComponent } from './terminal-zone/terminal-zone.component';
import { TerminalService } from './terminal-zone/terminal-service';
import { BoardFileGalleryComponent } from './board-zone/board-file-gallery/board-file-gallery.component';
import { TextDocumentNewDialogComponent } from './board-zone/text-document-new-dialog/text-document-new-dialog.component';
import { AuthenticationService } from './authentication-zone/app-authentication/authentication.service';
import { MaterialModule } from '@angular/material';
import { Uploader } from 'angular2-http-file-upload';
import { ColorPickerModule } from 'angular2-color-picker';
import { ColorPickerService } from 'angular2-color-picker';
import { RoadMapDialogComponent } from './board-zone/road-map-dialog/road-map-dialog.component';
import { TextDocumentListDialogComponent } from './board-zone/text-document-list-dialog/text-document-list-dialog.component';
import { QuillModule } from 'ngx-quill';
import { VisModule } from 'ng2-vis';

export function hadronHttpFactory(backend: XHRBackend, defaultOptions: RequestOptions) { return new HadronHttp(backend, defaultOptions); }

const appRoutes: Routes = [
  {
    path: 'login',
    component: AuthenticationZoneComponent
  },
  {
    path: 'board',
    component: BoardZoneComponent
  },
  { 
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [
    BoardDialogComponent,
    BoardShareDialogComponent,
    BoardNewDialogComponent,
    RoadMapDialogComponent,
    BoardCanvasDialogComponent,
    BoardListDialogComponent,
    BoardFileGalleryComponent,
    TextDocumentNewDialogComponent,
    TextDocumentListDialogComponent,
    TerminalZoneComponent,
    AuthenticationZoneComponent,
    BoardZoneComponent,
    AppComponent,
    FacebookComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    VisModule,
    QuillModule,
    ColorPickerModule,
    NgbModule.forRoot(),
    MaterialModule.forRoot(),
    RouterModule.forRoot(appRoutes)
  ],
  entryComponents: [
    BoardDialogComponent,
    BoardShareDialogComponent,
    BoardNewDialogComponent,
    RoadMapDialogComponent,
    BoardCanvasDialogComponent,
    BoardFileGalleryComponent,
    BoardListDialogComponent,
    TextDocumentNewDialogComponent,
    TextDocumentListDialogComponent
  ],
  providers: [{
      provide: HadronHttp,
      useFactory: hadronHttpFactory,
      deps: [XHRBackend, RequestOptions]
  },
  Uploader,
  BoardService,
  ColorPickerService,
  TerminalService,
  AuthenticationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
