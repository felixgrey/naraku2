import {
	createUid,
	getUniIndex,
	udFun,
	isNvl,
	getDeepValue,
	createDestroyedErrorLog,
} from './../Utils';

import {
	NOT_INIT_FETCHER,
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

	afterCreate(store) {
		this._name = store._name;
		this._fetcher = null;
		this._stringData = '';
		this._force = defaultPageInfo.force;
		this._pageSize = defaultPageInfo.size;
		this._pageNumber = defaultPageInfo.page;
		this._startPage = defaultPageInfo.start;
		this._stopKey = null;
		this._noPage = false;
		this._count = 0;
	}

	beforeDestroy() {}

	@publicMethod
	init(param) {
		if (isNvl(param) || param === false) {
			this._inited = true;
			this._noPage = true;
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

		this._inited = true;

		this._fetcher = fetcher;
		this._force = force;
		this._startPage = startPage;
		this._pageSize = pageSize;
	}

	@publicMethod
	setCount(v) {
		this._count = v;
	}

	@publicMethod
	getCount() {
		return this._count;
	}

	@publicMethod
	stopFetch() {
		if (this._stopKey) {
			stopFetchData(this._stopKey);
			this._stopKey = null;
		}
	}

	@publicMethod
	fetch(data = {}) {
		if (this._fetcher === null) {
			this._emitter.emit('$$data', {
				name: `$$count:${this._name}`,
				value: this._count
			});
			return Promise.resolve();
		}

		if (isNvl(data)) {
			data = {};
		}

		this.stopFetch();

		let stringData = null;
		if (typeof data.$uniStringify === 'function') {
			stringData = data.$uniStringify();
		} else {
			try {
				stringData = JSON.stringify(data);
			} catch (e) {
				this.devLog('stringData Error:', e);
			}
		}

		if (!isNvl(stringData) && stringData === this._stringData) {
			this.devLog(`same data`, stringData);
			if (!this._force) {
				return;
			}
			this.devLog(`same data but force fetch`);
		}

		this._stringData = stringData;
		this.setPageInfo(1);

		const stopKey = this._stopKey = createUid('pageStopKey-');

		// name, data = null, dataInfo = {}, stopKey = null
		return fetchData(this._fetcher, data, {
			name: this._name,
			pagination: true,
		}, stopKey).then(result => {
			if (this._destroyed) {
				return;
			}

			this.devLog('result is ', result);

			if (isNaN(+result)) {
				this.errLog('data count must be Number, but it is: ', result);
				result = 0;
			}

			this._count = +result;

			this.devLog(`'${this._name}' count is ${this._count}`);

			this._emitter.emit('$$data', {
				name: `$$count:${this._name}`,
				value: result
			});
		}).catch((err) => {
			if (err === NOT_INIT_FETCHER) {
				this.devLog && this.devLog('must init fetcher first');
				return;
			}

			if (err === NOT_ADD_FETCH) {
				this.devLog && this.devLog(`must add fetcher '${this._fetcher}' first`);
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

		if (!isNvl(pageNumber) && pageNumber !== this._pageNumber) {
			this._pageNumber = pageNumber;
			changed = true;
		}

		if (!isNvl(pageSize) && pageSize !== this._pageSize) {
			this._pageSize = pageSize;
			changed = true;
		}

		if (changed) {
			this._emitter.emit('$$data', {
				name: `$$page:${this._name}`
			});
		}

	}

	@publicMethod
	getPageInfo() {
		if (this._noPage) {
			return {
				hasPagiNation: false
			};
		}

		return {
			hasPagiNation: true,
			count: this._count,
			page: this._pageNumber,
			size: this._pageSize,
			start: this._startPage,
		};
	}
}
