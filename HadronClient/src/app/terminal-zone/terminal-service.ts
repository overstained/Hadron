

declare var Terminal :any;

export class TerminalService {
	private terminal :any;

	initTerminal(terminalElement) :void {
		this.terminal = new Terminal({
		  dom: terminalElement,
		  speed: 150,
		   cursor: { 
       			width: 10,
	        	color: '#FFFFFF'
	       }
		});
	}

	print(message) {
		console.log(this.terminal.run(function(o) {
			o.output(message).newline();
		}));
	}
}