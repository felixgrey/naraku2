import {
	udFun,
	isNvl,
} from './../Utils';

import Component from './Component';

const publicMethods = [
	'on',
	'once',
	'when',
	'whenAll',
	'emit'
];

const {
	publicMethod
} = Component;

export default class ListenerManager extends Component {
	afterCreate(dhc) {
		this._offSet = new Set();
	}

	beforeDestroy() {
		Array.from(this._offSet.values()).forEach(fun => fun());
		this._offSet = null;
	}

	_onAndOnce(name, callback, once) {
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
		return this._emitter.emit(name, ...args);
	}

	@publicMethod
	when(...args) {
		let callback = args.pop();
		let names = args;

		if (!names.length) {
			return udFun;
		}

		let offList = [];

		const checkReady = () => {
			this.devLog(`when checkReady`);
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

		this.devLog(`when param : `, names);

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

	@publicMethod
	whenAll(...args) {
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
}

ListenerManager.publicMethods = publicMethods;
