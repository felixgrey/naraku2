import {
	isNvl,
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
    Object.keys(this._runner).forEach(name => {
      delete this._dh._runner[name];
    });
    this._runner = null;
	}

	@publicMethod
	hasRunner(name) {
		if (isNvl(name)) {
			return false;
		}

		return !!this._dh._runner[name];
	}

	@publicMethod
	unRegister(name) {
		if (isNvl(name)) {
			return;
		}

    if (!this._runner) {
      return;
    }

		delete this._runner[name];
    delete this._dh._runner[name];
	}

	@publicMethod
	register(name, callback) {
		if (isNvl(name)) {
			return;
		}

		if (this._dh._runner[name]) {
			this.errLog(`runner ${name} has existed.`);
			return;
		}

    this._runner[name] = true;
		this._dh._runner[name] = callback;
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

		return this._dh._runner[name](...args);
	}
}

RunnerManager.publicMethods = publicMethods;
