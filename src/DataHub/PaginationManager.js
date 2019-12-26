import {
	createUid,
	getUniIndex,
	udFun,
	isNvl,
	getDeepValue,
	createDestroyedErrorLog,
} from './../Utils';

import {
	NOt_INIT_FETCHER,
	NOt_ADD_FETCH,
	FETCHING,
	stopFetchData,
	fetchData,
} from './Fetcher';

export default class PaginationManager {
	constructor(dh, name, _devMode = false) {
		this._key = getUniIndex();
		this._destroyed = false;
		this._name = name;

		this._fetcher = null;
		this._jsonData = '';
		this._force = false;
		this._on = false;
		this._pageSize = 10;
		this._pageNumber = 1;
		this._startPage = 1;
		this._stopKey = null;
		this._count = 0;

		this._dh = dh;
		this._emitter = dh._emitter;

		this._emitter.once('$$destroy:DataHub', () => {
			this.destroy();
		});

		this.devLog = _devMode ? dh.devLog.createLog(`PaginationManager=${this._key}`) : udFun;
		this.errLog = dh.errLog.createLog(`PaginationManager=${this._key}`);
		this.destroyedErrorLog = createDestroyedErrorLog('PaginationManager', this._key);

		this.devLog('created.');
	}

	setCount(v) {
		if (this._destroyed) {
			this.destroyedErrorLog('setCount');
			return;
		}

		if (this._stopKey) {
			this.errLog(` ${this._name} can't set count when it is loading`);
			return;
		}

		this._count = v;
	}

	getCount() {
		if (this._destroyed) {
			this.destroyedErrorLog('getCount');
			return 0;
		}

		return this._count;
	}

	setInit(param = {}) {

		const {
			flag = false,
				fetcher = null,
				force = false,
				startPage = 1,
				pageSize = 10
		} = param;

		this._on = flag;
		this._fetcher = fetcher;
		this._force = force;
		this._startPage = startPage;
		this._pageSize = pageSize;
	}

	stopFetch() {
		if (this._destroyed) {
			this.destroyedErrorLog('stopFetch');
			return;
		}

		if (!this._on) {
			return;
		}

		if (this._stopKey) {
			stopFetchData(this._stopKey);
			this._stopKey = null;
		}
	}

	fetch(data) {
		if (this._destroyed) {
			this.destroyedErrorLog('fetch');
			return udFun;
		}

		if (!this._on) {
			return udFun;
		}

		if (!this._fetcher) {
			return udFun;
		}

		this.stopFetch();

		const jsonData = JSON.stringify(data);
		if (!this._force && jsonData === this._jsonData) {
			return;
		}
		this._jsonData = jsonData;

		const stopKey = this._stopKey = createUid('pageStopKey-');

		// name, data = null, dataInfo = {}, stopKey = null
		return fetchData(this._fetcher, data, {}, stopKey).then(result => {
			if (this._destroyed) {
				return;
			}

			this._count = result;

			this._emitter.emit('$$data', {
				name: `$$count:${this.name}`,
				value: result
			});
		});
	}

	setPageInfo(pageSize, pageNumber) {
		if (this._destroyed) {
			this.destroyedErrorLog('setPageInfo');
			return;
		}

		if (!this._on) {
			return;
		}
	}

	getPageInfo() {
		if (this._destroyed) {
			this.destroyedErrorLog('getPageInfo');
			return {};
		}

		if (!this._on) {
			return {};
		}

		return {};
	}

	destroy() {
		if (this._destroyed) {
			return;
		}

		this._emitter.emit('$$destroy:PaginationManager', this._key);
		this._emitter.emit(`$$destroy:PaginationManager:${this._key}`);

		this._destroyed = true;

		this._dh = null;
		this._emitter = null;

		this.devLog = null;
		this.errLog = null;
		this.destroyedErrorLog = null;

		this._key = null;
	}
}
