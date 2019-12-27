import {
	getUniIndex,
	udFun,
	isNvl,
	getDeepValue,
	createDestroyedErrorLog,
} from './../Utils';

import DataStore from './DataStore';
import FetchManager from './FetchManager';
import ListenerManager from './ListenerManager';

const publicMethods = [
	'createController',
	'watch',
	// 'fetch',
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

		this._publicMethods = {
			createController: () => this.createController(),
			watch: (...args) => this.watch(...args),
			fetch: (...args) => this.fetch(...args),
			isLoading: (...args) => this.isLoading(...args),
			isLocked: (...args) => this.isLocked(...args),
		};

		this._dh = dh;
		this._emitter = dh._emitter;

		dh._emitter.once('$$destroy:DataHub', () => {
			this.destroy();
		});

		this._initDhPublicMethods();
		this._initWatch();

		this.devLog = _devMode ? dh.devLog.createLog(`Controller=${this._key}`) : udFun;
		this.errLog = dh.errLog.createLog(`Controller=${this._key}`);
		this.destroyedErrorLog = createDestroyedErrorLog('Controller', this._key);
		
		this._fetchManager = new FetchManager(this, refreshRate, _devMode);
		
		// ListenerManager

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

	_initDhPublicMethods() {
		DataStore.publicMethods.forEach(methodName => {
			this._publicMethods[methodName] = (...args) => {
				if (this._destroyed) {
					this.destroyedErrorLog(methodName);
					return udFun;
				}
				return this._dh[methodName](...args);
			}
		});
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
			return udFun;
		}

		return { ...this._publicMethods
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
	.concat(ListenerManager.publicMethods)
	.concat(FetchManager.publicMethods);
