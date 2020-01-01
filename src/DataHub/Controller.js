import {
	udFun,
	isNvl,
} from './../Utils';

import DataStore from './DataStore.js';
import FetchManager from './FetchManager.js';
import RunnerManager from './RunnerManager.js';
import ListenerManager from './ListenerManager.js';


import Component from './Component';

const publicMethods = [
	'createController',
	'watch',
	'isLoading',
	'isLocked',
	'isWillRefresh',
	'destroy',
];

let refreshRate = 40;

const {
	publicMethod
} = Component;

export function setRefreshRate(v) {
	refreshRate = v;
}

export default class Controller extends Component {

	afterCreate(dh) {
		this._dhc = this;

		this._fetchManager = new FetchManager(this, refreshRate, this._devMode);
		this._runnerManager = new RunnerManager(this, this._devMode);
		this._listenerManager = new ListenerManager(this, this._devMode);

		this._publicMethods = {};
		this._watchSet = new Set();
		this._refreshTime = 0;
		this._willRefresh = false;

		this._initPublicMethods();
		this._initWatch();
	}

	beforeDestroy() {
		clearTimeout(this.refreshTimeoutIndex);

		this._fetchManager.destroy();
		this._fetchManager = null;

		this._runnerManager.destroy();
		this._runnerManager = null;

		this._listenerManager.destroy();
		this._fetchManager = null;

		this._watchSet = null;
		this._publicMethods = null;
		
		this._willRefresh = false;
	}

	_isStatus(names, type = 'isLoading') {
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

	@publicMethod
	isLoading(names) {
		return this._isStatus(names, 'isLoading');
	}

	@publicMethod
	isLocked(names) {
		return this._isStatus(names, 'isLocked');
	}
	
	@publicMethod
	isWillRefresh() {
		return this._willRefresh;
	}

	_refresh() {
		if (this._destroyed) {
			return;
		}
		this._willRefresh = false;

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
			this._willRefresh = true;

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
						return this[methodName](...args);
					}

					return this[instanceName][methodName](...args);
				}
			}
		}

	}

	@publicMethod
	watch(callback = udFun) {
		const off = () => {
			if (this._destroyed) {
				return;
			}

			if (!this._watchSet.has(callback)) {
				return;
			}
			this._watchSet.delete(callback);
		};

		this._watchSet.add(callback);
		callback();

		return off;
	}

	@publicMethod
	fetch(...args) {
		return this._fetchManager.fetch(...args);
	}

	@publicMethod
	createController() {
		return new Controller(this._dh, this._devMode).getPublicMethods();
	}

	@publicMethod
	getPublicMethods() {
		return {
			...this._publicMethods
		};
	}

}

Controller.publicMethods = publicMethods
	.concat(DataStore.publicMethods)
	.concat(RunnerManager.publicMethods)
	.concat(ListenerManager.publicMethods)
	.concat(FetchManager.publicMethods);
