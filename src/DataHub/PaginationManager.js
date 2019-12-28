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
	FETCHING,
	stopFetchData,
	fetchData,
} from './Fetcher';

export default class PaginationManager {
	constructor(dh, name, _devMode = false) {
		this._key = getUniIndex();
		this._destroyed = false;
		this._inited = false;

		this._name = name;
		this._fetcher = null;
		this._jsonData = '';
		this._force = false;
		this._pageSize = 10;
		this._pageNumber = 1;
		this._startPage = 1;
		this._stopKey = null;
		this._count = 0;

		this._dh = dh;
		this._emitter = dh._emitter;

		this._emitter.once(`$$destroy:DataHub:${dh._key}`, () => {
			this.destroy();
		});

		this.devLog = _devMode ? dh.devLog.createLog(`PaginationManager=${this._key}`) : udFun;
		this.errLog = dh.errLog.createLog(`PaginationManager=${this._key}`);

		this.devLog(`PaginationManager=${this._key} created.`);
	}

	_hasErr(name) {
		if (this._destroyed || !this._inited || !this._fetcher) {
			this.devLog(`run '${name}' failed : `, this._destroyed, this._inited, this._fetcher);
			return true;
		}

		return false;
	}

	init(param = {}) {
		if (this._hasErr('init')) {
			return;
		}

		const {
			fetcher = null,
			force = false,
			startPage = 1,
			pageSize = 10
		} = param;

		this._inited = true;

		this._fetcher = fetcher;
		this._force = force;
		this._startPage = startPage;
		this._pageSize = pageSize;
	}

	setCount(v) {
		if (this._hasErr('setCount')) {
			return;
		}

		this._count = v;
	}

	getCount() {
		if (this._hasErr('getCount')) {
			return;
		}

		return this._count;
	}

	stopFetch() {
		if (this._hasErr('stopFetch')) {
			return;
		}

		if (this._stopKey) {
			stopFetchData(this._stopKey);
			this._stopKey = null;
		}
	}

	fetch(data = {}) {
		if (this._hasErr('fetch')) {
			return;
		}

		this.stopFetch();

		try {
			const jsonData = JSON.stringify(data);
			if (jsonData === this._jsonData) {
				this.devLog(`same data`, jsonData);
				if (!this._force) {
					return;
				}
				this.devLog(`same data but force fetch`);
			}
			this._jsonData = jsonData;
		} catch (e) {
			this.devLog('jsonData Error:', e);
		}

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
				this.devLog('must init fetcher first');
				return;
			}

			if (err === NOT_ADD_FETCH) {
				this.devLog(`must add fetcher '${this._fetcher}' first`);
				return;
			}

			return Promise.reject(err);
		});
	}

	setPageInfo(pageSize, pageNumber) {
		if (this._hasErr('setPageInfo')) {
			return;
		}

		let changed = false;

		if (!isNvl(pageSize) && pageSize !== this._pageSize) {
			this._pageSize = pageSize;
			changed = true;
		}

		if (!isNvl(pageNumber) && pageNumber !== this._pageNumber) {
			this._pageNumber = pageNumber;
			changed = true;
		}

		if (changed) {
			this._emitter.emit('$$data', {
				name: `$$page:${this._name}`
			});
		}

	}

	getPageInfo() {
		if (this._hasErr('getPageInfo')) {
			return;
		}

		return {
			count: this._count,
		};
	}

	destroy() {
		if (this._destroyed) {
			return;
		}

		this.devLog(`PaginationManager=${this._key} destroyed.`);

		this._emitter.emit('$$destroy:PaginationManager', this._key);
		this._emitter.emit(`$$destroy:PaginationManager:${this._key}`);

		this._destroyed = true;

		this._dh = null;
		this._emitter = null;
		this._fetcher = null;

		this.errLog = null;

		this._key = null;
	}
}
