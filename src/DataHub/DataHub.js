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
		this._cfg = cfg;
		this._destroyed = false;
		this._devMode = _devMode;
		
		this._dataCenter = {};

		this._emitter = new Emitter(this.devLog, this.errLog, _devMode);
		this._initDsPublicMethods();
		this._controller = new Controller(this);
		
		// ConfigManager


		this.devLog = _devMode ? devLog.createLog(`DataHub=${this._key}`) : udFun;
		this.errLog = errLog.createLog(`DataHub=${this._key}`);
		this.destroyedErrorLog = createDestroyedErrorLog('DataHub', this._key);

		this.devLog(`DataHub=${this._key} created.`);
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
		
		return this._controller.getPublicMethods();
	}

	destroy() {
		if (this._destroyed) {
			return;
		}

		this.devLog(`DataHub=${this._key} destroyed.`);

		this._emitter.emit('$$destroy:DataHub', this._key);
		this._emitter.emit(`$$destroy:DataHub:${this._key}`);

		// ConfigManager

		this._controller.destroy();
		this._controller = null;

		Object.values(this._dataCenter).forEach(ds => ds.destroy());
		this._dataCenter = null;

		this._emitter.destroy();
		this._emitter = null;

		this._destroyed = true;
		this._key = null;
	}
}
