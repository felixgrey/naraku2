var assert = require("assert");

const Utils = require('../lib/Utils/index.js');

// console.log(assert)

const Emitter = require('../lib/DataHub/Emitter.js').default;

const {
	createLog,
	udFun,
	isNvl,
	getLogInfo,
	setLogHandle,
	createUid,
	setPreLog,
	getUniIndex
} = Utils;

const Component = require('../lib/DataHub/Component.js').default;

setPreLog('test-');

exports.Container = class Container {
	constructor() {
		this._key = getUniIndex();
		this._clazz = this.constructor.name;
		this._logName = `${this._clazz}=${this._key}`;
		this._devMode = true;
		this._destroyed = false;
		this._name = null;
		this.devLog = createLog('Container','log');
		this.destroyedErrorLog = this.errLog = createLog('Container','error');
		this._store = this._dh = this._dhc = this;
		this._emitter =  new Emitter(this.devLog, this.errLog, true);
		this._runner = {}
	}
	
	destroy() {
		this._emitter.emit(`$$destroy:${this._logName}`);
	}
} 

const IGNORE_TEST = exports.IGNORE_TEST = createUid('IGNORE_TEST-');

let lastRun = [];
let lastRunErr = [];
setLogHandle((logArray) => {
	// console.log('logArray', logArray);
	if ((logArray[1] || '').indexOf(`#run:`) === 0) {
		lastRun = logArray
	}
	
	if ((logArray[1] || '').indexOf(`#runErr:`) === 0) {
		lastRunErr = logArray
	}
})

var equalRunLog = exports.equalRunLog = function(result, args, trueResult) {
	// console.log('lastRun', lastRun)
	assert.deepStrictEqual(lastRun[2], args);
	assert.deepStrictEqual(result, trueResult);
}

var equalErrLog = exports.equalErrLog = function(result, args, desc) {
	// console.log('lastRun', lastRun)
	assert.deepStrictEqual(lastRunErr[2], args);
	assert.deepStrictEqual(lastRunErr[3], desc);
}

var equalLog = exports.equalLog = function(...args) {
	for (let i = 0 ; i < args.length; i++) {
		if (args[i] === IGNORE_TEST) {
			continue;
		}
		assert.deepStrictEqual(getLogInfo()[i], args[i]);
	}
}

var equalAssert = exports.equalAssert = function(a, b) {
	assert.deepStrictEqual(a, b);
}

var createAsyncEqualAssert = exports.createAsyncEqualAssert = function(showLog = true) {
	let promise = Promise.resolve();
	
	return function(name, callback = udFun, timeout = null) {	
		promise = promise.then(() => {
			if (showLog) {
				if (!isNvl(timeout)) {
					console.log(`${timeout}毫秒后执行测试'${name}'`);
				} else {
					console.log(`执行测试'${name}'`);
				}
			}
			
			return new Promise((resolve) => {
				let next = function(a, b){
					if (!arguments.length) {
						resolve();
						return;
					}
					
					equalAssert(name, a, b);
					resolve();
				}
				
				let next2 = function(...args){
					if (!arguments.length) {
						resolve();
						return;
					}
					
					equalLog(...args);
					resolve();
				}
				
				let next3 = function(timeout) {
					if (!arguments.length) {
						resolve();
						return;
					}
					
					setTimeout(() => {
						resolve();
					}, timeout);
				}
				
				if (!timeout) {
					callback(next, next2, next3);
					return;
				}
				
				setTimeout(() => {
					callback(next, next2, next3);
				}, timeout);
			})
		});
	}
}
