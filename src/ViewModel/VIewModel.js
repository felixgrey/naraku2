import {
	isNvl,
	udFun,
} from './../Utils';

import LifeCycle from './../Common/LifeCycle';
import DataHub from './../DataHub/DataHub';
import Controller from './../DataHub/Controller';
import ErrorType from '../Common/ErrorType';
import ViewContext from './ViewContext';

const {
	publicMethod
} = LifeCycle;

export default class ViewModel extends LifeCycle {

	initialization(viewProps = {}, dhConfig = null, viewContext = null) {
		this.viewProps = viewProps;
		this.changeHandle = udFun;
    this.data = {};

    // 初始化
		this.viewType = isNvl(viewProps.viewType) ? 'View' : viewProps.viewType;
		this.viewMethods = isNvl(viewProps.viewMethods) ? {} : viewProps.viewMethods;
		this.parentKey = isNvl(viewProps.parentKey) ? null : viewProps.parentKey;
		this.name = isNvl(viewProps.myName) ? null : viewProps.myName;
		this.withStore = isNvl(viewProps.withStore) ? null : viewProps.withStore;

		this.updateLogger();

		this.globalDataHubController = DataHub.createController();
		this.globalDataHubController.watch(() => {
      this.willRefresh();
			this.changeHandle();
		});

		Controller.publicMethods.forEach(method => {
			this[method] = udFun;
		});

		if (!(viewContext instanceof ViewContext)) {
			this.errLog(`${this.logName} not has ViewContext.`);
		} else {
			viewContext.createNode(this.key, this.viewType, this);
			this.viewContext = viewContext;

			this.contextController = viewContext.getController().createController();
			this.publicMethods(Controller.publicMethods, 'contextController');
			this.contextController.watch(() => {
				if (DataHub.isWillRefresh()) {
					return;
				}
        this.willRefresh();
				this.changeHandle();
			});

			if (!isNvl(this.name)) {
				for (let method in this.viewMethods) {
					this.contextController.register(method, this.viewMethods[method]);
				}
			}

      this.contextController.on('$$viewModelStatus',({key, value}) => {
        this.contextViewModelChanged(value, key);
      })

		}

		// 根视图
		if (this.viewContext && isNvl(dhConfig)) {
			this.dataHub = this.viewContext.getDataHub();
		} else {
			this.dataHub = new DataHub(dhConfig, this.union);
		}
	}

  willRefresh() {

  }

  contextViewModelChanged() {

  }

	destruction() {
		this.dataHub && this.dataHub.destroy();
		this.dataHub = null;

		this.globalDataHubController && this.globalDataHubController.destroy();
		this.globalDataHubController = null;

		this.viewContext && this.viewContext.removeNode(this.key);
		this.viewContext = null;

		this.contextController && this.contextController.destroy();
		this.contextController = null;

    this.data = null;
	}

	@publicMethod
	getParent() {
		if (!this.viewContext) {
			// this.devLog('getParent: no viewContext');
			return null;
		}

		const parentNode = this.viewContext.getParent(this.key);
		if (!parentNode) {
			return null;
		}

		return parentNode.payload;
	}

	@publicMethod
	getParentChain() {
		// this.devLog('getParentChain', this.key);
		if (!this.viewContext) {
			// this.devLog('getParentChain: no viewContext');
			return [];
		}
		return this.viewContext.getParentChain(this.key).map(node => node.payload);
	}

	@publicMethod
	getMyDataHub() {
		return this.dataHub;
	}

	@publicMethod
	setViewStatus(value) {
		Object.assign(this.data, value);
		this.contextController.emit('$$viewModelStatus', {
      key: this.key,
      value
    });
	}

	@publicMethod
	getViewStatus() {
		return {
			...this.data
		};
	}

	@publicMethod
	run(...args) {
		if (!this.viewContext) {
			this.methodErrLog('run', args, ErrorType.noViewContext);
			return;
		}

		return this.contextController.run(...args);
	}

	@publicMethod
	destroyHandle() {
		if (this.destroyed) {
			return;
		}

		this.viewContext && this.viewContext.removeNode(this.key);
		this.destroy();
	}

	onChange(callback = udFun) {
		if (this.destroyed) {
			return;
		}

		this.changeHandle = callback;
	}

}

export {
	ViewModel
}
