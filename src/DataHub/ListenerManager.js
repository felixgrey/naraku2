import {
	getUniIndex,
	udFun,
	isNvl,
	getDeepValue,
	createDestroyedErrorLog,
} from './../Utils';

const publicMethods = [
	'on',
	'once',
	'when',
	'whenAll',
	'emit'
];

export default class ListenerManager {

	constructor(dhc, _devMode = false) {
		this._key = getUniIndex();
		this._destroyed = false;

		this._dhc = dhc;
		this._dh = dhc._dh;
		this._emitter = dhc._emitter;

		this._offSet = new Set();

		this.devLog = _devMode ? dhc.devLog.createLog(`ListenerManager=${this._key}`) : udFun;
		this.errLog = dhc.errLog.createLog(`ListenerManager=${this._key}`);
		this.destroyedErrorLog = createDestroyedErrorLog('', this._key);

		this._emitter.once(`$$destroy:Controller:${dhc._key}`, () => {
			this.devLog && this.devLog(`Controller destroyed .`);
			this.destroy();
		});

		this.devLog(`ListenerManager=${this._key} created.`);
	}

	_onAndOnce(name, callback, once) {
		if (this._destroyed) {
			this.dstroyedErrorLog('on or once');
			return udFun;
		}

		let _off = this._emitter[once ? 'once' : 'on'](name, callback);

		const off = () => {
			if (!this._offSet.has(off)) {
				return;
			}
			this._offSet.delete(off);

			_off();
		};
		this._offSet.add(off);

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
			this.dstroyedErrorLog('emit');
			return udFun;
		}

		return this._emitter.emit(name, ...args);
	}

	when(...args) {
		if (this._destroyed) {
			this.dstroyedErrorLog('when');
			return udFun;
		}

		let callback = args.pop();
		let names = args;

		if (!names.length) {
			return udFun;
		}

		let offList = [];

		const checkReady = () => {
			if (this._destroyed) {
				return;
			}

			const dataList = [];

			for (let _name of names) {
				if (isNvl(_name)) {
					dataList.push([]);
					continue;
				}

				this.devLog(`when `, _name, this._dh.getDataStore(_name).hasData());

				if (!this._dh.getDataStore(_name).hasData()) {
					return;
				} else {
					dataList.push(this._dh.getDataStore(_name).get());
				}
			}

			callback(...dataList);
		};

		names.forEach(_name => {
			let _off = this._emitter.on('$$data:' + _name, checkReady);
			offList.push(_off);
		});

		checkReady();

		const off = () => {
			if (!this._offSet.has(off)) {
				return;
			}
			this._offSet.delete(off);

			offList.forEach(fun => fun());
			offList = null;
		};

		this._offSet.add(off);

		return off;
	}

	whenAll(...args) {
		if (this._destroyed) {
			this.dstroyedErrorLog('whenAll');
			return udFun;
		}

		let callback = args.pop();
		let names = args;

		if (!names.length) {
			return udFun;
		}

		let offList;

		const createCheckReady = (readyCallback = udFun) => {
			let readyCount = 0;

			return () => {
				readyCount++
				if (readyCount === names.length) {
					readyCallback(...names.map(_name => this._dh.getDataStore(_name).get()));
				}
			}
		};

		let watchReady = () => {
			if (this._destroyed || this._dh._destroyed) {
				return;
			}

			offList = [];
			let checkReady = createCheckReady((...args) => {
				callback(...args);
				watchReady();
			});

			for (let _name of names) {
				let _off = this._emitter.once('$$data:' + _name, checkReady);
				offList.push(_off);
			}
		}

		watchReady();

		if (names.filter(_name => this._dh.getDataStore(_name).hasData()).length === names.length) {
			callback(...names.map(_name => this._dh.getDataStore(_name).get()));
		}

		const off = () => {
			if (this._destroyed) {
				return;
			}

			if (!this._offSet.has(off)) {
				return;
			}
			this._offSet.delete(off);

			offList.forEach(off => off());
			offList = null;
		}

		this._offSet.add(off);

		return off;
	}

	destroy() {
		if (this._destroyed) {
			return;
		}

		this.devLog(`ListenerManager=${this._key} destroyed.`);

		this._emitter.emit('$$destroy:ListenerManager', this._key);
		this._emitter.emit(`$$destroy:ListenerManager:${this._key}`);

		Array.from(this._offSet.values()).forEach(fun => fun());
		this._offSet = null;

		this._destroyed = true;

		this._value = null;
		this._dh = null;
		this._emitter = null;

		this.devLog = null;
		this.errLog = null;

		this._key = null;
	}
}

ListenerManager.publicMethods = publicMethods;
