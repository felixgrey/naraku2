import {
	createUid,
	isNvl,
	uniStringify,
} from './../Utils';

import {
	NOT_INITfetcher,
	NOT_ADD_FETCH,
	ABORT_REQUEST,
	FETCHING,
	stopFetchData,
	fetchData,
} from './Fetcher';

import Component from './Component';

let defaultPageInfo = {
	force: false,
	page: 1,
	size: 10,
	start: 1,
};

const {
	publicMethod
} = Component;

export function setDefaultPageInfo(v) {
	Object.assign(defaultPageInfo, v);
}

export default class PaginationManager extends Component {

	initialization(...args){
		super.initialization(...args);
		
		const [dataStore] = args;
		
		this.name = dataStore.name;
		this.fetcher = null;
		this.stringData = '';
		this.force = defaultPageInfo.force;
		this.pageSize = defaultPageInfo.size;
		this.pageNumber = defaultPageInfo.page;
		this.startPage = defaultPageInfo.start;
		this.stopKey = null;
		this.noPage = false;
		this.count = 0;
	}


	@publicMethod
	init(param) {
		if (isNvl(param) || param === false) {
			this.inited = true;
			this.noPage = true;
			return;
		}

		if (param === true) {
			param = {};
		}

		const {
			fetcher = null,
				force = defaultPageInfo.force,
				startPage = defaultPageInfo.start,
				pageSize = defaultPageInfo.size
		} = param;

		this.inited = true;

		this.fetcher = fetcher;
		this.force = force;
		this.startPage = startPage;
		this.pageSize = pageSize;
	}

	@publicMethod
	setCount(v) {
		this.count = v;
	}

	@publicMethod
	getCount() {
		return this.count;
	}

	@publicMethod
	stopFetch() {
		if (this.stopKey) {
			stopFetchData(this.stopKey);
			this.stopKey = null;
		}
	}

	@publicMethod
	fetch(data = {}) {
		if (this.fetcher === null) {
			this.emitter.emit('$$data', {
				name: `$$count:${this.name}`,
				value: this.count
			});
			return Promise.resolve();
		}

		if (isNvl(data)) {
			data = {};
		}

		this.stopFetch();

		let stringData = uniStringify(data);

		if (!isNvl(stringData) && stringData === this.stringData) {
			this.devLog(`same data`, stringData);
			if (!this.force) {
				return;
			}
			this.devLog(`same data but force fetch`);
		}

		this.stringData = stringData;
		this.setPageInfo(1);

		const stopKey = this.stopKey = createUid('pageStopKey-');

		// name, data = null, dataInfo = {}, stopKey = null
		return fetchData(this.fetcher, data, {
			name: this.name,
			pagination: true,
		}, stopKey).then(result => {
			if (this.destroyed) {
				return;
			}

			this.devLog('result is ', result);

			if (isNaN(+result)) {
				this.errLog('data count must be Number, but it is: ', result);
				result = 0;
			}

			this.count = +result;

			this.devLog(`'${this.name}' count is ${this.count}`);

			this.emitter.emit('$$data', {
				name: `$$count:${this.name}`,
				value: result
			});
		}).catch((err) => {
			if (err === NOT_INITfetcher) {
				this.devLog && this.devLog('must init fetcher first');
				return;
			}

			if (err === NOT_ADD_FETCH) {
				this.devLog && this.devLog(`must add fetcher '${this.fetcher}' first`);
				return;
			}

			if (err === ABORT_REQUEST) {
				return;
			}

			return Promise.reject(err);
		});
	}

	@publicMethod
	setPageInfo(pageNumber, pageSize) {
		let changed = false;

		if (!isNvl(pageNumber) && pageNumber !== this.pageNumber) {
			this.pageNumber = pageNumber;
			changed = true;
		}

		if (!isNvl(pageSize) && pageSize !== this.pageSize) {
			this.pageSize = pageSize;
			changed = true;
		}

		if (changed) {
			this.emitter.emit('$$data', {
				name: `$$page:${this.name}`
			});
		}

	}

	@publicMethod
	getPageInfo() {
		if (this.noPage) {
			return {
				hasPagiNation: false
			};
		}

		return {
			hasPagiNation: true,
			count: this.count,
			page: this.pageNumber,
			size: this.pageSize,
			start: this.startPage,
		};
	}
}
