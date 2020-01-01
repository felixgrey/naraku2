import {
	EventEmitter
} from 'events';

import {
	getUniIndex,
	udFun,
	isNvl,
} from './../Utils';

import LifeCycle from './../Common/LifeCycle';

const {
	publicMethod
} = LifeCycle;

export default class Emitter extends LifeCycle {

	afterCreate() {
		this._core = new EventEmitter();
		this._core.setMaxListeners(Infinity);
	}

	beforeDestroy() {

	}

	_onAndOnce(name, callback, once) {
		if (isNvl(name)) {
			return udFun;
		}

		let off = () => {
			if (off.hasOff || this._destroyed) {
				return;
			}
			off.hasOff = true;
			this.devLog(`removeListener '${name}'`);
			this._core.removeListener(name, callback);
		};

		this._core[once ? 'once' : 'on'](name, callback);

		return off;
	}

	@publicMethod
	on(name, callback) {
		return this._onAndOnce(name, callback, false);
	}

	@publicMethod
	once(name, callback) {
		return this._onAndOnce(name, callback, true);
	}

	@publicMethod
	emit(name, ...args) {
		if (isNvl(name)) {
			return;
		}

		this._core.emit(name, ...args);
	}

	@publicMethod
	clear() {
		this._core.removeAllListeners();
	}

	destroy() {
		super.destroy();
		this._core.removeAllListeners();
		this._core = null;
	}
}

Emitter.$loggerByParam = true;
