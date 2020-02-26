import LifeCycle from './../Common/LifeCycle';
import Tree from './Tree.js';
import DataHub from '../DataHub/DataHub';
import Controller from '../DataHub/Controller';
import Container from '../DataHub/Container';

const {
  publicMethod
} = LifeCycle;

export default class ViewContext extends Container {

  initialization(...args) {
    super.initialization(...args);

    const [dhConfig] = args;
    this.dhConfig = dhConfig;

    this.tree = new Tree(this.union);
    this.dataHub = new DataHub(dhConfig, this.union);
    this.dataHubController = this.dataHub.getController();
    this.contextData = {};

    this.publicMethods(Tree.publicMethods, 'tree');
    this.publicMethods(Controller.publicMethods, 'dataHubController');
  }

  bindContainer(instance) {
    super.bindContainer(instance);

    instance.dataHub = this.dataHub;
    instance.dataHubController = this.dataHubController;
    instance.viewContext = this;
  }

  destruction() {
    super.destruction();

    this.tree.destroy();
    this.tree = null;

    this.dataHub.destroy();
    this.dataHub = null;
    this.dataHubController = null;

    this.contextData = null;
  }
}
