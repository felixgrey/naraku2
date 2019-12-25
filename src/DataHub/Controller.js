import {
	getUniIndex,
	udFun,
	isNvl,
	getDeepValue,
	createUid,
	createDstroyedErrorLog
} from './../Utils';

import {
	NOt_INIT_FETCHER,
	NOt_ADD_FETCH,
	FETCHING,
	stopFetchData,
	fetchData,
} from './Fetcher';

import {
	dataOpMethods
} from './DataHub';

const controllerOpMethods = [
	'when', 'whenAll', 'on', 'once', 'emit',
	'first', 'getValue', 'clear',
	'isLoading', 'isLocked', 'register', 'run',
	'getSwitchStatus', 'turnOn', 'turnOff',
	'destroy',
];

const controllerOpMethods2 = [
	'stopByName', 'pageTo', 'changePageSize',
	'getPageInfo', 'fetch', 'watch', 'createController',
];

let refreshRate = 40;

function setRefreshRate(value) {
	refreshRate = +value;
}

// console.log(dataOpMethods);


export default class Controller {

	constructor(dh) {
		this._key = getUniIndex();

		this._dh = dh;
		this._emitter = dh._emitter;
		this._destroyed = false;
		this._fetchTimeouts = {};
		this._stopKeys = {};
		this._watchList = [];

		this._switchStatus = {};
		this._paginationData = {};
		this.publicFunction = {};

		this._offSet = new Set();

		this.dstroyedErrorLog = createDstroyedErrorLog('Controller', this._key);

		this.devLog = this._dh.devLog.createLog('Controller');
		this.errLog = this._dh.errLog.createLog('Controller');
		
		// console.log(dataOpMethods);

		for (let funName of dataOpMethods) {
			this.publicFunction[funName] = (...args) => {
				if (this._destroyed) {
					this.dstroyedErrorLog(funName, args);
					return [];
				}

				// this.devLog('publicFunction.' + funName + '@controller=' + this._key, args);

				return this._dh[funName](...args);
			}
		}

		for (let funName of controllerOpMethods) {
			this.publicFunction[funName] = (...args) => {
				if (this._destroyed) {
					this.dstroyedErrorLog(funName, args);
					return udFun;
				}

				// this.devLog('publicFunction.' + funName + '@controller=' + this._key, args);

				return this[funName](...args);
			}
		}

		for (let funName of controllerOpMethods2) {
			this.publicFunction[funName] = this[funName];
		}

		this.initWatch();
	}

	initWatch() {
		let watchChange = () => {
			clearTimeout(this.watchTimeoutIndex);
			this.watchTimeoutIndex = setTimeout(() => {
				this._watchList.forEach(fun => fun());
			}, refreshRate);
		}

		this.on('$$data', watchChange);
		this.on('$$status', watchChange);
	}
	
	register = () => {
		// TODO
	}
	
	run = () => {
		// TODO
	}

	// publicMethod
	stopByName = (dhName) => {
		if (this._destroyed) {
			this.dstroyedErrorLog('stopByName');
			return null;
		}
		
		// this.devLog('stopByName', dhName, this._stopKeys[dhName]);

		if (this._stopKeys[dhName]) {
			stopFetchData(this._stopKeys[dhName]);
			this._stopKeys[dhName] = null;
			if (this._paginationData[dhName]) {
				this._paginationData[dhName].stopFetch();
			}

			this._dh.setStatus(dhName, 'clearLoading');
		}
	}

	// publicMethod
	pageTo = (dhName, number) => {
		this.changePageInfo(dhName, number, null);
	}

	// publicMethod
	changePageSize = (dhName, pageSize) => {
		this.changePageInfo(dhName, null, pageSize);
	}

	// publicMethod
	getPageInfo = (dhName) => {
		if (!this._paginationData[dhName]) {
			return null;
		}
		return this._paginationData[dhName].getPaginationInfo(null);
	}

	// publicMethod
	changePageInfo(dhName, number = null, pageSize = null) {
		if (this._destroyed) {
			this.dstroyedErrorLog('pageTo');
			return;
		}

		if (!this._paginationData[dhName]) {
			this.errLog(`can't change pageInfo of '${dhName}' .`);
			return;
		}

		this._paginationData[dhName].changePageInfo(number, pageSize);
	}

