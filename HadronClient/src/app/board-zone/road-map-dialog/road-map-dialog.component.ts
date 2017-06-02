import { Component, ViewChild} from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';
import { BoardService } from '../board/board.service';
import { BoardSignature } from '../../models/board-signature';
import {
    VisNode,
    VisNodes,
    VisEdges,
    VisNetworkService,
    VisNetworkData,
    VisNetworkOptions } from 'ng2-vis';

class ExampleNetworkData implements VisNetworkData {
    public nodes: VisNodes;
    public edges: VisEdges;
}

@Component({
  selector: 'road-map-dialog',
  templateUrl: './road-map-dialog.component.html',
  styleUrls: ['./road-map-dialog.component.css']
})
export class RoadMapDialogComponent {

	private visNetwork: string = 'networkId1';
    private visNetworkData: ExampleNetworkData;
    private visNetworkOptions: VisNetworkOptions;

    private nodeModel: any;

    @ViewChild('sidenav')
    private sidenav :any;

  constructor(private boardDialogRef: MdDialogRef<RoadMapDialogComponent>,
  	private visNetworkService: VisNetworkService) {
  }

  public networkInitialized(): void {
        this.visNetworkService.on(this.visNetwork, 'click');

        this.visNetworkService.click
            .subscribe((eventData: any[]) => {
                if (eventData[0] === this.visNetwork) {
                	if(eventData[1].nodes.length === 0) {
                		this.sidenav.close();
                	} else {
                		if(!this.sidenav.isOpen) {
                    		this.sidenav.open();
                    	}
                	}
                }
            });
    }

   public ngOnInit(): void {
        let nodes = new VisNodes([
            { id: '1', label: 'Node 1' },
            { id: '2', label: 'Node 2' },
            { id: '3', label: 'Node 3' },
            { id: '4', label: 'Node 4' },
            { id: '5', label: 'Node 5', title: 'Title of Node 5' }]);

        let edges = new VisEdges([
            { from: '1', to: '3' },
            { from: '1', to: '2' },
            { from: '2', to: '4' },
            { from: '2', to: '5' }]);

        this.visNetworkData = {
            nodes: nodes,
            edges: edges
        };

        this.visNetworkOptions =  {
		};

    }

    public ngOnDestroy(): void {
        this.visNetworkService.off(this.visNetwork, 'click');
    }


}