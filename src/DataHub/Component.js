import LifeCycle from '../Common/LifeCycle';
import Emitter from '../Common/Emitter';

export default class Component extends LifeCycle {
	
	initialization(container) {
		this.containerDestroyOff = this.bindContainer(container);

		if (this.constructor.$showPublicMethods) {
			this.devLog(`publicMethods of ${this.clazz}`, this.constructor.prototype.$$publicMethods);
		}
	}
	
	bindContainer(container) {
		container.bindUnion(this, this.logName);
		
		return this.emitter.once(`$$destroy:${container.clazz}=${container.key}`, () => {
			this.devLog(`${container.clazz}=${container.key} destroyed => ${this.logName} destroyed .`);
			this.destroy();
		});
	}

	destruction() {
		this.containerDestroyOff();
		this.containerDestroyOff = null;
		
		this.dataHub = null;
		this.dataHubController = null;
		this.dataStore = null;
	}
}

Component.publicMethod = LifeCycle.publicMethod
