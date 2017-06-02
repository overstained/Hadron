import { OnInit } from '@angular/core';
import { Injectable } from "@angular/core";
import { FacebookConstants } from './facebook.constants';
import { GenericConstants } from '../../generics/generics.constants';
import { AuthenticationService } from '../app-authentication/authentication.service';
import { Subject } from 'rxjs/Subject';
import { Board } from '../../models/board';

declare const FB:any;

@Injectable()
export class FacebookService implements OnInit {
    private authentication = new Subject<[boolean, Board]>();

    authentication$ = this.authentication.asObservable();

	constructor(private authenticationService :AuthenticationService) {
		FB.init(FacebookConstants.FACEBOOK_CONFIGURATION);
	}

	login() {
        FB.login(result => { 
            FB.api(FacebookConstants.FACEBOOK_API_URL, userInfo => { 
                if(!userInfo || !userInfo.email) {
                    return;
                }
                 return this.authenticationService
                .authenticate(userInfo.email)
                .subscribe(data => {
                        this.authentication.next(data);
                   },
                   error => {
                      if(error.status === 401) {
                        this.authentication.next(error.authentication);
                      }
                }); 
            }); 
        }, FacebookConstants.FACEBOOK_SCOPE);
    }

    statusChangeCallback(response) {
    }

    ngOnInit() {
        FB.getLoginStatus(response => {
            this.statusChangeCallback(response);
        });
    }
}