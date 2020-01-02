import {
	createLog,
	isBlank,
} from './../Utils';

import LifeCycle from './../Common/LifeCycle';

const {
	publicMethod
} = LifeCycle;

export default class Tree extends LifeCycle {

	afterCreate() {
		this._root = null;
		this._parent = null;
		this._last = null;
		this._nameMap = {};
		this._keyMap = {};
	}

	beforeDestroy() {
		this._root = null;
		this._parent = null;
		this._last = null;
		this._nameMap = null;
		this._keyMap = null;
	}

	@publicMethod
	removeNode(key, _delete = true) {
		if (isBlank(key) || !this._keyMap[key]) {
			return;
		}

		const node = this._keyMap[key];

		node.children.forEach((node, index) => {
			this.removeNode(node.key, false);
		});
		
		const pChildren = (this._keyMap[node.parentKey] || {}).children || [];

		for (let i = 0; i < pChildren.length; i++) {
			if (pChildren[i].key === key) {
				pChildren[i] = null;
				break;
			}
		}

		delete this._keyMap[key];

		if (_delete) {
			Object.values(this._keyMap).forEach(_node => {
				_node.children = _node.children.filter(__node => __node !== null);
			});
		}
	}

	@publicMethod
	getNode(key) {
		if (isBlank(key)) {
			this.methodErrLog('getNode', [key], 'blankKey');
			return;
		}

		return this._keyMap[key];
	}

	@publicMethod
	getParentChain(key) {
		if (isBlank(key) || !this._keyMap[key]) {
			this.methodErrLog('getParentChain', [key], 'blankKey');
			return;
		}

		let nodes = [];

		let parentKey = this._keyMap[key].parentKey;
		while (parentKey) {
			let parentNode = this._keyMap[parentKey];
			nodes.push(parentNode);
			parentKey = parentNode.parentKey;
		}

		return nodes;
	}

	@publicMethod
	createNode(key, payload = null) {
		if (isBlank(key)) {
			this.methodErrLog(`createNode`, [key], `blankKey`);
			return;
		}

		if (this._keyMap[key]) {
			this.methodErrLog(`createNode`, [key], `duplicateKey`);
			return;
		}

		const node = {
			key,
			parentKey: null,
			payload,
			children: []
		};

		this._last = node;
		this._keyMap[key] = node;

		if (this._root === null) {
			this._root = node;
			this._parent = node;
		} else {
			node.parentKey = this._parent.key;
			this._parent.children.push(node);
		}
	}

	@publicMethod
	getRoot() {
		return this._root;
	}

	@publicMethod
	setParent(key) {
		if (isBlank(key) || !this._keyMap[key]) {
			this.methodErrLog(`setParent`, [key], `blankKey`);
			return;
		}
		this._parent = this._keyMap[key];
	}

}

Tree.$loggerByParam = true;