	// publicMethod
	getSwitchStatus(dhName) {
		if (this._destroyed) {
			this.dstroyedErrorLog('changeSwitchStatus');
			return null;
		}

		if (isNvl(dhName)) {
			return null;
		}

		let switchStatusInfo = this._switchStatus[dhName];

		if (!switchStatusInfo) {
			return null;
		}

		return !switchStatusInfo.off;
	}

	// publicMethod
	turnOn = (dhName) => {
		if (this._destroyed) {
			this.dstroyedErrorLog('turnOn');
			return;
		}
		this._dh._configManager.turnOn(dhName);
	}

	// publicMethod
	turnOff = (dhName) => {
		if (this._destroyed) {
			this.dstroyedErrorLog('turnOn');
			return;
		}
		this._dh._configManager.turnOff(dhName);
	}

	// publicMethod
	fetch = (fetcher, data, stop) => {
		if (this._destroyed) {
			this.dstroyedErrorLog('fetch');
			return null;
		}

		let stopKey = createUid('stopFetchKey_');

		if (!isNvl(stop)) {
			let hasStop = false;
			let doStop = () => {
				if (hasStop) {
					return
				}
				hasStop = true;
				stopFetchData(stopKey);
			};

			if (typeof stop === 'function') {
				stop(doStop);
			} else {
				this.once(`$$data:${stop}`, doStop);
				this.once(`$$status:${stop}`, doStop);
			}
		}

		this.once('$$destroy:controller', (key) => {
			if (key === this._key) {
				stopFetchData(stopKey);
			}
		});

		return fetchData(fetcher, data, null, null, stopKey).then((result) => {
			if (this._destroyed) {
				return;
			}

			if (result !== undefined) {
				result = [].concat(result);
			}

			this._emitter.emit('$$data', {
				name: '$$fetch',
				value: result
			});

			return result;
		}).catch((err) => {
			if (this._destroyed) {
				return;
			}

			this._emitter.emit('$$data', {
				name: '$$fetchError',
				value: undefined
			});
		});
	}

	// publicMethod
	watch = (callback = udFun) => {
		if (this._destroyed) {
			this.dstroyedErrorLog('watch');
			return udFun;
		}

		callback();
		this._watchList.push(callback);

		return () => {
			for (let i = 0; i < this._watchList.length; i++) {
				if (this._watchList[i] === callback) {
					this._watchList[i].splice(i, 1);
					return;
				}
			}
		};
	}

	// publicMethod
	createController = () => {
		if (this._destroyed) {
			this.dstroyedErrorLog('createController');
			return null;
		}
		
		return new Controller(this._dh).publicFunction;
	}

	_anyStatus(names, status) {
		if (isNvl(names)) {
			return false;
		}

		names = [].concat(names);
		for (let _name of names) {
			if (this._dh.getStatus(_name) === status) {
				return true;
			}
		}

		return false;
	}

	// publicMethod
	isLoading = (names) => {
		if (this._destroyed) {
			this.dstroyedErrorLog('isLoading');
			return false;
		}
		
		return this._anyStatus(names, 'loading');
	}

	// publicMethod
	isLocked = (names) => {
		if (this._destroyed) {
			this.dstroyedErrorLog('isLocked');
			return false;
		}
		
		return this._anyStatus(names, 'locked');
	}

