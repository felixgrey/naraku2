const Utils = require('./../../lib/Utils/index.js');

const {
	equalAssert,
	equalLog,
	equalRunLog,
	equalErrLog,
	createAsyncEqualAssert,
	IGNORE_TEST,
} = require('./../TestTools.js');

const {
	createElement,
	consoleRender,
} = require('./../ReactRender.js');

// ----------------------------------------------------------- //

const ReactView = require(`../../lib/ReactView/index.js`);

const {
	createView,
	createMainView,
	createSubView,
} = ReactView;
// ----------------------------------------------------------- //

console.log(`\n--------- test ReactView start   ---------\n`);

class SubComponent2 {

	render() {
		console.log(this._logName + '渲染'); 
		
		console.log(this._logName + '上下文', this.context);
		
		this.viewModel.getParentChain().map(node => node.payload._viewKey )
		
		console.log(this._logName + '父节点链', this.viewModel.getParentChain().map(node => node.payload._viewKey));
		
		return 123123123123;
	}
}

const ProxySubComponent2 = createSubView({
	$devMode: true
})(SubComponent2);

class SomeComponent{
	render() {
		return createElement(ProxySubComponent2, {myName:'最里面'});
	}
}

class SubComponent {
	
	render() {
		console.log('渲染', this._logName);
		
		console.log('上下文', this.context);
		
		return createElement(SomeComponent, {myName:'透过'});
	}
}



const ProxySubComponent = createSubView({
	$devMode: true
})(SubComponent);



class PageComponent {
	render() {
		console.log('渲染', this._logName);
		
		console.log('上下文', this.context);
		
		return createElement(ProxySubComponent, {myName:'中间'});
	}
	
	// componentDidMount() {
	// 	console.log('渲染完成BusinessPage', this.devLog); 
	// }
	
	// componentWillUnMount() {
	// 	console.log('将要销毁BusinessPage'); 
	// }
}


const ProxyPageComponent = createMainView({
	$devMode: true
})(PageComponent);

// console.log(ProxyPageComponent.prototype.render)

const page = createElement(ProxyPageComponent, {myName: '页面'})
consoleRender(page);

setTimeout(() => {
	page.unmoment();
}, 1000);


console.log(`\n--------- test ReactView end   ---------\n`);