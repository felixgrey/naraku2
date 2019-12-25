import {
	EventEmitter
} from 'events';

import {
	getUniIndex,
	createLog,
	snapshot,
	udFun,
	sameFun,
	isNvl,
	showLog
} from './../Utils';

export default class Emitter {

	constructor(devLog = udFun, errLog = udFun) {
		this._key = getUniIndex();

		this._core = new EventEmitter();
		this._core.setMaxListeners(Infinity);
		this._destroyed = false;

		this.devLog = devLog;
		this.errLog = errLog;
	}

	_onAndOnce(name, callback, once) {
		if (this._destroyed) {
			this.errLog(`can't run 'on/once' event='${name}' after emitter=${this._key} destroy.`);
			return udFun;
		}

		if (isNvl(name)) {
			return udFun;
		}

		this.devLog(`emitter=${this._key} listen in '${name}'${once ? ' once' : ''}.`);

		let hasOff = false;
		let off = () => {
			if (hasOff || this._destroyed) {
				return;
			}
			this.devLog(`emitter=${this._key} removeListener '${name}'`);
			this._core.removeListener(name, callback);
		}
		this._core[once ? 'once' : 'on'](name, callback);

		return off;
	}

	on(name, callback) {
		return this._onAndOnce(name, callback, false);
	}

	once(name, callback) {
		return this._onAndOnce(name, callback, true);
	}

	emit(name, ...args) {
		if (this._destroyed) {
			this.errLog(`can't run 'emit' event='${name}' after emitter=${this._key} destroy.`);
			return;
		}

		if (isNvl(name)) {
			return;
		}

		// this.devLog(`emitter=${this._key} emit '${name}'`);
		this._core.emit(name, ...args);
	}

	destroy() {
		if (this._destroyed) {
			return;
		}

		this.emit('$$destroy:emitter', this._key);
		// this.devLog(`emitter=${this._key} destroyed.`);
		this._core.removeAllListeners();
		
		this._destroyed = true;	
		this._core = null;
		this._key = null;
	}
}
