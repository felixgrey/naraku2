const Utils = require('../../lib/Utils/index.js');
const Emitter = require('../../lib/DataHub/Emitter.js').default;

const {
	createLog,
	udFun
} = Utils;

const {
	equalAssert,
	equalLog,
	createAsyncEqualAssert
} = require('./../TestTools.js');

console.log('--------- test Emitter start ---------');

let emitterDevLogger = createLog('TestEmitter', 'log', true);
let emitterErrLogger = createLog('TestEmitter', 'error', true);

let testEmitter = new Emitter(emitterDevLogger, emitterDevLogger);
let testEmitterKey = testEmitter._key;
testEmitter.emit('event1', 'msg1');
equalLog(`【TestEmitter.Emitter=${testEmitterKey}-log】:`,`emit 'event1'`);

let msg = Date.now();
testEmitter.on('now', (result) => {
	equalLog(`【TestEmitter.Emitter=${testEmitterKey}-log】:`, `emit 'now'`);
});
equalLog(`【TestEmitter.Emitter=${testEmitterKey}-log】:`,`listen in 'now'.`);
testEmitter.emit('now', msg);

testEmitter.on('afterDestroy', udFun);
testEmitter.destroy();

testEmitter.emit('afterDestroy', msg);
equalLog(`【after-dstroyed-error】:`,`can't run 【Emitter=${testEmitterKey}】=>【emit@[]】 after it is destroyed.`);

testEmitter.on('afterDestroy', udFun);
equalLog(`【after-dstroyed-error】:`,`can't run 【Emitter=${testEmitterKey}】=>【on@[]】 after it is destroyed.`);

let testEmitter2 = new Emitter(emitterDevLogger, emitterDevLogger);
let testEmitter2Key = testEmitter2._key;

testEmitter2.once('args', () => {
	equalLog(`【TestEmitter.Emitter=${testEmitter2Key}-log】:`, `emit 'args'`, `argsLength=3`);
});

testEmitter2.emit('args', 'a', 'b', 'c');

testEmitter2.once('args', () => {
	equalLog(`【TestEmitter.Emitter=${testEmitter2Key}-log】:`, `emit 'args'`, `argsLength=4`);
});
testEmitter2.emit('args', 1,2,3,4);

console.log('--------- test Emitter end ---------');