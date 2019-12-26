import {
	getUniIndex,
	createUid,
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

export default class FetchManager {
	constructor(dhc, refreshRate, _devMode = false) {
		this._key = getUniIndex();
		this._destroyed = false;

		this._refreshRate = refreshRate;
		this._fetchingDatastore = {};
		this._stopKeys = {};

		this._controller = dhc;
		this._dh = dhc._dh;
		this._emitter = dhc._emitter;
		
		dh._emitter.once(`$$destroy:Controller:${dhc._key}`, () => {
			this.destroy();
		});

		this.devLog = _devMode ? dhc.devLog.createLog(`FetchManager=${this._key}`) : udFun;
		this.errLog = dhc.errLog.createLog(`FetchManager=${this._key}`);
		this.destroyedErrorLog = createDestroyedErrorLog('FetchManager', this._key);

		this.devLog('created.');
	}
	
	fetch(fercher, data, stop = null) {
		if (this._destroyed) {
			this.destroyedErrorLog('fetch');
			return udFun;
		}

		const stopKey =  createUid('stopKey-');
		let doStop = () => {
			this.stopFetchByKey(stopKey);
		};
		
		this._emitter.once(`$$destroy:FetchManager:${this._key}`, doStop);
		if (typeof stop === 'string') {
			this._emitter.once(`$$data:${name}`, doStop);
		} else if (typeof stop === 'function') {
			stop(doStop);
		}
		
		return fetchData(name, data, {}, stopKey);
	}

	stopFetchByKey(key) {
		if (this._destroyed || isNvl(key)) {
			return;
		}

		if (this._stopKeys[key]) {
			stopFetchData(this._stopKeys[key]);
			this._stopKeys[key] = null;
		}
	}
	
	fetchStoreData(param) {
		const {
			name,
			data,
			clear,
			force,
			before = udFun,
			after = udFun,
		} = param;

		clearTimeout(this._fetchingDatastore[name]);
		this._fetchingDatastore[name] = setTimeout(() => {
			if (this._destroyed) {
				return;
			}

			const ds = this._dh.getDataStore(name);
			const pagination = this._dh.getPaginationManager(name);

			if (ds.isLocked()) {
				this.errLog(`can't fetch ${name} when it is locked`);
				return;
			}

			if (!force && ds.isLoading()) {
				this.errLog(`can't fetch ${name} when it is loading`);
				return;
			}

			ds.stopFetch();
			ds.clearLoading();
			this.stopFetchByKey(this._stopKeys[name]);

			const stopKey = this._stopKeys[name] = createUid('stopKey-');
			if (clear) {
				before();
				ds.clear();
				pagination.setCount(0);
				after();
				return;
			}

			const pagePromise = pagination.fetch(data);

			const dataInfo = {
				...pagination.getPageInfo()
			};

			before();
			ds.loading();

			let resultData = [];
			let errorMsg = null;

			// name, data = null, dataInfo = {}, stopKey = null
			const dataPromise = fetchData(name, data, dataInfo, stopKey)
				.then(result => {
					resultData = result;
				})
				.catch((err) => {
					errorMsg = err
				});

			Promise
				.all([dataPromise, pagePromise])
				.finally(() => {
					if (!this._destroyed) {
						if (errorMsg !== null) {
							ds.clearLoading();
							ds.setErrorMsg(errorMsg);
						} else {
							ds.loaded(result);
						}
					}
					after();
				});

		}, this._refreshRate);
	}

	destroy() {
		if (this._destroyed) {
			return;
		}
		
		this._emitter.emit('$$destroy:FetchManager', this._key);
		this._emitter.emit(`$$destroy:FetchManager:${this._key}`);
		
		for (let key of this._stopFunset){
			stopFetchData(key)
		}
		this._stopFunset = null;

		Object.values(this._fetchingDatastore).forEach(index => {
			clearTimeout(index);
		});
		this._fetchingDatastore = null;

		// TODO
	}
}
