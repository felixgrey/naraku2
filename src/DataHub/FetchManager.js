import {
	getUniIndex,
	createUid,
	udFun,
	isNvl,
	getDeepValue,
	createDestroyedErrorLog,
} from './../Utils';

import {
	ABORT_REQUEST,
	stopFetchData,
	fetchData,
} from './Fetcher';

import Component from './Component';

const publicMotheds = [
	'fetch'
];

const {
	publicMethod
} = Component;

export default class FetchManager extends Component {

	afterCreate(dhc, refreshRate = 40, _devMode = false) {
		this._fetchingDatastore = {};
		this._stopKeys = {};
		this._refreshRate = refreshRate;
	}

	beforeDestroy() {
		Object.values(this._stopKeys).forEach(key => {
			stopFetchData(key);
		});
		this._stopKeys = null;

		Object.values(this._fetchingDatastore).forEach(index => {
			clearTimeout(index);
		});
		this._fetchingDatastore = null;
	}

	@publicMethod
	fetch(fetcher, data, dataInfo = {}, stop = null) {
		const stopKey = createUid('stopKey-');
		this._stopKeys[stopKey] = stopKey;

		let doStop = () => {
			this.devLog(`stop fetch  `, fetcher, data, stopKey);
			this.stopFetch(stopKey);
		};

		this._emitter.once(`$$destroy:FetchManager:${this._key}`, doStop);
		if (typeof stop === 'string') {
			this._emitter.once(`$$data:${stop}`, doStop);
		} else if (typeof stop === 'function') {
			stop(doStop);
		}

		return fetchData(fetcher, data, dataInfo, stopKey).catch(err => {
			if (this._destroyed) {
				return;
			}

			if (err === ABORT_REQUEST) {
				this.devLog('abort request: ', fetcher, data, stopKey)
				return;
			}

			return Promise.reject(err);
		});
	}

	@publicMethod
	stopFetch(name) {
		if (this._stopKeys[name]) {
			stopFetchData(this._stopKeys[name]);
			this._stopKeys[name] = null;
		}

		if (this._fetchingDatastore[name]) {
			clearTimeout(this._fetchingDatastore[name]);
			this._fetchingDatastore[name] = null;
		}
	}

	@publicMethod
	fetchStoreData(param = {}) {
		const {
			name = null,
				data = {},
				clear = false,
				force = false,
				before = udFun,
				after = udFun,
		} = param;

		clearTimeout(this._fetchingDatastore[name]);
		this._fetchingDatastore[name] = setTimeout(() => {
			if (this._destroyed) {
				return;
			}

			const ds = this._dh.getDataStore(name);
			const pagination = ds.getPaginationManager();

			const {
				fetcher = null
			} = ds.getStoreConfig();

			if (!fetcher) {
				this.devLog(`fetchStoreData failed: store=${name} no fetcher.`);
				return;
			}

			if (ds.isLocked()) {
				this.errLog(`can't fetch ${name} when it is locked`);
				return;
			}

			if (!force && ds.isLoading()) {
				this.errLog(`can't fetch ${name} when it is loading`);
				return;
			}

			pagination.stopFetch();
			ds.clearLoading();
			this.stopFetch(this._stopKeys[name]);

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
				dataStore: true,
				name,
				...pagination.getPageInfo()
			};

			before();
			ds.loading();

			let resultData = [];
			let errorMsg = null;

			// fetcher, data = null, dataInfo = {}, stopKey = null
			const dataPromise = fetchData(fetcher, data, dataInfo, stopKey)
				.then(result => {
					resultData = result;
				})
				.catch(err => {
					errorMsg = err
				});

			Promise
				.all([dataPromise, pagePromise])
				.finally(() => {
					if (!this._destroyed) {
						if (errorMsg !== null) {
							ds.clearLoading();
							if (errorMsg !== ABORT_REQUEST) {
								ds.setErrorMsg(errorMsg);
							}
						} else {
							ds.loaded(resultData);
						}
					}
					after();
				});

		}, this._refreshRate);
	}

}

FetchManager.publicMotheds = publicMotheds;
