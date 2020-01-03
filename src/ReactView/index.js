import ViewContext from '../ViewModel/ViewContext'
import ViewModel from '../ViewModel/ViewModel'

import {
  getUniIndex,
  createLog,
  isNvl,
  udFun
} from '../Utils'

let PropTypes = {}

export function setPropTypes (v) {
  PropTypes = v
}

export function viewMethod (_prototype, name, descriptor) {
  if (!_prototype._viewMethods) {
    _prototype._viewMethods = []
  }
  _prototype._viewMethods.push(name)

  return descriptor
}

export function createView (dhConfig = {}, _main = false) {
  return function (Component) {
    class ProxyComponent extends Component {
      constructor (props = {}, context = {}) {
        super(props, context)

        this._key = props.key
				this._viewType = Component.name;
        this._viewMethods = Component.prototype._viewMethods || []

        this._clazz = Component.name || 'ReactView'
        this._viewKey = getUniIndex()
        this._devMode = dhConfig.$devMode || false
        this._name = isNvl(props.myName) ? null : props.myName
        this._logName = `${this._clazz}${isNvl(this._name) ? '' : `@${this._name}`}=${this._viewKey}`

        this._parentKey = null
        this._viewContext = null
        this._rendered = false

        this.errLog = createLog(this._logName, 'error')

        if (_main) {
          this._parentKey = this._viewKey
          this._viewContext = new ViewContext(dhConfig, this.devLog, this.errLog, this._devMode)
          if (context.viewContext) {
            this.errLog('MainView can\'t be in MainView')
          }
        } else {
          this._viewContext = context.viewContext || null
          this._parentKey = context.parentKey || null
          if (context.viewContext) {
            this._devMode = context.viewContext._devMode || this._devMode
          }
        }
        
        this.errLog = createLog(this._logName, 'error')
        this.devLog = this._devMode ? createLog(this._logName, 'log') : udFun

        this._viewModel = new ViewModel(this._viewKey, this._viewType,{
          ...props
        }, this.devLog, this.errLog, this._devMode)

        this._viewModel.createHandle(this, 'view')

        if (_main) {
          this._viewModel.setMyDataHub(this._viewContext.getDataHub())
        } else {
          this._viewModel.setMyDataHub(dhConfig)
        }

        this._viewModel.fromParent(this._parentKey, this._viewContext)

        if (this._viewContext) {
          if (this._name) {
            this._viewMethods.forEach((_method) => {
              this._cc.register(`${this._name}.${_method}`, (...args) => this[_method](...args))
            })
          }
        }

        this.viewOnChange(() => {
          if (!this._rendered) {
            return
          }
          this.forceUpdate()
        })

        this.turnOn = this.viewTurnOn
        this.turnOff = this.viewTurnOff
        this.viewModel = this._viewModel

        const _getChildContext = this.getChildContext || function () {}
        this.getChildContext = function (...args) {
          if (this._viewContext) {
            this._viewContext.setParent(this._viewKey)
          }

          return {
            ..._getChildContext.bind(this)(...args),
            viewContext: this._viewContext,
            parentKey: this._viewKey
          }
        }

        const _componentDidMount = this.componentDidMount
        this.componentDidMount = function (...args) {
          _componentDidMount && _componentDidMount.bind(this)(...args)
          this._rendered = true
          this.devLog(`${this._logName} componentDidMount.`)
        }

        const _componentDidUpdate = this.componentDidUpdate
        this.componentDidUpdate = function (...args) {
          _componentDidUpdate && _componentDidUpdate.bind(this)(...args)
          this.devLog(`${this._logName} componentDidUpdate.`)
        }

        const _componentWillUnMount = this.componentWillUnMount
        this.componentWillUnMount = function (...args) {
          _componentWillUnMount && _componentWillUnMount.bind(this)(...args)

          this.viewDestroyHandle()

          if (_main) {
            this._viewContext.destroy()
          }

          this._cc && this._cc.destroy()
          this._cc = null

          this._viewContext = null
          this._viewKey = null

          this.devLog(`${this._logName} unmount.`)
        }

        this.afterCreateView && this.afterCreateView(props, context)

        this.devLog(`${this._logName} created.`)
      }
    }

    ProxyComponent.contextTypes = {
      viewContext: PropTypes.any,
      parentKey: PropTypes.any
    }

    ProxyComponent.childContextTypes = {
      viewContext: PropTypes.any,
      parentKey: PropTypes.any
    }

    return ProxyComponent
  }
}

export function createMainView (dhConfig) {
  return createView(dhConfig, true)
}

export function createSubView (dhConfig) {
  return createView(dhConfig, false)
}
