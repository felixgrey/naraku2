import {
	isNvl,
	getUniIndex
} from './../Utils';



export default class RunnerManager {
	constructor(dhc) {
		this._key = getUniIndex();
		
		this._controller = dhc;
		this._runner = {};
		this._destroyed = false;

		this._emitter = dhc._emitter;
		
		this.devLog = dhc.devLog.createLog('RunnerManager');
		this.errLog = dhc.errLog.createLog('RunnerManager');
		
		this.dstroyedErrorLog = createDestroyedErrorLog('RunnerManager', this._key);
	}

	hasRunner(name) {
		if (this._destroyed) {
			this.dstroyedErrorLog('hasRunner');
			return;
		}

		if (isNvl(name)) {
			return;
		}

		return !!this._runner[name];
	}

	cancel(name) {
		if (this._destroyed) {
			this.dstroyedErrorLog('cancel');
			return;
		}

		if (isNvl(name)) {
			return;
		}

		delete this._runner[name];
	}

	register(name, callback) {
		if (this._destroyed) {
			this.dstroyedErrorLog('register');
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
			this.dstroyedErrorLog('run');
			return;
		}

		if (isNvl(name)) {
			return;
		}

		if (!this._runner[name]) {
			this.errLog(`runner ${name} not existed.`);
			return;
		}

		this._emitter.emit('$$run', {
			name,
			args
		});

		return this._runner[name](...args);
	}

	destroy() {
		this._destroyed = true;
	}
}

RunnerManager.publicMethods = [
	'hasRunner',
	'cancel',
	'register',
	'run'
];
