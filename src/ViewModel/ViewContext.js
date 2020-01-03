import {
  createLog,
  isBlank,
  udFun
} from '../Utils'

import Tree from './Tree.js'
import DataHub from '../DataHub/DataHub'
import Controller from '../DataHub/Controller'

import LifeCycle from '../Common/LifeCycle'

const {
  publicMethod
} = LifeCycle

export default class ViewContext extends LifeCycle {
  afterCreate (dhConfig = {}) {
    this._tree = new Tree(this.devLog, this.errLog, this._devMode)
    this._dh = new DataHub(dhConfig, this.devLog, this.errLog, this._devMode)
    this._dhc = this._dh.getController()
    this.extendData = {}

    this.publicMethods(Tree.publicMethods, '_tree')
    this.publicMethods(Controller.publicMethods, '_dhc')
  }

  beforeDestroy () {
    this._tree.destroy()
    this._tree = null

    this._dh.destroy()
    this._dh = null
    this._dhc = null

    this.extendData = null
  }
}

ViewContext.$loggerByParam = true
