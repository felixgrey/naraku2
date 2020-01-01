const Utils = require('./../../lib/Utils/index.js');

const {
	equalAssert,
	equalLog,
	equalRunLog,
	equalErrLog,
	createAsyncEqualAssert,
	IGNORE_TEST,
	Container,
} = require('./../TestTools.js');
require('./Init-Fetcher0.js');

// ----------------------------------------------------------- //
const testName = 'Emitter';
const Component = require(`../../lib/DataHub/${testName}.js`).default;
// ----------------------------------------------------------- //

const devLog = Utils.createLog('Emitter','log');
const errLog = Utils.createLog('Emitter','error');

let component = new Component(devLog, errLog, true);

console.log(`\n--------- test ${testName} start ---------\n`);

console.log(`\n--- ${testName}.destroy() ---\n`);
component.emit('1111');
component.destroy();

component.emit('1111');

console.log(`\n--------- test ${testName} ---------\n`);

component = new Component(devLog, errLog, true);

equalRunLog(component.emit('event1'), ['event1']);
equalRunLog(component.emit('event1', 1,2,3), ['event1', 1,2,3]);

let off1 = component.on('event1', (arg1, arg2, arg3) => {
	console.log('run event1 callback')
	equalAssert(arg1, 1);
	equalAssert(arg2, 2);
	equalAssert(arg3, 3);
});

component.once('event1', (arg1, arg2, arg3) => {
	console.log('run event1 callback once')
	equalAssert(arg1, 1);
	equalAssert(arg2, 2);
	equalAssert(arg3, 3);
});

equalRunLog(component.emit('event1', 1,2,3), ['event1', 1,2,3]);
equalRunLog(component.emit('event1', 1,2,3), ['event1', 1,2,3]);

off1();

equalRunLog(component.emit('event1', 1,2,3), ['event1', 1,2,3]);

off1();

console.log(`\n--------- test ${testName} end   ---------\n`);