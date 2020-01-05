import {
	createLog,
	isBlank,
  udFun,
} from './../Utils';

import LifeCycle from './../Common/LifeCycle';

const {
	publicMethod
} = LifeCycle;

const publicMethods = [
  'removeNode',
  'getNode',
  'getParent',
  'getParentChain',
  'createNode',
  'getRoot',
  'setParent'
];

export default class Tree extends LifeCycle {

	initialization() {
		this.root = null;
		this.parent = null;
		this.last = null;
		this.nameMap = {};
		this.keyMap = {};
	}

	destruction() {
		this.root = null;
		this.parent = null;
		this.last = null;
		this.nameMap = null;
		this.keyMap = null;
	}

	@publicMethod
	removeNode(key, deleteChild = true) {
		if (isBlank(key) || !this.keyMap[key]) {
			return;
		}

		const node = this.keyMap[key];

		node.children.forEach((node, index) => {
			this.removeNode(node.key, false);
		});

		const pChildren = (this.keyMap[node.parentKey] || {}).children || [];

		for (let i = 0; i < pChildren.length; i++) {
			if (pChildren[i].key === key) {
				pChildren[i] = null;
				break;
			}
		}

		delete this.keyMap[key];

		if (deleteChild) {
			Object.values(this.keyMap).forEach(node1 => {
				node1.children = node1.children.filter(node2 => node2 !== null);
			});
		}
	}

	@publicMethod
	getNode(key) {
		if (isBlank(key)) {
			return null;
		}

		return this.keyMap[key] || null;
	}

  @publicMethod
  getParent(key) {
		if (isBlank(key)) {
			return null;
		}

    if (!this.keyMap[key]) {
    	this.methodErrLog('getParent', [key], 'notExist');
    	return null;
    }

    let parentKey = this.keyMap[key].parentKey;
    return this.keyMap[parentKey] || null;
  }

	@publicMethod
	getParentChain(key) {
		if (isBlank(key)) {
      this.devLog('getParentChain blankKey')
			return [];
		}

		if (!this.keyMap[key]) {
			this.methodErrLog('getParentChain', [key], 'notExist');
			return [];
		}

		let nodes = [];

		let parentKey = this.keyMap[key].parentKey;
		while (parentKey) {
			let parentNode = this.keyMap[parentKey];
			nodes.push(parentNode);
			parentKey = parentNode.parentKey;
		}

		return nodes;
	}

	@publicMethod
	createNode(key, type = null,payload = null) {
		if (isBlank(key)) {
			this.methodErrLog(`createNode`, [key], `blankKey`);
			return;
		}

		if (this.keyMap[key]) {
			this.methodErrLog(`createNode`, [key], `duplicateKey`);
			return;
		}

		const node = {
			key,
      type,
			parentKey: null,
			payload,
			children: []
		};

		this.last = node;
		this.keyMap[key] = node;

		if (this.root === null) {
			this.root = node;
			this.parent = node;
		} else {
			node.parentKey = this.parent.key;
			this.parent.children.push(node);
		}
	}

	@publicMethod
	getRoot() {
		return this.root;
	}

	@publicMethod
	setParent(key) {
		if (isBlank(key) || !this.keyMap[key]) {
			this.methodErrLog(`setParent`, [key], `blankKey`);
			return;
		}
		this.parent = this.keyMap[key];
	}

}

Tree.publicMethods = publicMethods;
