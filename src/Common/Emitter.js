import {
	EventEmitter
} from 'events';

import {
	isNvl,
	udFun
} from './../Utils';

import LifeCycle from './LifeCycle';

const {
	publicMethod
} = LifeCycle;

export default class Emitter extends LifeCycle {

	initialization() {
		this.core = new EventEmitter();
		this.core.setMaxListeners(Infinity);
		this.emitter = this;
		this.union.emitter = this;
		
		this.updateLogger();
	}

	onAndOnce(name, callback, once) {
		if (isNvl(name)) {
			return udFun;
		}

		let off = () => {
			if (off.hasOff || this._destroyed) {
				return;
			}
			off.hasOff = true;
			this.devLog(`removeListener '${name}'`);
			this.core.removeListener(name, callback);
		};

		this.core[once ? 'once' : 'on'](name, callback);

		return off;
	}

	@publicMethod
	on(name, callback) {
		return this.onAndOnce(name, callback, false);
	}

	@publicMethod
	once(name, callback) {
		return this.onAndOnce(name, callback, true);
	}

	@publicMethod
	emit(name, ...args) {
		if (isNvl(name)) {
			return;
		}
		this.core.emit(name, ...args);
	}

	@publicMethod
	clear() {
		this.core.removeAllListeners();
	}

	destroy() {
		this.union.emitter = udFun;
		super.destroy();
		this.core.removeAllListeners();
		this.core = null;
	}
}

Emitter.$loggerByParam = true;
