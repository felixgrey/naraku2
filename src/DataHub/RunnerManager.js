import {
	isNvl,
	getUniIndex,
	createDestroyedErrorLog,
	udFun
} from './../Utils';

import Component from './Component';

const publicMethods = [
	'hasRunner',
	'unRegister',
	'register',
	'run'
];

const {
	publicMethod
} = Component;

export default class RunnerManager extends Component {

	afterCreate() {
		this._runner = {};
	}

	beforeDestroy() {
		this._runner = null;
	}

	@publicMethod
	hasRunner(name) {
		if (isNvl(name)) {
			return false;
		}

		return !!this._runner[name];
	}

	@publicMethod
	unRegister(name) {
		if (isNvl(name)) {
			return;
		}

		delete this._runner[name];
	}

	@publicMethod
	register(name, callback) {
		if (isNvl(name)) {
			return;
		}

		if (this._runner[name]) {
			this.errLog(`runner ${name} has existed.`);
			return;
		}

		this._runner[name] = callback;
	}

	@publicMethod
	run(name, ...args) {
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
		this._emitter.emit(`$$destroy:${this._clazz}=${this._key}`);

		this._runner = null;

		this._destroyed = true;

		this._dh = null;
		this._dhc = null;
		this._emitter = null;

		this.devLog = null;
		this.errLog = null;

		this._key = null;
	}
}

RunnerManager.publicMethods = publicMethods;