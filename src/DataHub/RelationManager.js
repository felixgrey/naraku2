import {
	getUniIndex,
	udFun,
	isNvl,
	getDeepValue,
	createDestroyedErrorLog,
	snapshot,
} from './../Utils';

const publicMethods = [
	'turnOn',
	'turnOff'
];

export default class RelationManager {

	constructor(dataStore, _devMode = false) {
		this._key = getUniIndex();
		this._clazz = this.constructor.name;
		this._logName = `${this._clazz}=${this._key}`;
		this._destroyed = false;

		this._store = dataStore;
		this._dh = dataStore._dh;
		this._dhc = this._dh._dhc;
		this._emitter = dataStore._emitter;
		this._name = dataStore._name;
		this._checkReady = udFun;
		this._defaultData = null;

		this._switchStatus = {
			off: false,
			willFetch: false,
		};

		this.devLog = _devMode ? dataStore.devLog.createLog(this._logName) : udFun;
		this.errLog = dataStore.errLog.createLog(this._logName);
		this.destroyedErrorLog = createDestroyedErrorLog(this._clazz, this._key);

		this._emitter.once(`$$destroy:${this._dh._clazz}:${this._dh._key}`, () => {
			this.devLog && this.devLog(`${this._clazz} destroyed => ${this._clazz} destroy .`);
			this.destroy();
		});

		this.devLog(`${this._logName} created.`);
	}

	_hasErr(name) {
		if (this._destroyed) {
			this.devLog(`run '${name}' failed : `, this._destroyed);
			return true;
		}

		return false;
	}

	turnOn() {
		if (this._hasErr()) {
			return;
		}

		this._switchStatus.off = false;
		if (this._switchStatus.willFetch) {
			this._switchStatus.willFetch = false;
			this._checkReady && this._checkReady();
		}
	}

	turnOff() {
		if (this._hasErr()) {
			return;
		}

		this._switchStatus.off = true;
	}

	_configPolicy = {
		default:(value, cfg) => {
			if (value === undefined) {
				value = [];
			}
			value = [].concat(value);
			
			this._defaultData = value;
			this._store.set(snapshot(value));
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

	init(cfg = {}) {
		if (this._hasErr()) {
			return;
		}

		this._configNames.forEach(cfgName => {
			const has1 = cfg.hasOwnProperty(cfgName);
			const has2 = this._configPolicy[cfgName];

			if (has1 && has2) {
				this._configPolicy[cfgName](cfg[cfgName], cfg);
			}
		});
	}

	_configNames = ['fetcher', 'clear', 'reset', 'snapshot', 'default'];

	destroy() {
		if (this._destroyed) {
			return;
		}

		this.devLog(`${this._logName} destroyed.`);

		this._emitter.emit(`$$destroy:${this._clazz}`, this._key);
		this._emitter.emit(`$$destroy:${this._clazz}:${this._key}`);

		this._offFetcher && this._offFetcher();
		this._offFetcher = null;

		this._destroyed = true;

		this._checkReady = null;
		this._defaultData = null;

		this._dh = null;
		this._dhc = null;
		this._emitter = null;

		this.devLog = null;
		this.errLog = null;

		this._key = null;
	}
}

RelationManager.publicMethods = publicMethods;
