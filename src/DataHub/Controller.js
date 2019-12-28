import {
	getUniIndex,
	udFun,
	isNvl,
	getDeepValue,
	createDestroyedErrorLog,
} from './../Utils';

import DataStore from './DataStore.js';
import FetchManager from './FetchManager.js';
import RunnerManager from './RunnerManager.js';


const publicMethods = [
	'createController',
	'watch',
	'isLoading',
	'isLocked',
];

let refreshRate = 40;

export function setRefreshRate(v) {
	refreshRate = v;
}

export default class Controller {

	constructor(dh, _devMode = false) {
		this._key = getUniIndex();
		this._destroyed = false;
		this._devMode = _devMode;

		this._watchSet = new Set();
		this._fetchingDatastore = {};
		this._refreshTime = Date.now();

		this._publicMethods = {};

		this._dh = dh;
		this._emitter = dh._emitter;

		dh._emitter.once('$$destroy:DataHub', () => {
			this.destroy();
		});

		this.devLog = _devMode ? dh.devLog.createLog(`Controller=${this._key}`) : udFun;
		this.errLog = dh.errLog.createLog(`Controller=${this._key}`);
		this.destroyedErrorLog = createDestroyedErrorLog('Controller', this._key);

		this._fetchManager = new FetchManager(this, refreshRate, _devMode);
		this._runnerManager = new RunnerManager(this, _devMode);
		this._listenerManager = new ListenerManager(this, _devMode);

		this._initPublicMethods();
		this._initWatch();

		this.devLog(`Controller=${this._key} created.`);
	}

	_isStatus(names, type = 'isLoading') {
		if (this._destroyed) {
			this.destroyedErrorLog(type);
			return false;
		}

		if (isNvl(names)) {
			return false;
		}

		for (let _name of names) {
			if (this._dh.getDataStore(_name)[type]) {
				return true;
			}
		}

		return false;
	}

	isLoading(names) {
		return this._isStatus(names, 'isLoading');
	}

	isLocked(names) {
		return this._isStatus(names, 'isLocked');
	}

	_refresh() {
		if (this._destroyed) {
			return;
		}

		this._refreshTime = Date.now();
		for (let callback of this._watchSet) {
			callback();
		}
	}

	_initWatch() {
		const lagRefresh = () => {
			if (this._destroyed) {
				return;
			}
			clearTimeout(this.refreshTimeoutIndex);

			const time = Date.now() - this._refreshTime;
			if (time > refreshRate * 2) {
				this.devLog('refresh now', time);
				this._refresh();
				return;
			}

			this.refreshTimeoutIndex = setTimeout(() => {
				this.devLog('refresh lag', time);
				this._refresh();
			}, refreshRate);
		};

		const off1 = this._emitter.on('$$data', lagRefresh);
		const off2 = this._emitter.on('$$status', lagRefresh);

		this._emitter.once(`$$destroy:Controller:${this._key}`, () => {
			off1();
			off2();
		});

	}


	_initPublicMethods() {

		const allPublicMethods = {
			_dh: DataStore.publicMethods,
			_fetchManager: FetchManager.publicMethods,
			_runnerManager: RunnerManager.publicMethods,
			_listenerManager: ListenerManager.publicMethods,
			'controller': publicMethods
		};

		for (let instanceName in allPublicMethods) {
			for (let methodName of allPublicMethods[instanceName]) {
				this._publicMethods[methodName] = (...args) => {
					if (this._destroyed) {
						this.destroyedErrorLog(methodName);
						return udFun;
					}

					if (instanceName === 'controller') {
						return this[instanceName][methodName](...args);
					}

					return this[instanceName][methodName](...args);
				}
			}
		}

	}

	watch(callback = udFun) {
		if (this._destroyed) {
			this.destroyedErrorLog('watch');
			return udFun;
		}

		const off = () => {
			if (!this._watchSet.has(callback)) {
				return;
			}
			this._watchSet.delete(callback);
		};

		this._watchSet.add(callback);
		callback();

		return off;
	}

	fetch(...args) {
		if (this._destroyed) {
			this.destroyedErrorLog('fetch');
			return udFun;
		}
		return this._fetchManager.fetch(...args);
	}

	createController() {
		if (this._destroyed) {
			this.destroyedErrorLog('createController');
			return udFun;
		}

		return new Controller(this._dh, this._devMode).getPublicMethods();
	}

	getPublicMethods() {
		if (this._destroyed) {
			this.destroyedErrorLog('getPublicMethods');
			return {};
		}

		return {
			...this._publicMethods
		};
	}

	destroy() {
		if (this._destroyed) {
			return;
		}

		this.devLog(`Controller=${this._key} destroyed.`);

		clearTimeout(this.refreshTimeoutIndex);

		this._fetchManager.destroy();
		this._fetchManager = null;

		this._runnerManager.destroy();
		this._runnerManager = null;

		this._listenerManager.destroy();
		this._fetchManager = null;

		this._emitter.emit('$$destroy:Controller', this._key);
		this._emitter.emit(`$$destroy:Controller:${this._key}`);

		this._watchSet = null;
		this._dh = null;
		this._emitter = null;

		this.devLog = null;
		this.errLog = null;

		this._key = null;
	}
}

Controller.publicMethods = publicMethods
	.concat(DataStore.publicMethods)
	.concat(RunnerManager.publicMethods)
	.concat(ListenerManager.publicMethods)
	.concat(FetchManager.publicMethods);
