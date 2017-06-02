import { Cluster } from './cluster';

export class RoadMap {
	private _nodes :Array<Node>;
	private _edges :Array<[number, number]>;
	private _clusters :Array<Cluster>;

	RoadMap(nodes :Array<Node>, edges: Array<[number, number]>) {
		this._nodes = nodes;
		this._edges = edges;
	}

	get nodes() :Array<Node> {
		return this._nodes;
	}

	set nodes(nodes :Array<Node>) {
		this._nodes = nodes;
	}

	get edges() :Array<[number, number]> {
		return this._edges;
	}

	set edges(edges :Array<[number, number]>) {
		this._edges = edges;
	}
	
}