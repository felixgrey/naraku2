import {
	isNvl,
	getUniIndex,
	createDestroyedErrorLog,
	udFun
} from './../Utils';

const publicMethods = [
	'hasRunner',
	'unRegister',
	'register',
	'run'
];

export default class RunnerManager {
	constructor(dhc, _devMode = false) {
		this._key = getUniIndex();
		this._clazz = this.constructor.name;
		this._logName = `${this._clazz}=${this._key}`;
		this._destroyed = false;

		this._runner = {};

		this._dhc = dhc;
		this._emitter = dhc._emitter;

		this.devLog = _devMode ? dhc.devLog.createLog(this._logName) : udFun;
		this.errLog = dhc.errLog.createLog(this._logName);
		this.destroyedErrorLog = createDestroyedErrorLog(this._clazz, this._key);

		this._emitter.once(`$$destroy:Controller:${dhc._key}`, () => {
			this.devLog && this.devLog(`Controller destroyed => ${this._clazz} destroy .`);
			this.destroy();
		});

		this.devLog(`${this._logName} created.`);
	}

	hasRunner(name) {
		if (this._destroyed) {
			this.destroyedErrorLog('hasRunner');
			return false;
		}

		if (isNvl(name)) {
			return false;
		}

		return !!this._runner[name];
	}

	unRegister(name) {
		if (this._destroyed) {
			this.destroyedErrorLog('unRegister');
			return;
		}

		if (isNvl(name)) {
			return;
		}

		delete this._runner[name];
	}

	register(name, callback) {
		if (this._destroyed) {
			this.destroyedErrorLog('register');
			return;
		}

		if (isNvl(name)) {
			return;
		}

		if (this._runner[name]) {
			this.errLog(`runner ${name} has existed.`);
			return;
		}

		this._runner[name] = callback;
	}

	run(name, ...args) {
		if (this._destroyed) {
			this.destroyedErrorLog('run');
			return udFun;
		}

		if (isNvl(name)) {
			return udFun;
		}

		if (!this._runner[name]) {
			this.errLog(`runner ${name} not existed.`);
			return udFun;
		}

		this._emitter.emit('$$run', {
			controller: this._dhc._key,
			name,
			args
		});

		this._emitter.emit(`$$run:${name}`, {
			controller: this._dhc._key,
			args
		});

		return this._runner[name](...args);
	}

	destroy() {
		if (this._destroyed) {
			return;
		}

		this.devLog(`${this._logName} destroyed.`);

		this._emitter.emit(`$$destroy:${this._clazz}`, this._key);
		this._emitter.emit(`$$destroy:${this._clazz}:${this._key}`);

		this._runner = null;

		this._destroyed = true;

		this._dhc = null;
		this._emitter = null;

		this.devLog = null;
		this.errLog = null;

		this._key = null;
	}
}

RunnerManager.publicMethods = publicMethods;
