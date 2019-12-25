import {
	getUniIndex,
	createUid,
	udFun,
	isNvl,
	createDstroyedErrorLog
} from './../Utils';

import {
	NOt_INIT_FETCHER,
	NOt_ADD_FETCH,
	FETCHING,
	stopFetchData,
	fetchData,
	getFetcher,
} from './Fetcher';

const defaultPagination = {
	fetcher: null,
	size: 10,
	start: 1,
}

export {
	defaultPagination
}


export default class PaginationManager {

	constructor(pageChange, dh, pgCfg) {
		this._key = getUniIndex();
		this._destroyed = false;
		this.dstroyedErrorLog = createDstroyedErrorLog('PaginationManager', this._key);

		this._pageChange = pageChange;
		this._jsonData = '';

		this._pgCfg = Object.assign({}, defaultPagination, pgCfg);
		this._currentPage = this._pgCfg.start;
		this._count = 0;
		this._dhName = this._pgCfg.dhName;

		this._dh = dh;
		this._emitter = dh._emitter;
		this._controller = dh._controller;
		
		const fetcher = this._pgCfg.fetcher;

		if (!isNvl(fetcher)) {
			if (typeof fetcher === 'string') {
				this._fetcher = getFetcher(fetcher);
			} else {
				this._fetcher = fetcher;
			}
		}

		this.devLog = udFun;
		this.errLog = udFun;
	}

	setLogger(devLog = udFun, errLog = udFun) {
		this.devLog = devLog;
		this.errLog = errLog;
	}

	stopFetch() {
		if (this._destroyed) {
			this.dstroyedErrorLog('stopFetch');
			return;
		}
		
		if (this.pageStopKey) {
			stopFetchData(this.pageStopKey);
			this.pageStopKey = null;
		}
	}

	fetch(data) {
		if (this._destroyed) {
			this.dstroyedErrorLog('fetch');
			return;
		}
		
		// this.devLog(data)

		const jsonData = JSON.stringify(data);

		if (!this._fetcher || this._jsonData === jsonData) {
			return Promise.resolve();
		}

		this._jsonData = jsonData;
		this.pageStopKey = createUid('pageStopKey_');
		this._count = 0;

		return fetchData(this._fetcher, data, {}, this, this.pageStopKey);
	}

	changePageInfo(page, pageSize) {
		if (this._destroyed) {
			this.dstroyedErrorLog('changePageInfo');
			return;
		}

		if(this._dh.getStatus(this._dhName) === 'loading') {
			this.errLog(`can't changePageInfo when ${this._dhName} is loading.`);
			return;
		}
		
		let changed = false;
		if (!isNvl(page) && this._currentPage !== page) {
			this._currentPage = page;
			changed = true;
		}
		
		if (!isNvl(pageSize) && this._pageSize !== pageSize) {
			this._pageSize = pageSize;
			changed = true;
		}
		
		if (changed) {
			this._emitter.emit(this._pageChange);
		}
	}

	setDataCount(count) {
		if (this._destroyed) {
			this.dstroyedErrorLog('setDataCount');
			return;
		}

		this._count = count;
		this._emitter.emit('$$data', {
			name: '$$count',
			value: count
		});
	}

	getPaginationInfo(url) {
		if (this._destroyed) {
			this.dstroyedErrorLog('getPaginationInfo');
			return {};
		}

		return {
			isPagination: this._fetcher && url && this._fetcher.url === url,
			size: this._pgCfg.size,
			start: this._pgCfg.start,
			count: this._count,
			page: this._currentPage,
		};
	}

	destroy() {
		if (this._destroyed) {
			return;
		}

		this.pageStopKey && stopFetchData(this.pageStopKey);
		this._emitter.emit('$$destroy:PaginationManager', this._key);

		this._destroyed = true;
		this._controller = null;
		this._emitter = null;
	}
}
