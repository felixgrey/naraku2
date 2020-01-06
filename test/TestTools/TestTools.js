const assert = require("assert");

const UnionModule = require(`../../lib/Common/Union.js`);
const Union = UnionModule.default;
UnionModule.setDevMode(true);

const Utils = require('../../lib/Utils/index.js');
const Container = require(`../../lib/DataHub/Container.js`).default;
const Emitter = require('../../lib/Common/Emitter.js').default;

const {
	createLog,
	udFun,
	isNvl,
	getLogInfo,
	setLogHandle,
	createUid,
	setPreLog,
} = Utils;

setPreLog('test-');

let lastEmitter
exports.getUnion = function() {
	lastEmitter && lastEmitter.destroy();
	
	const union = new Union({
		devMode: true,
		devLog: Utils.createLog('Tester', 'log'),
		errLog: Utils.createLog('Tester', 'error'),
	});
	lastEmitter = new Emitter(union);
	
	return union;
}

const IGNORE_TEST = exports.IGNORE_TEST = createUid('IGNORE_TEST-');

let lastRun = null;
let lastRunErr = null;
setLogHandle((logArray) => {
	// console.log('logArray', logArray);
	if ((logArray[1] || '').indexOf(`#run:`) === 0) {
		lastRun = logArray
	}
	
	if ((logArray[1] || '').indexOf(`#runErr:`) === 0) {
		lastRunErr = logArray
		lastRun = null
	}
})

var equalRunLog = exports.equalRunLog = function(result, trueResult) {
	assert.deepStrictEqual(lastRun[3], trueResult);
}

var equalErrLog = exports.equalErrLog = function(result,  desc) {
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
