import {
	getUniIndex,
	udFun,
	isNvl,
	getDeepValue,
	createDstroyedErrorLog
} from './../Utils';

import Fetcher from './Fetcher';
import {
	dataOpMethods
} from './DataHub';

const controllerOpMethods = [
	'when', 'whenAll', 'on', 'once', 'emit',
	'first', 'getValue', 'clear',
	'getSwitchStatus', 'setSwitchStatus',
	'destroy',
];

export default class Controller {

	constructor(dh) {
		this._key = getUniIndex();

		this._dh = dh;
		this._emitter = dh._emitter;
		this._destroyed = false;

		this._switchStatus = {};
		this._paginationData = {};
		this.publicFunction = {};

		this._offSet = new Set();

		this.dstroyedErrorLog = createDstroyedErrorLog('Controller', this._key);

		this.devLog = this._dh.devLog.createLog('Controller');
		this.errLog = this._dh.errLog.createLog('Controller');

		for (let funName of dataOpMethods) {
			this.publicFunction[funName] = (...args) => {
				if (this._destroyed) {
					this.dstroyedErrorLog(funName, args);
					return [];
				}

				// this.devLog('publicFunction.' + funName + '@controller=' + this._key, args);

				return this._dh[funName](...args);
			}
		}

		for (let funName of controllerOpMethods) {
			this.publicFunction[funName] = (...args) => {
				if (this._destroyed) {
					this.dstroyedErrorLog(funName, args);
					return udFun;
				}

				// this.devLog('publicFunction.' + funName + '@controller=' + this._key, args);

				return this[funName](...args);
			}
		}

		this.publicFunction.stopFetchData = () => {
			if (this._destroyed) {
				this.dstroyedErrorLog('stopFetchData');
				return null;
			}
			// TODO
		}

		this.publicFunction.fetchData = () => {
			if (this._destroyed) {
				this.dstroyedErrorLog('fetchData');
				return null;
			}
			// TODO
		}

		this.publicFunction.stopFetchDataByName = () => {
			if (this._destroyed) {
				this.dstroyedErrorLog('stopFetchDataByName');
				return null;
			}
			// TODO
		}

		this.publicFunction.createController = () => {
			if (this._destroyed) {
				this.dstroyedErrorLog('createController');
				return null;
			}
			return new Controller(this._dh).publicFunction;
		}

	}

	getSwitchStatus() {
		// TODO
	}

	setSwitchStatus() {
		// TODO
	}

	first(dhName, defaultValue = {}) {
		return this.getValue(dhName + '.0', defaultValue);
	}

	getValue(fullPath, defaultValue) {
		const [dhName, ...pathArr] = fullPath.split('.');
		return getDeepValue(this._dh.get(dhName), pathArr.join('.'), defaultValue);
	}

	stopFetchData(dhName) {
		this._emitter.emit('$$stopFetchData', dhName);
		// TODO
	}

	emit(name, ...args) {
		return this._emitter.emit(name, ...args);
	}

	clear(name) {
		if (this._dh.hasData(name)) {
			this._dh.set(name, []);
		}
	}

	fetch(dhName, typeValue, param) {
		if (this._destroyed) {
			this.errLog(`can't run 'fetch' '${dhName}' after controller=${this._key} destroy.`);
			return Primise.reject();
		}
		// TODO
	}

	when(names, callback) {
		if (isNvl(names)) {
			return udFun;
		}

		let offList = [];

		names = [].concat(names);

		const checkReady = () => {
			if (this._destroyed || this._dh._destroyed) {
				return;
			}

			const dataList = [];

			for (let _name of names) {
				if (isNvl(_name)) {
					dataList.push([]);
					continue;
				}

				if (!this._dh.hasData(_name)) {
					return;
				} else {
					dataList.push(this._dh.get(_name));
				}
			}

			callback(...dataList);
		};

		names.forEach(_name => {
			let _off = this._emitter.on('$$data:' + _name, checkReady);
			offList.push(_off);
		});
		checkReady();

		const off = () => {
			if (!this._offSet.has(off)) {
				return;
			}
			this._offSet.delete(off);
			offList.forEach(fun => fun());
		};
		this._offSet.add(off);

		return off;
	}

	whenAll(names, callback) {
		if (isNvl(names)) {
			return udFun;
		}

		names = [].concat(names);

		let offList;

		const createCheckReady = (readyCallback = udFun) => {
			let readyCount = 0;

			return () => {
				readyCount++
				if (readyCount === names.length) {
					readyCallback(...names.map(_name => this._dh.get(_name)));
				}
			}
		};

		let watchReady = () => {
			if (this._destroyed || this._dh._destroyed) {
				return;
			}

			offList = [];
			let checkReady = createCheckReady((...args) => {
				callback(...args);
				watchReady();
			});

			for (let _name of names) {
				let _off = this._emitter.once('$$data:' + _name, checkReady);
				offList.push(_off);
			}
		}

		watchReady();

		if (names.filter(_name => this._dh.hasData(_name)).length === names.length) {
			callback(...names.map(_name => this._dh.get(_name)));
		}

		return () => {
			if (this._destroyed || this._dh._destroyed) {
				return;
			}

			if (!offList) {
				return;
			}

			offList.forEach(off => off());
			offList = null;
		}
	}

	_onAndOnce(name, callback, once) {
		let _off = this._emitter[once ? 'once' : 'on'](name, callback);

		const off = () => {
			if (!this._offSet.has(off)) {
				return;
			}
			this._offSet.delete(off);
			_off();
		};
		this._offSet.add(off);

		return off;
	}

	on(name, callback) {
		return this._onAndOnce(name, callback, false);
	}

	once(name, callback) {
		return this._onAndOnce(name, callback, true);
	}

	destroy() {
		if (this._destroyed) {
			return;
		}

		this._emitter.emit('$$destroy:controller', this._key);
		this.devLog(`controller=${this._key} destroyed.`);

		Array.from(this._offSet.values()).forEach(fun => fun());

		this._destroyed = true;
		this._offSet = null;
		this._dh = null;
		this._emitter = null;
		this._switchStatus = null;
		this._paginationData = null;

		this.devLog = null;
		this.errLog = null;
	}

}