	fetchData(fetcher, dhName, data, clear = false, forceFetch = false, beforeFetch = udFun) {
		let returnResolve;
		let returnPromise = new Promise((_resolve) => {
			returnResolve = _resolve;
		});
		
		if (this._destroyed) {
			this.dstroyedErrorLog('fetchData');
			returnResolve();
			return returnPromise;
		}

		clearTimeout(this._fetchTimeouts[dhName]);

		this._fetchTimeouts[dhName] = setTimeout(() => {
			if (this._destroyed) {
				returnResolve();
				return;
			}
			
			if (clear) {
				this._dh.set(dhName, []);
				returnResolve();
				return;
			}
			
			if (forceFetch) {
				// this.devLog('forceFetch中断请求', dhName, data);
				this.stopByName(dhName);
			}
			
			if (this._dh.getStatus(dhName) === 'loading') {
				this.errLog(`can't fetchData ${dhName} when it is loading`);
				returnResolve();
				return;
			}
			
			const stopKey = this._stopKeys[dhName] = createUid('stopKey_');

			let pagePromise = Promise.resolve();
			let pagination = this._paginationData[dhName] || null;
			let offStop = udFun;
			if (pagination) {
				pagePromise = pagination.fetch(data);
				offStop = this.once('$$stopFetchData', (name) => {
					if (dhName === name) {
						pagination.stopFetch();
					}
				});
			}

			this._dh.setStatus(dhName, 'loading');
			beforeFetch();
			const dataPromise = fetchData(fetcher, data, {}, pagination, stopKey);
			
			Promise
				.all([dataPromise, pagePromise])
				.then(([resultData]) => {
					if (this._destroyed) {
						returnResolve();
						return;
					}

					this._dh.setStatus(dhName, 'clearLoading');
					this._dh.set(dhName, resultData);
				}).catch(err => {
					if (this._destroyed) {
						returnResolve();
						return;
					}
					
					this._dh.setError(dhName, err, []);
				}).finally(() => {
					if (this._destroyed) {
						returnResolve();
						return;
					}
					
					offStop();
					this._stopKeys[dhName] = null;
					returnResolve();
				});
		}, refreshRate);
		
		return returnPromise;
	}

	first(dhName, defaultValue = {}) {
		return this.getValue(dhName + '.0', defaultValue);
	}

	getValue(fullPath, defaultValue) {
		const [dhName, ...pathArr] = fullPath.split('.');
		return getDeepValue(this._dh.get(dhName), pathArr.join('.'), defaultValue);
	}

	emit(name, ...args) {
		return this._emitter.emit(name, ...args);
	}

	clear(name) {
		if (this._dh.hasData(name)) {
			this._dh.set(name, []);
		}
	}

	when(names, callback) {
		if (isNvl(names)) {
			return udFun;
		}

		let offList = [];

		names = [].concat(names);

		const checkReady = () => {
			if (this._destroyed || this._dh._destroyed) {
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
		};
		this._offSet.add(off);

		return off;
	}

	whenAll(names, callback) {
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

		const offFun = () => {
			if (this._destroyed || this._dh._destroyed) {
				return;
			}

			if (!offList) {
				return;
			}

			offList.forEach(off => off());
			offList = null;
			this._offSet.delete(offFun);
		}

		this._offSet.add(offFun);

		return offFun;
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

	on(name, callback) {
		return this._onAndOnce(name, callback, false);
	}

	once(name, callback) {
		return this._onAndOnce(name, callback, true);
	}

	destroy() {
		if (this._destroyed) {
			return;
		}

		// 取消将要进行的刷新
		clearTimeout(this.watchTimeoutIndex);

		// 取消将要进行的数据请求
		Object.values(this._fetchTimeouts).forEach(key => {
			clearTimeout(key);
		});

		// 中断进行中的数据请求
		Object.values(this._stopKeys).forEach(key => {
			if (key) {
				stopFetchData(key);
			}
		});

		// 发射销毁事件
		this._emitter.emit('$$destroy:controller', this._key);
		// this.devLog(`controller=${this._key} destroyed.`);

		// 在销毁事件之后解除监听
		Array.from(this._offSet.values()).forEach(fun => fun());

		// 释放资源
		this._destroyed = true;
		this._offSet = null;
		this._dh = null;
		this._emitter = null;
		this._switchStatus = null;
		this._paginationData = null;
		this._fetchTimeouts = null;
		this._stopKeys = null;
		this._watchList = null;
		this.devLog = null;
		this.errLog = null;
	}
}

Controller.setRefreshRate = setRefreshRate;

// console.log(dataOpMethods)
// const allPublicMethods = dataOpMethods.concat(controllerOpMethods).concat(controllerOpMethods2);

function getAllMethods() {
	return dataOpMethods.concat(controllerOpMethods).concat(controllerOpMethods2);
}

Controller.getAllMethods = getAllMethods;

export {
	setRefreshRate,
	getAllMethods
}
