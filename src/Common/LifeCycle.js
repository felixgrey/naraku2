import {
	getUniIndex,
	udFun,
	createLog,
	isNvl,
} from './../Utils';

// afterCreate beforeDestroy

function publicMethod(_prototype, name, descriptor) {
	const old = _prototype[name];

	if (!_prototype._publicMethods) {
		_prototype._publicMethods = [];
	}
	_prototype._publicMethods.push(name);

	descriptor.value = function(...args) {
		if (this._destroyed) {
			this.destroyedErrorLog && this.destroyedErrorLog(name, args);
			return udFun;
		}

		if (!this._ready) {
			this.notReadyErrorLog && this.notReadyErrorLog(name, args);
			return udFun;
		}

		const result = old.bind(this)(...args);

		let _result = result;
		if (result instanceof LifeCycle) {
			_result = '#LifeCycleInstance:' + result._logName;
		}

		this.devLog && this.devLog(`#run:${name}`, args, _result);

		return result;
	}
}

export default class LifeCycle {
	constructor(...args) {
		const _constructor = this.constructor;

		this._key = getUniIndex();
		this._clazz = _constructor.name;
		this._logName = `${this._clazz}=${this._key}`;
		this._destroyed = false;
		this._ready = true;

		this._devMode = !!args[args.length - 1];

		this.errLog = udFun;
		this.devLog = udFun;

		this._emitter = udFun;

		if (_constructor.$loggerByParam) {
			let arg_2 = args[args.length - 2];
			if (!isNvl(arg_2) && typeof arg_2.createLog === 'function') {
				this.errLog = arg_2.createLog(this._logName);
			}

			let arg_3 = args[args.length - 3];
			if (!isNvl(arg_3) && typeof arg_3.createLog === 'function') {
				this.devLog = arg_3.createLog(this._logName);
			}
		}

		this.methodErrLog = (name = '?', args = '', desc = 'err', msg = desc) => {
			if (this._devMode) {
				this.devLog(`#runErr:${name}`, args, desc);
			} else {
				this.errLog(msg);
			}
		}

		const notAbleErr = (name, args = [], type) => {
			if (this._devMode) {
				this.devLog(`#runErr:${name}`, args, type);
			} else {
				this.errLog(`can't run '${this._clazz}.${name}(${args.join(',')})' when ${type}.`);
			}
		}

		this.destroyedErrorLog = (name, args = []) => {
			notAbleErr(name, args = [], 'destroyed');
		};

		this.notReadyErrorLog = (name, args = []) => {
			notAbleErr(name, args = [], 'notReady');
		};

		if (this._initialization) {
			this._initialization(...args);
		}

		if (this.afterCreate) {
			this.afterCreate(...args);
		}

		this.devLog(`${this._logName} created.`);
	}

	afterCreate() {}

	beforeDestroy() {}

	destroy() {
		if (this._destroyed) {
			return;
		}

		this._emitter.emit(`$$destroy:${this._clazz}`, this._key, this._name);
		this._emitter.emit(`$$destroy:${this._clazz}=${this._key}`, this._name);

		if (!isNvl(this._name)) {
			this._emitter.emit(`$$destroy:${this._clazz}@${this._name}`, this._key);
			this._emitter.emit(`$$destroy:${this._clazz}@${this._name}=${this._key}`);
		}

		if (this.beforeDestroy) {
			this.beforeDestroy();
		}

		if (this._destruction) {
			this._destruction();
		}

		this._destroyed = true;
		this._ready = false;
		this._emitter = udFun;
		this._name = null;
		this._key = null;

		this.devLog(`${this._logName} destroyed.`);
	}
}

LifeCycle.publicMethod = publicMethod;
