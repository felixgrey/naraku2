import {
	createUid,
	getUniIndex,
	createLog,
	snapshot,
	udFun,
	sameFun,
	isNvl,
	createDstroyedErrorLog
} from './../Utils';

import {
	FETCHING
} from './Fetcher';

import PaginationManager from './PaginationManager';

export default class ConfigManager {

	constructor(dh) {
		this._key = getUniIndex();

		this._dh = dh;
		this.extendConfig = dh.extendConfig;
		this._eternalData = dh._eternalData;
		this._controller = dh._controller;
		this._emitter = dh._controller._emitter;
		this._switchStatus = dh._controller._switchStatus;
		this._paginationData = dh._controller._paginationData;

		this._stopKeys = {};

		this._hasInit = false;
		this._destroyed = false;

		this.devLog = this._dh.devLog.createLog('ConfigManager');
		this.errLog = this._dh.errLog.createLog('ConfigManager');

		this.dstroyedErrorLog = createDstroyedErrorLog('ConfigManager', this._key);


		this.init();

		this._controller.publicFunction.on('$$stopFetchData', (dhName) => {
			this._switchStatus[dhName].willFetch = false;
		});
	}

	_configNames = ['fetcher', 'clear', 'reset', 'snapshot', 'default'];

	_configPolicy = {
		fetcher: (dhName, fetcher, dhCfg) => {
			let {
				dependence = [],
					filter = [],
					off = false,
					forceFetch = false,
					pagination = null
			} = dhCfg;

			this._dh.setStatus(dhName, 'undefined');

			dependence = [].concat(dependence);
			filter = [].concat(filter);

			let whenThem = [].concat(dependence).concat(filter);

			this._switchStatus[dhName] = {
				off,
				willFetch: false,
			};

			// this.devLog(`this._switchStatus[dhName]`, this._switchStatus[dhName]);

			let checkReady = () => {
				const param = {};

				// this.devLog(dependence);
				for (let dep of dependence) {
					// this.devLog(dep, this._dh.hasData(dep));

					if (!this._dh.hasData(dep)) {
						this._controller.fetchData(fetcher, dhName, param, true, forceFetch);
						return;
					}
					// this.devLog(dep, this._controller.first(dep));
					Object.assign(param, this._controller.first(dep));
				}

				for (let ft of filter) {
					Object.assign(param, this._controller.first(ft));
				}

				if (this._switchStatus[dhName].off) {
					this._switchStatus[dhName].willFetch = true;
				} else {
					
					let beforeFetch = udFun

					if (!forceFetch) {
						beforeFetch = () => {
							whenThem.forEach(thatName => {
								this._dh.lock(thatName);
							});
						}
					}

					this._controller
						.fetchData(fetcher, dhName, param, false, forceFetch, beforeFetch)
						.then(() => {
							if (this._destroyed) {
								return;
							}

							if (!forceFetch) {
								whenThem.forEach(thatName => {
									this._dh.unLock(thatName);
								});
							}
						});
				}
			}

			if (pagination) {
				if (typeof pagination === 'object') {
					pagination.dhName = dhName;
					let pageChange = `$$pagination:checkReady:${dhName}`;
					this._controller.on(pageChange, checkReady);
					this._paginationData[dhName] = new PaginationManager(pageChange, this._dh, pagination);

					const devLog = this.devLog.createLog(`PaginationManager:${dhName}`);
					const errLog = this.errLog.createLog(`PaginationManager:${dhName}`);

					this._paginationData[dhName].setLogger(devLog, errLog);
				} else {
					this.errLog(`pagination of '${dhName}' must be object`);
				}
			}

			this._switchStatus[dhName].checkReady = checkReady;

			this._controller.when(whenThem, checkReady);

			checkReady();

		},
		clear: (dhName, typeValue, dhCfg) => {
			// TODO
		},
		reset: (dhName, typeValue, dhCfg) => {
			// TODO
		},
		snapshot: (dhName, typeValue, dhCfg) => {
			// TODO
		},
		stop: (dhName, typeValue, dhCfg) => {
			// TODO
		},
		default: (dhName, typeValue, dhCfg) => {
			if (typeValue === undefined) {
				typeValue = [];
			}
			typeValue = snapshot([].concat(typeValue));
			this._dh.set(dhName, typeValue);
		}
	}

	turnOn(dhName) {
		if (this._destroyed) {
			this.dstroyedErrorLog('turnOn');
			return;
		}

		if (isNvl(dhName)) {
			return;
		}

		if (!this._switchStatus[dhName]) {
			this.errLog(`can't turnOn ${dhName} if not existed.`);
			return;
		}

		const {
			willFetch,
			checkReady
		} = this._switchStatus[dhName];

		this._switchStatus[dhName].off = false;

		if (willFetch) {
			this._switchStatus[dhName].willFetch = false;
			checkReady();
		}
	}

	turnOff(dhName) {
		if (this._destroyed) {
			this.dstroyedErrorLog('turnOff');
			return;
		}

		if (isNvl(dhName)) {
			return;
		}

		if (!this._switchStatus[dhName]) {
			this.errLog(`can't turnOff ${dhName} if not existed.`);
			return;
		}

		this._switchStatus[dhName].off = true;
	}

	init() {
		if (this._destroyed) {
			this.errLog(`can't run 'init' after configManager=${this._key} destroy.`);
			return;
		}

		if (this._hasInit === true) {
			return;
		}

		this._hasInit = true;
		const cfg = this._dh._config;
		this._name = cfg.$name || null;
		for (let dhName in cfg) {
			let dhCfg = cfg[dhName];

			if (/\_|\$/g.test(dhName.charAt(0))) {
				this.extendConfig[dhName] = dhCfg;
				continue;
			}

			this._eternalData.push(dhName);

			if (isNvl(dhCfg) || Array.isArray(dhCfg) || typeof dhCfg !== 'object') {
				dhCfg = {
					default: dhCfg
				};
			}

			if (!dhCfg.hasOwnProperty('fetcher')) {
				if (dhCfg.hasOwnProperty('action')) {
					dhCfg.fetcher = dhCfg.action;
				} else if (dhCfg.hasOwnProperty('type')) {
					dhCfg.fetcher = dhCfg.type;
				}
			}

			for (let configName of this._configNames) {
				if (/\_|\$/g.test(configName.charAt(0))) {
					// NEXT TODO
					continue;
				}

				if (dhCfg.hasOwnProperty(configName) && this._configPolicy[configName]) {
					this._configPolicy[configName].bind(this)(dhName, dhCfg[configName], dhCfg, cfg);
				}
			}
		}
	}

	destroy() {
		if (this._destroyed) {
			return;
		}

		this._emitter.emit('$$destroy:configManager', this._key);
		// this.devLog(`configManager=${this._key} destroyed.`);

		this._destroyed = true;

		this._controller = null;
		this._dh = null;
		this._emitter = null;
		this._switchStatus = null;
		this._paginationData = null;

		this._stopKeys = null;
		this._eternalData = null;

		this.devLog = null;
		this.errLog = null;
		this.extendConfig = null;
	}
}
