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
		this._clazz = this.constructor.name;
		this._logName = `${this._clazz}=${this._key}`;
		this._destroyed = false;

		this._core = new EventEmitter();
		this._core.setMaxListeners(Infinity);

		this.devLog = _devMode ? devLog.createLog(this._logName) : udFun;
		this.errLog = errLog.createLog(this._logName);
		this.destroyedErrorLog = createDestroyedErrorLog(this._clazz, this._key);

		this.devLog(`${this._logName} created.`);
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

		this.devLog(`${this._logName} destroyed.`);

		this.emit(`$$destroy:${this._clazz}`, this._key);
		this.emit(`$$destroy:${this._clazz}=${this._key}`);

		this._core.removeAllListeners();

		this._destroyed = true;
		this._core = null;
		this._key = null;
	}
}
