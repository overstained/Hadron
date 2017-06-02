import { Injectable } from '@angular/core';
import { AuthenticationConstants } from './authentication.constants';
import { GenericConstants } from '../../generics/generics.constants';
import { Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { HadronHttp } from '../../generics/generics.interceptor';
import { Board } from '../../models/board';
import { Tools } from '../../generics/generics.tools';
import { User } from '../../models/user';
import { JwtHelper } from 'angular2-jwt';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map'; 

@Injectable()
export class AuthenticationService {
    private jwtHelper :JwtHelper;
    private user :User;
	constructor(private hadronHttp: HadronHttp) {
        this.jwtHelper = new JwtHelper;
        if(this.isAuthenticated()) {
            this.setClaims(localStorage.getItem('token'));
        }
	}

	authenticate(email) :Observable<any> {
		let authHeader = new Headers();
		    authHeader.append('Authorization', btoa(email));
		return this.hadronHttp
        .get(`${GenericConstants.BASE_URL}${AuthenticationConstants.LOGIN_URL}`, {
        	headers: authHeader
        })
        .map((response :Response) => {
            let toReturn :any = [response.headers.get('x-auth-token') != null];
        	let board :Board = Tools.mapToBoard(response.json());
            this.setClaims(response.headers.get('x-auth-token'));
            toReturn.push(board);
			return toReturn;
        })
        .catch((error :Response | any) => {
        	error.authentication = [error.headers.get('x-auth-token') != null];
			return Observable.throw(error);
        });
	}

    isAuthenticated() :boolean{
        return localStorage.getItem('token') != null;
    }

    logout() :void{
        localStorage.removeItem('token');
    }

    setClaims(token) :void {
       let decoded = this.jwtHelper.decodeToken(token);
       this.user = new User(decoded.email, decoded.assignedUserColor);
    }

    getClaims() :User {
        return this.user;
    }
}