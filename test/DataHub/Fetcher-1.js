var assert = require("assert");

const Utils = require('../../lib/Utils/index.js');
const Fetcher = require('../../lib/DataHub/Fetcher.js');


console.log('--------- test Fetcher start ---------');
const {
	NOT_INIT_FETCHER,
	NOT_ADD_FETCH,
	FETCHING,
	ABORT_REQUEST,
	addFetcher,
	getFetcher,
	initFetcher,
	stopFetchData,
	fetchData,
	setDevMode,
} = Fetcher;

setDevMode(true);

// ---------------------------------------------------- //
// let fetchPrimise;
// initFetcher(({onStop, setResult}) => {
// 	onStop(() => {});
// 	setTimeout(() => {
// 		setResult(123456);
// 	}, 40)
	
// });

// fetchPrimise = fetchData({url: '123'}, {}, {}, '111111111')
// .then(result => {
// 	console.log(result);
// })
// .catch(err => {
// 	console.log(err === ABORT_REQUEST, ABORT_REQUEST);
// });

// setTimeout(() => {
// 	stopFetchData('111111111');
// })
// ---------------------------------------------------- //

assert.strictEqual(getFetcher('test000'), undefined);

addFetcher('test000', 'url123', 'post', {asdf: 'hjkl'});

assert.strictEqual(typeof getFetcher('test000'), 'object');
assert.strictEqual(getFetcher('test000').method, 'post');
assert.strictEqual(getFetcher('test000').extend.asdf, 'hjkl');
assert.strictEqual(getFetcher('test000').url, 'url123');

const fetchList = [];
let fetchPrimise;

fetchPrimise = fetchData('test111').catch(err => {
	assert.strictEqual(err, NOT_INIT_FETCHER);
});
fetchList.push(fetchPrimise);

let submitData1 = {};
const stopKey1 = Utils.createUid();

initFetcher(function (arg) {
		const {
			url,
			method,
			data,
			dataInfo,
			setResult,
			setError,
			onStop,
			stopKey,
			extend,
		} = arg;
		
				
		assert.strictEqual(url, 'url123');
		assert.strictEqual(method, 'post');
		assert.strictEqual(JSON.stringify(data), JSON.stringify(submitData1));
		assert.strictEqual(extend.asdf, 'hjkl');
		
		if (dataInfo.hasOwnProperty('wait')) {
			assert.strictEqual(stopKey, stopKey1);
			
			setTimeout(() => {
				setResult([1, 2, 3, 4]);
			}, dataInfo.wait);		
		} else if (dataInfo.errorMsg){
			setError(dataInfo.errorMsg);
		} else {
			setResult('1234');
		}
		
		onStop( () => {
			console.log('run stop callback');
		})

		// assert.strictEqual(dataInfo.info, 'data-info');
		
});

fetchPrimise = fetchData('test111').catch(err => {
	assert.strictEqual(err, NOT_ADD_FETCH);
});
fetchList.push(fetchPrimise);

console.log('stopKey:', stopKey1);

fetchPrimise = fetchData('test000', submitData1, {wait: 3000}, stopKey1)
	.then(data => {
		console.log('test000 result', data);
	})
	.catch(err => {
		console.log('test000 err', err);
});
fetchList.push(fetchPrimise);

fetchPrimise = fetchData('test000', submitData1).catch(err => {
	assert.strictEqual(err,  FETCHING);
});
fetchList.push(fetchPrimise);

fetchPrimise = new Promise(function(resolve, reject) {
	setTimeout(() => {
		stopFetchData(stopKey1);
		resolve();
	}, 1500);
});
fetchList.push(fetchPrimise);

fetchPrimise = fetchPrimise.then(function() {
	
	fetchPrimise = fetchData('test000', submitData1).then(data => {
		console.log('test000 result2 ', data);
		assert.strictEqual(data, '1234');
	})
	fetchList.push(fetchPrimise);
});
fetchList.push(fetchPrimise);

fetchPrimise = fetchPrimise.then(function() {
	fetchPrimise = fetchData('test000', submitData1, {errorMsg: '错误的1234'}).catch(err => {
		console.log('test000 error ', err);
		assert.strictEqual(err, '错误的1234');
	})
	fetchList.push(fetchPrimise);
});
fetchList.push(fetchPrimise);


Promise.all(fetchList).then(a => {
	console.log('--------- test Fetcher end---------');
});



