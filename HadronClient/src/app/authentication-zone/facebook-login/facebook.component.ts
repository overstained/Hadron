import { Component, EventEmitter, Output } from '@angular/core';
import { FacebookService } from './facebook.service';
import { AuthenticationService} from '../app-authentication/authentication.service';
import { Board } from '../../models/board';

@Component({
  selector: 'facebook-login',
  templateUrl: './facebook.component.html',
  styleUrls: ['./facebook.component.css'],
  providers: [ FacebookService ]
})
export class FacebookComponent {
	@Output() 
	private onAuthentication = new EventEmitter<[boolean, Board]>();
	
	constructor(private facebookService :FacebookService) {
		facebookService.authentication$.subscribe(authentication => {
			this.onAuthentication.emit(authentication);
	    });
	}

	onFacebookLoginClick() {
		this.facebookService
		.login();
    };
}
