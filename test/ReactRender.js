const Utils = require('./../lib/Utils/index.js');

function consoleRender(element, context, parentElement) {
	
	if (Utils.isNvl(element)) {
		return;
	}
	
	if (element.isElement) {
		console.log('>>>>>>>> renderElement');
		element.moment(context);
		if (parentElement) {
			const _componentWillUnMount = parentElement.componentWillUnMount;
			
			parentElement.componentWillUnMount = function() {
				element.unmoment();
				_componentWillUnMount && _componentWillUnMount.bind(this)();
			}
		}
		return;
	}
	
	console.log('>>>>>>>> consoleOutput:', element);
}

function createElement(Component, props = {}) {
	
	let component = null;
	
	function moment(context) {
		
		if (Utils.isNvl(context)) {
			context = undefined;
		}
		
		if (typeof Component !== 'function') {
			return;
		}

		component = new Component(props, context);

		component.props = props;
		component.context = context;
		
		component.render = component.render || Utils.udFun;
		// console.log('--------------------------', component.render === Utils.udFun);
		component.getChildContext = component.getChildContext || Utils.sameFun;

		component.forceUpdate = () => {
			console.log('>>>>>>>> forceUpdate:', component.props, component.context);
			component.componentWillUpdate && component.componentWillUpdate();
			consoleRender(component.render(), component.getChildContext(component.context), this);
			component.componentDidUpdate  && component.componentDidUpdate();
		}
		
		component.setState = (v) => {
			component.state = Object.assign({}, component.state, v);
			component.forceUpdate();
		}
		
		component.componentWillMount && component.componentWillMount();
		consoleRender(component.render(), component.getChildContext(component.context), this);
		component.componentDidMount && component.componentDidMount();
	}

	function unmoment() {
		component && component.componentWillUnMount && component.componentWillUnMount();
	}
	
	return {
		isElement: true,
		moment,
		unmoment
	};
};

exports.createElement = createElement;
exports.consoleRender = consoleRender;