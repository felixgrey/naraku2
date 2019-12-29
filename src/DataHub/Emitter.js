import {
	EventEmitter
} from 'events';

import {
	getUniIndex,
	createDestroyedErrorLog,
	udFun,
	isNvl,
} from './../Utils';

export default class Emitter {

	constructor(devLog = udFun, errLog = udFun, _devMode = false) {
		this._key = getUniIndex();

		this._core = new EventEmitter();
		this._core.setMaxListeners(Infinity);
		this._destroyed = false;

		this.devLog = _devMode ? devLog.createLog(`Emitter=${this._key}`) : udFun;
		this.errLog = errLog.createLog(`Emitter=${this._key}`);
		this.destroyedErrorLog = createDestroyedErrorLog('Emitter', this._key);

		this.devLog(`Emitter=${this._key} created.`);
	}

	_onAndOnce(name, callback, once) {
		if (this._destroyed) {
			this.destroyedErrorLog(once ? 'once' : 'on');
			return udFun;
		}

		if (isNvl(name)) {
			return udFun;
		}

		this.devLog(`listen in '${name}'${once ? ' once' : ''}.`);

		let hasOff = false;
		let off = () => {
			if (hasOff || this._destroyed) {
				return;
			}
			this.devLog(`removeListener '${name}'`);
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
			this.destroyedErrorLog(`emit`);
			return;
		}

		if (isNvl(name)) {
			return;
		}

		this.devLog(`emit '${name}'`, `argsLength=${args.length}`);
		this._core.emit(name, ...args);
	}

	destroy() {
		if (this._destroyed) {
			return;
		}

		this.emit('$$destroy:Emitter', this._key);
		this.devLog(`Emitter=${this._key} destroyed.`);
		this._core.removeAllListeners();

		this._destroyed = true;
		this._core = null;
		this._key = null;
	}
}
