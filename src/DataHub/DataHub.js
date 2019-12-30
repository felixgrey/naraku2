import {
	getUniIndex,
	udFun,
	isNvl,
	getDeepValue,
	createDestroyedErrorLog,
} from './../Utils';

import Emitter from './Emitter';
import DataStore from './DataStore';
import Controller from './Controller';

export default class DataHub {
	constructor(cfg, devLog = udFun, errLog = udFun, _devMode = false) {
		this._key = getUniIndex();
		this._clazz = this.constructor.name;
		this._logName = `${this._clazz}=${this._key}`;
		this._destroyed = false;

		this._cfg = cfg;
		this._devMode = _devMode;

		this._dataCenter = {};
		this._extendConfig = {};

		this._emitter = new Emitter(this.devLog, this.errLog, _devMode);
		this._dh = this;
		this._dhc = new Controller(this);

		this._emitter.once(`$$destroy:Emitter=${this._emitter._key}`, () => {
			this.devLog && this.devLog(`Emitter destroyed => DataHub destroy .`);
			this.destroy();
		});

		this._emitter.once(`$$destroy:Controller=${this._dhc._key}`, () => {
			this.devLog && this.devLog(`Controller destroyed => DataHub destroy .`);
			this.destroy();
		});

		this.devLog = _devMode ? devLog.createLog(this._logName) : udFun;
		this.errLog = errLog.createLog(this._logName);
		this.destroyedErrorLog = createDestroyedErrorLog('DataHub', this._key);

		this._initDsPublicMethods();
		this._init();

		this.devLog(`${this._logName} created.`);
	}

	_init() {
		for (let name in this._cfg) {
			if (/\_|\$/g.test(name.charAt(0))) {
				this._extendConfig[name] = this._cfg[name];
				continue;
			}
			this.getDataStore(name).setConfig(this._cfg[name]);
		}
	}

	_initDsPublicMethods() {
		DataStore.publicMethods.forEach(methodName => {
			this[methodName] = (name, ...args) => {
				if (this._destroyed) {
					this.destroyedErrorLog(methodName);
					return udFun;
				}

				return this.getDataStore(name)[methodName](...args);
			}
		});
	}

	getDataStore(name) {
		if (!this._dataCenter[name]) {
			this._dataCenter[name] = new DataStore(this, name, this.devLog, this.errLog, this._devMode);
		}
		return this._dataCenter[name];
	}

	getController() {
		if (this._destroyed) {
			this.destroyedErrorLog('getController');
			return udFun;
		}

		return this._dhc.getPublicMethods();
	}

	destroy() {
		if (this._destroyed) {
			return;
		}

		this.devLog(`${this._logName} destroyed.`);

		this._emitter.emit(`$$destroy:${this._clazz}`, this._key);
		this._emitter.emit(`$$destroy:${this._clazz}=${this._key}`);

		Object.values(this._dataCenter).forEach(ds => ds.destroy());
		this._dataCenter = null;

		this._dhc.destroy();
		this._dhc = null;

		this._emitter.destroy();
		this._emitter = null;

		this._destroyed = true;

		this._dh = null;
		this._key = null;
	}
}
