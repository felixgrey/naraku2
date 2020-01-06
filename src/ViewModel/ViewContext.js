
import Tree from './Tree.js';
import DataHub from '../DataHub/DataHub';
import Controller from '../DataHub/Controller';
import Container from '../DataHub/Container';

export default class ViewContext extends Container {
	
  initialization (...args) {
		super.initialization(...args);
		
		const [dhConfig] = args;
		
    this.tree = new Tree(this.union);
    this.dataHub = new DataHub(dhConfig, this.union);
    this.dataHubController = this.dataHub.getController();

    this.publicMethods(Tree.publicMethods, 'tree');
    this.publicMethods(Controller.publicMethods, 'dataHubController');
  }
	
	bindContainer(instance) {
		super.bindContainer(instance);
		
		instance.dataHub = this.dataHub;
		instance.dataHubController = this.dataHubController;
		instance.viewContext = this;
	}

  destruction () {
		super.destruction();
	
    this.tree.destroy();
    this.tree = null;

    this.dataHub.destroy();
    this.dataHub = null;
    this.dataHubController = null;

    this.extendData = null;
  }
}
