import {
	createLog,
	isBlank,
	isNvl,
	udFun,
	sameFun,
	toCamel,
	toUnderline,
} from './../Utils';

import LifeCycle from './../Common/LifeCycle';
import DataHub from './../DataHub/DataHub';
import Controller from './../DataHub/Controller';
import ViewContext from './ViewContext';
import Tree from './Tree.js';

const {
	publicMethod
} = LifeCycle;

export default class ViewModel extends LifeCycle {

	_initialization(viewKey = null, props = {}) {
		this._viewKey = viewKey;
		this._props = props;
		this._parentKey = null;
		this._viewContext = null;
		this._changeHandle = udFun;
		this._moment = null;
		this._unmoment = udFun;
    this._viewModelProps = {};

		this._name = isNvl(props.myName) ? null : props.myName;

		this._withStore = props.withStore || null;

		this._gdhc = DataHub.createController();
		this._gdhc.watch(() => {
			this._changeHandle();
		});
    
    this.publicMethods(Controller.publicMethods, '_cc');
		this.publicMethods(Tree.publicMethods, '_viewContext');

	}


	@publicMethod
	setMyDataHub(cfgOrDh) {
		if (isNvl(cfgOrDh)) {
			return;
		}

		if (this._dh) {
			this.errLog(`dh existed.`);
			return;
		}

		if (cfgOrDh instanceof DataHub) {
			this._dh = cfgOrDh;
		} else {
			this._dh = new DataHub(cfgOrDh, this.devLog, this.errLog, this._devMode)
		}

		this._dh.getController().watch(() => {
			if (this._gdhc.isWillRefresh()) {
				return;
			}

			if (this._viewContext && this._viewContext.isWillRefresh()) {
				return;
			}

			this._changeHandle();
		});
	}


	@publicMethod
	getMyDataHub() {
		return this._dh;
	}

  @publicMethod
  setViewProps(value) {
    Object.assign(this._viewModelProps, value);
  }

  @publicMethod
  getViewProps() {
    return {
      ...this._viewModelProps
    };
  }

	_momentMethods = [
		'destroyHandle',
		'fromParent',
		'onChange',
		'turnOn',
		'turnOff',
    'run',
	];

	@publicMethod
	createHandle(moment, preText = '') {
		if (this._destroyed) {
			return;
		}

		let format = sameFun;
		if (preText.charAt(preText.length - 1) === '_') {
			format = (method) => toUnderline(preText + method);
		} else if (preText.length) {
			format = (method) => toCamel(preText + '_' + method);
		}

		this._momentMethods.forEach(method => {
			moment[format(method)] = (...args) => this[method](...args);
		});
		moment[format('viewModel')] = this;
    moment._cc = udFun;

		this._moment = moment;

		this._unmoment = () => {
			this._momentMethods.forEach(method => {
				this._moment[format(method)] = null;
			});
			this._moment[format('viewModel')] = null;
      this._moment._cc = null;

			this._moment = null;
		}
	}

  @publicMethod
  run(...args) {
    if (!this._viewContext) {
      this.methodErrLog('run', args, 'noViewContext');
    	return;
    }

    return this._cc.run(...args);
  }

  @publicMethod
	destroyHandle() {
		if (this._destroyed) {
			return;
		}

		this._viewContext && this._viewContext.removeNode(this._viewKey);
		this.destroy();
	}

	onChange(callback = udFun) {
		if (this._destroyed) {
			return;
		}

		this._changeHandle = callback;
	}

	fromParent(key, viewContext) {
		if (this._destroyed || isNvl(key) || isNvl(viewContext)) {
			return;
		}

    if (!this._moment) {
      this.methodErrLog('fromParent', [], 'noMonent');
      return;
    }

		this._parentKey = key;
		this._viewContext = viewContext;

    this._cc = this._viewContext.getController().createController();
    this._moment._cc = this._cc;

		viewContext.createNode(this._viewKey, this);

		viewContext.watch(() => {
			if (DataHub.isWillRefresh()) {
				return;
			}

			this._changeHandle();
		});
	}

	_destruction() {
		this._dh && this._dh.destroy();
		this._dh = null;

		this._gdhc.destroy();
		this._gdhc = null;

		this._viewContext = null;
		this._view = null;

		this._unmoment();

    this._viewModelProps = null;
		this._props = null;

    this._cc && this._cc.destroy();
    this._cc = null;
	}

}

ViewModel.$loggerByParam = true;
