import { Component, NgZone, ViewChild, OnInit } from '@angular/core';
import { TerminalService } from './terminal-service';


@Component({
  selector: 'terminal-zone',
  templateUrl: './terminal-zone.component.html',
  styleUrls: ['./terminal-zone.component.css']
})
export class TerminalZoneComponent implements OnInit {
	@ViewChild('terminal')
	private terminal :any;

	constructor(private terminalService: TerminalService) {
	}

	ngOnInit() {
		this.terminalService.initTerminal(this.terminal.nativeElement);
	}
}