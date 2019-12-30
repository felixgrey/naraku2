import {
	getUniIndex,
	udFun,
	isNvl,
	getDeepValue,
	createDestroyedErrorLog,
	snapshot,
} from './../Utils';

import Component from './Component';

const publicMethods = [
	'turnOn',
	'turnOff'
];

const {
	publicMethod
} = Component;

export default class RelationManager extends Component {
	afterCreate(store) {
		this._name = store._name;
		this._checkReady = udFun;
		this._defaultData = null;

		this._switchStatus = {
			off: false,
			willFetch: false,
		};
	}

	beforeDestroy() {
		this._offFetcher && this._offFetcher();
		this._offFetcher = null;

		this._checkReady = null;
		this._defaultData = null;
		this._switchStatus = null;

	}

	@publicMethod
	turnOn() {
		this._switchStatus.off = false;
		if (this._switchStatus.willFetch) {
			this._switchStatus.willFetch = false;
			this._checkReady && this._checkReady();
		}
	}

	@publicMethod
	turnOff() {
		this._switchStatus.off = true;
	}

	_configPolicy = {
		default: (value, cfg) => {
			if (value === undefined) {
				value = [];
			}
			value = [].concat(value);

			this._defaultData = value;
			this._store.set(snapshot(value));
		},
		clear: (value, cfg) => {
			if (!this._dhc._listenerManager) {
				this.devLog(`config clear err: no listenerManager`);
				return;
			}

			this._dhc._listenerManager.when(value, () => {
				this._store.clear();
			});
		},
		reset: (value, cfg) => {
			if (!this._dhc._listenerManager) {
				this.devLog(`config reset err: no listenerManager`);
				return;
			}

			if (!this._defaultData) {
				this._dhc._listenerManager.when(value, () => {
					this._store.clear();
				});
			} else {
				this._dhc._listenerManager.when(value, () => {
					this._store.set(snapshot(this._defaultData));
				});
			}
		},
		snapshot: (value, cfg) => {
			if (!this._dhc._listenerManager) {
				this.devLog(`config snapshot err: no listenerManager`);
				return;
			}

			this._dhc._listenerManager.when(value, (data) => {
				this._store.set(snapshot(data));
			});
		},
		stop: (value, cfg) => {
			if (!this._dhc._listenerManager || !this._dhc._fetchManager) {
				this.devLog(`config stop err: no listenerManager/fetchManager`,
					!!this._dhc._fetchManager,
					!!this._dhc._listenerManager
				);
				return;
			}

			this._dhc._listenerManager.when(value, (data) => {
				this._fetchManager.stopFetch(this._name);
			});
		},
		fetcher: (value, cfg) => {
			let {
				dependence = [],
					filter = [],
					off = false,
					force = false,
			} = cfg;

			let ableFlag = this._dh.getDataStore;
			ableFlag = ableFlag && this._dhc._fetchManager;
			ableFlag = ableFlag && this._dhc._listenerManager;

			if (!ableFlag) {
				this.devLog(`not able`,
					!!this._dh.getDataStore,
					!!this._dhc._fetchManager,
					!!this._dhc._listenerManager
				);
				return;
			}

			this._store._eternal = true;
			this._switchStatus.off = off;

			dependence = [].concat(dependence);
			filter = [].concat(filter);

			const whenThem = [].concat(dependence).concat(filter);

			const checkReady = () => {
				this.devLog(`dependence checkReady`);
				const submitData = {};

				for (let dep of dependence) {
					const depStore = this._dh.getDataStore(dep);

					if (!depStore.hasData()) {
						if (this._store.hasData()) {
							const param = {
								name: this._name,
								clear: true,
								force,
							};

							this._dhc._fetchManager.fetchStoreData(param);
						}
						return;
					}
					Object.assign(submitData, depStore.first());
				}

				if (this._switchStatus.off) {
					this._switchStatus.willFetch = true;
					return;
				}

				for (let ft of filter) {
					Object.assign(submitData, this._dh.getDataStore(ft).first());
				}

				const param = {
					name: this._name,
					data: submitData,
					clear: false,
					force,
					before: () => {
						whenThem.forEach(storeName => {
							this._dh.getDataStore(storeName).lock();
						});
					},
					after: () => {
						whenThem.forEach(storeName => {
							this._dh.getDataStore(storeName).unLock();
						});
					},
				};

				this.devLog(`fetch Data`, param);
				this._dhc._fetchManager.fetchStoreData(param);
			};

			this.devLog(`whenThem :`, whenThem);
			this._offFetcher = this._dhc._listenerManager.when(...whenThem, checkReady);
			this._checkReady = checkReady;
			checkReady();
		}
	}

	@publicMethod
	init(cfg = {}) {
		this._configNames.forEach(cfgName => {
			const has1 = cfg.hasOwnProperty(cfgName);
			const has2 = this._configPolicy[cfgName];

			if (has1 && has2) {
				this._configPolicy[cfgName](cfg[cfgName], cfg);
			}
		});
	}

	_configNames = ['default', 'clear', 'fetcher', 'reset', 'snapshot', 'stop'];

}

RelationManager.publicMethods = publicMethods;
