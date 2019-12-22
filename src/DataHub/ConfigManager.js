import {
	createUid,
	getUniIndex,
	createLog,
	snapshot,
	udFun,
	sameFun,
	isNvl,
	showLog
} from './../Utils';

import {
	FETCHING
} from './Fetcher'


export default class ConfigManager {

	constructor(dh) {
		this._key = getUniIndex();

		this._dh = dh;
		this._controller = dh._controller;
		this._emitter = this._controller._emitter;
		this._switchStatus = this._controller._switchStatus;
		this._paginationData = this._controller._paginationData;

		this._dhNames = [];
		this._stopKeys = {};

		this._hasInit = false;
		this._destroyed = false;

		this.devLog = this._dh.devLog.createLog('ConfigManager');
		this.errLog = this._dh.errLog.createLog('ConfigManager');

		this.init();
	}

	_configNames = ['fetcher', 'clear', 'reset', 'snapshot', 'default'];

	_configPolicy = {
		fetcher: function(dhName, typeValue, dhCfg, cfg) {
			let {
				dependence = [],
					filter = [],
					off = false,
					pagination = null
			} = dhCfg;

			dependence = [].concat(dependence);
			filter = [].concat(filter);

			let whenThem = [].concat(dependence).concat(filter);

			this._switchStatus[dhName] = {
				off,
				willFetch: false,
			};

			let checkReady = () => {
				const param = {};
				for (let dep of dependence) {
					if (!this._dh.has(dep)) {
						return;
					}
					Object.assign(param, this._controller.first(dep));
				}

				for (let ft of filter) {
					Object.assign(param, this._controller.first(ft));
				}

				if (this._switchStatus[dhName].off) {
					this._switchStatus[dhName].willFetch = true;
				} else {
					this._controller.fetch(dhName, typeValue, param);
				}
			}

			this._switchStatus[dhName].checkReady = checkReady;

			this._controller.when(whenThem, checkReady);
		}
	}

	turnOn(dhName) {
		if (this._destroyed) {
			this.errLog(`can't run 'turnOn' after configManager=${this._key} destroy.`);
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
			this.errLog(`can't run 'turnOff' after configManager=${this._key} destroy.`);
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
			if (/\_|\$/g.test(dhName.charAt(0))) {
				continue;
			}

			this._dhNames.push(dhName);
			let dhCfg = cfg[dhName];

			if (!dhCfg.hasOwnProperty('fetcher')) {
				if (dhCfg.hasOwnProperty('action')) {
					dhCfg.fetcher = dhCfg.action;
				} else if (dhCfg.hasOwnProperty('type')) {
					dhCfg.fetcher = dhCfg.type;
				}
			}

			if (Array.isArray(dhCfg)) {
				dhCfg = {
					default: dhCfg
				};
			}

			for (let configName of this._configNames) {
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
		this.devLog(`configManager=${this._key} destroyed.`);

		this._destroyed = true;

		this._controller = null;
		this._dh = null;
		this._emitter = null;
		this._switchStatus = null;
		this._paginationData = null;
		
		this._dhNames = null;
		this._stopKeys = null;

		this.devLog = null;
		this.errLog = null;
	}
}
