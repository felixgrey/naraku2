import {
	createLog,
	isBlank,
} from './../Utils';

import Tree from './Tree.js';
import DataHub from './../DataHub/DataHub';

import LifeCycle from './../Common/LifeCycle';

const {
	publicMethod
} = LifeCycle;

export default class ViewContext extends LifeCycle {

	afterCreate(dhConfig = {}) {
		this._tree = new Tree(this.devLog, this.errLog, this._devMode);
		this._dh = new DataHub(dhConfig, this.devLog, this.errLog, this._devMode);
		this.extendData = {};
	}

	beforeDestroy() {
		this._tree.destroy();
		this._tree = null;

		this._dh.destroy();
		this._dh = null;

		this.extendData = null;
	}

	@publicMethod
	getController() {
		return this._dh.getController();
	}

	@publicMethod
	getDataHub() {
		return this._dh;
	}

	@publicMethod
	createNode(...args) {
		this._tree.createNode(...args);
	}

	@publicMethod
	isWillRefresh() {
		return this._dh.getController().isWillRefresh();
	}

	@publicMethod
	watch(callback) {
		this._dh.getController().watch(callback);
	}

	@publicMethod
	removeNode(...args) {
		this._tree.removeNode(...args);
	}

	@publicMethod
	getRoot(...args) {
		return this._tree.getRoot(...args);
	}

	@publicMethod
	setParent(...args) {
		this._tree.setParent(...args);
	}

}

ViewContext.$loggerByParam = true;
