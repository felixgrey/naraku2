import {
	isNvl,
	udFun,
	getUniIndex
} from './../Utils';

export default class ListenerManager {
	constructor(dhc) {
		this._key = getUniIndex();

		this._controller = dhc;
		this._dh = dhc._dh;
		this._destroyed = false;

		this._offSet = new Set();

		this._emitter = dhc._emitter;
		
		this.devLog = dhc.devLog.createLog('ListenerManager');
		this.errLog = dhc.errLog.createLog('ListenerManager');
		
		this.dstroyedErrorLog = createDestroyedErrorLog('ListenerManager', this._key);
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

	when(names, callback) {
		if (this._destroyed) {
			this.dstroyedErrorLog('when');
			return udFun;
		}

		if (isNvl(names)) {
			return udFun;
		}

		let offList = [];

		names = [].concat(names);

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

				if (!this._dh.hasData(_name)) {
					return;
				} else {
					dataList.push(this._dh.get(_name));
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

	whenAll(names, callback) {
		if (this._destroyed) {
			this.dstroyedErrorLog('whenAll');
			return udFun;
		}

		if (isNvl(names)) {
			return udFun;
		}

		names = [].concat(names);

		let offList;

		const createCheckReady = (readyCallback = udFun) => {
			let readyCount = 0;

			return () => {
				readyCount++
				if (readyCount === names.length) {
					readyCallback(...names.map(_name => this._dh.get(_name)));
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

		if (names.filter(_name => this._dh.hasData(_name)).length === names.length) {
			callback(...names.map(_name => this._dh.get(_name)));
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

		Array.from(this._offSet.values()).forEach(fun => fun());
		this._offSet = null;

		this._destroyed = true;
	}
}

ListenerManager.publicMethods = [
	'on',
	'once',
	'when',
	'whenAll',
	'emit',
];
