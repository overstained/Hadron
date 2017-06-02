import { Comparable } from './comparable';

export class PriorityQueue <T extends Comparable<T>>{
	private queue :Array<T>;

	constructor() {
		this.queue = [];
	}

	public push(object :T) {
		this.queue.push(object);
		this.sortArray(this.queue);
	}

	public pop() :T {
		return this.queue.pop();
	}

	public peek() :T {
		return this.queue[this.queue.length - 1];
	}

	public isEmpty() :boolean {
		return this.queue.length === 0;
	}

	public mergeWithQueueAsArray(priorityQueue :PriorityQueue<T>) :Array<T>{
		return this.mergeWithArrayAsArray(priorityQueue.asArray());
	}

	public mergeWithArrayAsArray(array :Array<T>) :Array<T>{
		let mergedArray = this.queue.concat(array);
		this.sortArray(mergedArray);
		return mergedArray;
	}

	public asArray() :Array<T> {
		return this.queue;
	}

	private sortArray(array: Array<T>) :void{
		array.sort(function(firstObject :T, secondObject :T) {
			return firstObject.compareTo(secondObject);
		});
	}
}