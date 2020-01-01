import {
	createLog,
	isBlank,
	udFun,
} from './../Utils';

import LifeCycle from './../Common/LifeCycle';
import DataHub from './../DataHub/DataHub';
import Controller from './../DataHub/Controller';
import ViewContext from './ViewContext';

const {
	publicMethod
} = LifeCycle;

export default class ViewModel extends LifeCycle {

	_initialization(config = {}, dhOrCfg = {}) {
		this._showLog = false;
		this._config = config;
		this._parentKey = null;
		this._viewContext = null;
		this._changeHandle = udFun;
		this._moment = null;

		this._withStore = config.withStore || null;

		if (dhOrCfg instanceof DataHub) {
			this._dh = dhOrCfg;
		} else {
			this._dh = new DataHub(dhOrCfg, this.devLog, this.errLog, this._devMode);
		}

		this._gdhc.watch(() => {
			this._changeHandle();
		});

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
	getContextDataHub() {
		return this._viewContext;
	}

	@publicMethod
	getMyDataHub() {
		return this._dh;
	}

	@publicMethod
	showDevLog(flag) {
		this._showLog = flag;
	}

	_momentMethods = [
		'getContextDataHub',
		'getMyDataHub',
		'showDevLog',
	];

	@publicMethod
	getLifeCycleMethods() {
		return {
			viewKey: this._key,
			createHandle: (moment) => {
				if (this._destroyed) {
					return;
				}

				this._momentMethods.forEach(method => {
					moment[method] = (...args) => this[method](...args);
				});

				moment.viewModel = this;
				this._moment = moment;
			},
			destroyHandler: () => {
				if (this._destroyed) {
					return;
				}

				this._viewContext && this._viewContext.removeNode(this._viewKey);
				this.destroy();
			},
			onChange: (callback = udFun) => {
				if (this._destroyed) {
					return;
				}

				this._changeHandle = callback;
			},
			getMyDhController: () => {
				if (this._destroyed) {
					return udFun;
				}

				return this._dh.getController();
			},
			getModelInfo: () => {
				if (this._destroyed || !this._withStore || !this._viewContext) {
					return {};
				}

				const {
					get,
					getStatus
				} = this._viewContext.getController();

				return {
					data: get(this._withStore),
					status: getStatus(this._withStore),
				};
			},
			fromParent: (key, viewContext) => {
				if (this._destroyed) {
					return;
				}

				this._parentKey = key;
				this._viewContext = viewContext;

				viewContext.createNode(this._viewKey, this);

				viewContext.watch(() => {
					if (DataHub.isWillRefresh()) {
						return;
					}

					this._changeHandle();
				});
			}
		}
	}

	_destruction() {
		this._dh && this._dh.destroy();
		this._dh = null;

		this._gdhc.destroy();
		this._gdhc = null;

		this._viewContext = null;
		this._view = null;

		if (this._moment) {
			this._momentMethods.forEach(method => {
				moment[method] = null;
			});
			this._moment.viewModel = null;
			this._moment = null;
		}
	}

}

ViewModel.$loggerByParam = true;

ViewModel.createMainView = udFun;
ViewModel.createSubView = udFun;
