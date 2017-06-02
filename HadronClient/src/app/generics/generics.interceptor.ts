import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Http, RequestOptions, ConnectionBackend, Request, RequestOptionsArgs, Response, Headers } from '@angular/http';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class HadronHttp extends Http {
  private logout = new Subject<boolean>();

  logout$ = this.logout.asObservable();

  constructor(backend: ConnectionBackend, defaultOptions: RequestOptions) {
      super(backend, defaultOptions);
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
      return this.intercept(super.request(url, options));       
  }

  get(url: string, options?: RequestOptionsArgs): Observable<Response> {
      return this.intercept(super.get(url, this.getRequestOptionArgs(options, true)));
  }

  post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {   
      return this.intercept(super.post(url, body, this.getRequestOptionArgs(options)));
  }

  put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
      return this.intercept(super.put(url, body, this.getRequestOptionArgs(options)));
  }

  delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
      return this.intercept(super.delete(url, options));
  }

  getRequestOptionArgs(options?: RequestOptionsArgs, noBody? :boolean) : RequestOptionsArgs {
      if(!options) {
        options = new RequestOptions({
          headers: new Headers()
        });
      }
      if(!noBody) {
        options.headers.append('Content-Type', 'application/json');
      }
      if(localStorage.getItem('token')) {
        options.headers.append('x-auth-token', localStorage.getItem('token'));
      }
      return options;
  }

  intercept(observable: Observable<Response>): Observable<Response> {
      return observable.map((response :Response) => {
          if(response.headers.get('x-auth-token')) {
            this.setAuthToken(response.headers.get('x-auth-token'));
          }
          return response;
        }).catch((err, source) => {
          if(err.status === 401) {
            if(err.headers.get('x-auth-token')) {
              this.setAuthToken(err.headers.get('x-auth-token'));
            }
          }
          if (err.status  === 403) {
              this.logout.next(true);
              return Observable.empty();
              
          }
          return Observable.throw(err);
      });
  }

  setAuthToken(token : any) {
      localStorage.setItem('token', token);
  }
}