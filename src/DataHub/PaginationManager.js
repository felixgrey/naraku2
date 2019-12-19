
export default class PaginationManager {
	constructor() {
	  this.count = 0;
		this.startPage = 1;
		this.currentPage = 1;
	}
	
	setDataCount(count) {
		this.count = count;
	}
	
	getPaginationInfo() {
		return {
			count: this.count,
			startPage: this.startPage,
			currentPage:this.currentPage
		};
	}
}