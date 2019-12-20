var assert = require("assert");

const Utils = require('../../lib/Utils/index.js');

const Emitter = require('../../lib/DataHub/Emitter.js').default;

// assert.strictEqual(1, 1);

// console.log('Emitter',Emitter)

const {
	createLog,
	udFun
} = Utils;

console.log('--------- test Emitter start ---------');

let emitterDevLogger = createLog('TestEmitter', 'log', true);
let emitterErrLogger = createLog('TestEmitter', 'error', true);

let testEmitter = new Emitter();
let testEmitter2 = new Emitter();

testEmitter.devLog = emitterDevLogger;
testEmitter2.devLog = emitterDevLogger;

testEmitter.errLog = emitterErrLogger;
testEmitter2.errLog = emitterErrLogger;

testEmitter.emit('event1', 'msg1');
testEmitter2.emit('event2', 'msg');

let msg = Date.now();
testEmitter.on('now', (result) => {
	assert.strictEqual(result, msg);
});
testEmitter.emit('now', msg);

testEmitter.on('afterDestroy', udFun);

testEmitter.destroy();

testEmitter.emit('afterDestroy', msg);
testEmitter.on('afterDestroy', udFun);

testEmitter2.emit('testOff');
let off2 = testEmitter2.on('testOff', () => {
	console.log('听到testOff');
});

testEmitter2.emit('testOff');
testEmitter2.emit('testOff');
off2();
testEmitter2.emit('testOff');
off2();

testEmitter2.once('testOnce', () => {
	console.log('听到testOnce1');
});

testEmitter2.emit('testOnce');
testEmitter2.emit('testOnce');

off2 = testEmitter2.once('testOnce2', () => {
	console.log('不应该听到的 testOnce2');
});
off2();
testEmitter2.emit('testOnce2');

let args = [1,2,3,4];

testEmitter2.on('args', (...args) => {
	console.log('听到args:', args);
});
testEmitter2.emit('args', ...args);
testEmitter2.emit('args', 'a', 'b', 'c');
testEmitter2.emit('args', 7, 8, 9);

console.log('--------- test Emitter end ---------');