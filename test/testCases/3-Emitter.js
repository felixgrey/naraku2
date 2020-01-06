const Utils = require('./../../lib/Utils/index.js');

const {
	equalAssert,
	equalLog,
	equalRunLog,
	equalErrLog,
	createAsyncEqualAssert,
	IGNORE_TEST,
} = require('./../TestTools/TestTools.js');
// require('./../TestTools/Init-Fetcher0.js');

// ----------------------------------------------------------- //
const Union = require(`../../lib/Common/Union.js`).default;
const Emitter = require(`../../lib/Common/Emitter.js`).default;
// ----------------------------------------------------------- //

const union = new Union({
	devMode: true,
	devLog: Utils.createLog('Tester', 'log'),
	errLog: Utils.createLog('Tester', 'error'),
});

let emitter = new Emitter(union);
emitter.name = 'testEmitterName'
emitter.destroy();

emitter = new Emitter(union);

equalRunLog(emitter.emit('event1'));
equalRunLog(emitter.emit('event1', 1,2,3));

let off1 = emitter.on('event1', (arg1, arg2, arg3) => {
	console.log('run event1 callback')
	equalAssert(arg1, 1);
	equalAssert(arg2, 2);
	equalAssert(arg3, 3);
});

emitter.once('event1', (arg1, arg2, arg3) => {
	console.log('run event1 callback once')
	equalAssert(arg1, 1);
	equalAssert(arg2, 2);
	equalAssert(arg3, 3);
});

equalRunLog(emitter.emit('event1', 1,2,3));
equalRunLog(emitter.emit('event1', 1,2,3));

off1();

equalRunLog(emitter.emit('event1', 1,2,3));

off1();