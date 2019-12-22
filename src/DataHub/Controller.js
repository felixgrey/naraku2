import {
	getUniIndex,
	createLog,
	snapshot,
	udFun,
	sameFun,
	isNvl,
	showLog
} from './../Utils';

import Fetcher from './Fetcher';
import {
	dataOpMethods
} from './DataHub';

const eventOpMethods = ['when', 'whenAll', 'on', 'once', 'emit', 'clear','destroy'];

export default class Controller {

	constructor(dh) {
		this._key = getUniIndex();

		this._dh = dh;
		this._emitter = dh._emitter;
		this._destroyed = false;

		this._switchStatus = {};
		this._paginationData = {};
		this._errorMSg = {};
		this.publicFunction = {};

		this._offSet = new Set();

		this.devLog = this._dh.devLog.createLog('Controller');
		this.errLog = this._dh.errLog.createLog('Controller');

		for (let funName of dataOpMethods) {
			this.publicFunction[funName] = (...args) => {
				if (this._destroyed) {
					this.errLog(`can't run '${funName}' event='${name}' after controller=${this._key} destroy.`);
					return [];
				}
				
				return this._dh[funName](...args);
			}
		}
		
		for (let funName of eventOpMethods) {
			this.publicFunction[funName] = (...args) => {
				if (this._destroyed) {
					this.errLog(`can't run '${funName}' event='${name}' after controller=${this._key} destroy.`);
					return udFun;
				}
				
				return this[funName](...args);
			}
		}
		
	}

	emit(name, ...args) {
		if (this._destroyed) {
			this.errLog(`can't run 'emit' event='${name}' after controller=${this._key} destroy.`);
			return;
		}
		return this._emitter(name, ...args);
	}
	
	clear(name) {
		if (this._destroyed) {
			this.errLog(`can't run 'clear' event='${name}' after controller=${this._key} destroy.`);
			return Primise.reject();
		}
		
		if (this._dh.has(name)) {
			this._dh.set(name, []);
		}
	}

	fetch(dhName, typeValue, param) {
		if (this._destroyed) {
			this.errLog(`can't run 'fetch' event='${name}' after controller=${this._key} destroy.`);
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

				if (this._dh._data[name] === undefined) {
					return;
				} else {
					dataList.push(this._dh._data[name] || []);
				}
			}

			callback(...dataList);
		};

		names.forEach(_name => {
			let _off = this._emitter.on(_name, checkReady);
			offList.push(_off);
		});

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
		// TODO
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
		this._errorMSg = null;
		this._switchStatus = null;
		this._paginationData = null;

		this.devLog = null;
		this.errLog = null;	
	}

}
