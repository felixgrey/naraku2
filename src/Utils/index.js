/*
	判断开发模式
*/
const isDev = process && process.env && process.env.NODE_ENV === 'development'

/*
	随机18位整数
*/
function getRandom () {
  return Math.random() * 10e18
}

/*
	uid前缀
*/
const uidSeed = getRandom()

/*
	创建一个uid
*/
function createUid (pre = '') {
  return `${pre}${uidSeed}-${getRandom()}-${getRandom()}`
}

let uniIndex = 1
/*
	创建一个统一计序列号
*/
function getUniIndex () {
  return uniIndex++
}

/**
	通用兜底空函数
*/
const udFun = function () {
  return udFun
}

const nextPms = () => Promise.resolve();
const fake = {
  // 数据
  $uniStringify: () => '{"$FAKE_RETURN": true}',
  $snapshot: () => ({
    $FAKE_RETURN: true
  }),
  // log
  createLog: () => udFun,
  // Promise
  then: nextPms,
  catch: nextPms,
  finally: nextPms
}

Object.values(fake).forEach((item) => {
  item.$FAKE_RETURN = true
})
Object.assign(udFun, fake)

/*
	返回输入值的通用空函数
*/
function sameFun (a) {
  return a
}

/*
	各种非空判断
*/
function isNvl (value) {
  return value === undefined || value === null;
}

function isEmpty (value) {
  return isNvl(value) || value === ''
}

function isBlank (value) {
  return isEmpty(value) || (`${value}`).trim() === ''
}

/*
 log
*/
let logPrinter = ((global || {}).console) || {
  warn: udFun,
  log: udFun,
  error: udFun
}

function setLogger (v) {
  logPrinter = v
}

let showLog = true
let preLog = 'naraku-'
let createLog = udFun
let logInfoArray = []

function setPreLog (text = '') {
  preLog = text
}

function logSwitch (flag) {
  showLog = flag
}

function getLogInfo () {
  return [].concat(logInfoArray)
}
let logHandle = udFun

function setLogHandle (v) {
  logHandle = v
}

if (isDev) {
  createLog = function (name = '', type = 'log') {
    if (typeof logPrinter[type] !== 'function') {
      showLog && logPrinter.error(`【createLog-error】：logPrinter.${type} not existed.`)
      return udFun
    }

    const logger = function logger (...args) {
      logInfoArray = [`【${preLog}${name}-${type}】:`, ...args]
      logInfoArray.logType = type
      logHandle(logInfoArray)
      showLog && logPrinter[type](...logInfoArray)
    }

    logger.createLog = function (name2 = '?') {
      return createLog(`${name}.${name2}`, type)
    }

    return logger
  }
}

/*
	根据路径获取对象值
*/
function getDeepValue (data, path = '', defValue) {
  if (isNvl(data)) {
    return defValue
  }

  if (typeof path === 'string') {
    path = path.replace(/\[\]/g, '.').split('.')
  }

  const field = path.shift().trim()

  if (isEmpty(field)) {
    return defValue
  }

  const value = data[field]

  if (isNvl(value)) {
    return defValue
  }

  if (!path.length) {
    return value
  }

  if (typeof value !== 'object' && path.length) {
    return defValue
  }

  return getDeepValue(value, path, defValue)
}

/*
	数据快照
*/
function snapshot (value) {
  if (isNvl(value)) {
    return value
  }

  if (typeof value.$snapshot === 'function') {
    return value.$snapshot()
  }

  if (typeof value !== 'object') {
    return value
  }

  try {
    value = JSON.parse(JSON.stringify(value))
  } catch (e) {
    showLog && console.error('【snapshot-error】：', e)
  }

  return value
}

/*
	数据的字符串表示
*/
function uniStringify (obj) {
  if (isNvl(obj)) {
    return null
  }

  if (typeof obj.$uniStringify === 'function') {
    return obj.$uniStringify()
  }

  if (typeof obj.toString === 'function') {
    return obj.toString()
  }

  let v = ''
  try {
    v = JSON.stringify(obj)
  } catch (e) {}

  return v
}

/*
 驼峰命名
 */
function toCamel (text = '') {
  return (`${text}`).replace(/_(\w)/g, (word, charcter, index) => {
    if (index === 0) {
      return word
    }
    return charcter.toUpperCase()
  })
}

/*
 下划线命名
 */
function toUnderline (text) {
  return (`${text}`).replace(/[A-Z]/g, (charcter, index) => `_${charcter.toLowerCase()}`)
}

/*
	命名空间格式
*/
function toNameSpace (text) {
  return toUnderline(text).replace(/_/g, '.')
}

/*
  数字格式化
 */
const NumberFormat = {
  percent (number, extendParam = {}) {
    const {
      fixed = 2,
      forceFixed = false,
      decimal = true,
      noSymbol = false,
      noZero = false,
      blank = '--'
    } = extendParam

    const percentSymbol = noSymbol ? '' : '%'

    if (isNvl(number) || isNaN(+number)) {
      return blank
    }

    number = Number(number * (decimal ? 100 : 1)).toFixed(fixed)
    if (!forceFixed) {
      number = number.replace(/(\.\d*?)[0]*$/g, (a, b) => b.replace(/\.$/g, ''))
    }

    if (noZero) {
      number = number.replace(/^0\./g, '.')
    }

    return number + percentSymbol
  },
  thsepar (number, extendParam = {}) {
    const {
      fixed = 2,
      forceFixed = false,
      noZero = false,
      blank = '--'
    } = extendParam

    if (isNvl(number) || isNaN(+number)) {
      return blank
    }

    let number2 = parseInt(number)
    const decimal = number - number2

    if (isNaN(number2) || isNaN(decimal)) {
      return blank
    }

    number2 = Array.from(`${number2}`)
      .reverse()
      .map((c, index) => (index % 3 === 0 ? `${c},` : c))
      .reverse()
      .join('')
      .replace(/,$/g, '')

    if (decimal) {
      number2 += Number(decimal).toFixed(fixed).replace('0.', '.')
    }

    if (!forceFixed) {
      number2 = number2.replace(/(\.\d*?)[0]*$/g, (a, b) => b.replace(/\.$/g, ''))
    } else if (!decimal) {
      number2 = Number(number).toFixed(fixed)
    }

    if (noZero) {
      number2 = number2.replace(/^0\./g, '.')
    }

    return number2
  }
}

let onGlobal = udFun
let definedName = null
if (isDev) {
  definedName = {}

  onGlobal = function (name, callback = udFun) {
    if (definedName[name] || !global) {
      return
    }
    definedName[name] = 1
    let _value
    Object.defineProperty(global, name, {
      set (value) {
        _value = value
        callback(value)
      },
      get () {
        return _value
      }
    })
  }
}

export {
  isDev,
  onGlobal,

  uidSeed,
  createUid,
  getUniIndex,

  udFun,
  sameFun,

  isNvl,
  isEmpty,
  isBlank,

  getDeepValue,
  snapshot,
  uniStringify,

  logSwitch,
  setPreLog,
  createLog,
  setLogHandle,
  setLogger,
  getLogInfo,

  NumberFormat,
  toCamel,
  toUnderline,
  toNameSpace
}
