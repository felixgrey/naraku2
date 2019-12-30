import {
	getUniIndex,
	createUid,
	udFun,
	createLog,
	isNvl,
} from './../Utils';

import Emitter from './Emitter';

class Container {
	constructor(emitter = udFun, devLog = udFun, errLog = udFun, _devMode = false) {
		this._key = getUniIndex();
		this._clazz = this.constructor.name;
		this._logName = `${this._clazz}=${this._key}`;
		this._devMode = _devMode;
		this._destroyed = false;
		this._name = null;
		this.devLog = _devMode ? devLog.createLog(this._logName) : udFun;
		this.destroyedErrorLog = this.errLog = errLog.createLog(this._logName);
		this._store = this._dh = this._dhc = this;
		this._emitter = emitter;
	}

	destroy() {
		this._emitter.emit(`$$destroy:${this._logName}`);
	}
}

function publicMethod(_prototype, name, descriptor) {
	const old = _prototype[name];
	if (!_prototype._publicMethods) {
		_prototype._publicMethods = [];
	}
	_prototype._publicMethods.push(name);

	descriptor.value = function(...args) {
		if (this._destroyed) {
			this.destroyedErrorLog && this.destroyedErrorLog(name);
			return udFun;
		}

		const result = old.bind(this)(...args);

		this.devLog && this.devLog(`#run:${name}`, args, result);

		return result;
	}
}

export default class Component {

	constructor(...args) {
		this._key = getUniIndex();
		this._clazz = this.constructor.name;
		this._logName = `${this._clazz}=${this._key}`;
		this._destroyed = false;

		let container = args[0];
		let _devMode = false;
		if (args.length === 1) {
			_devMode = false;
		} else {
			_devMode = args[args.length - 1];
		}

		this._devMode = _devMode;
		this._dhc = container._dhc || null;
		this._dh = container._dh || null;
		this._store = container._store || null;
		this._emitter = container._emitter || udFun;

		this.devLog = _devMode ? container.devLog.createLog(this._logName) : udFun;
		this.errLog = container.errLog.createLog(this._logName);
		this.methodErrLog = (name, args, desc, msg) => {
			if (this.devLog && this.devLog !== udFun) {
				this.devLog(`#runErr:${name}`, args, desc);
			} else if (this.errLog) {
				this.errLog(msg);
			}
		}

		this.destroyedErrorLog = (name, args = []) => {
			if (this.devLog && this.devLog !== udFun) {
				this.devLog(`#runErr:${name}`, args, 'destroyed');
			} else if (this.errLog) {
				this.errLog(`can't run '${this._clazz}.${name}(${args.join(',')})' after destroyed.`);
			}
		}

		this._emitter.once(`$$destroy:Container=${container._key}`, () => {
			this.devLog && this.devLog(`Container=${container._key} destroyed => ${this._logName} destroyed .`);
			this.destroy();
		});

		this.afterCreate(...args);

		this.devLog(`publicMethods of ${this._clazz}`, this.constructor.prototype._publicMethods);
		this.devLog(`${this._logName} created.`);
	}

	afterCreate() {
		this.errLog(`must implement afterCreate.`);
	}

	beforeDestroy() {
		this.errLog(`must implement beforeDestroy.`);
	}

	destroy() {
		if (this._destroyed) {
			return;
		}

		this.devLog(`${this._logName} destroyed.`);

		this._emitter.emit(`$$destroy:${this._clazz}`, this._key, this._name);
		this._emitter.emit(`$$destroy:${this._clazz}=${this._key}`, this._name);

		if (!isNvl(this._name)) {
			this._emitter.emit(`$$destroy:${this._clazz}@${this._name}`, this._key);
			this._emitter.emit(`$$destroy:${this._clazz}@${this._name}=${this._key}`);
		}

		this.beforeDestroy();

		this._destroyed = true;

		this._dh = null;
		this._dhc = null;
		this._store = null;
		this._emitter = null;

		this.devLog = null;
		this.errLog = null;
		this.methodErrLog = null;

		this._name = null;
		this._key = null;
	}
}

Component.Container = Container;

Component.publicMethod = publicMethod;
