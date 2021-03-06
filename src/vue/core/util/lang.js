/**
 * Created by Administrator on 2017/8/7 0007.
 */

export let emptyObject = Object.freeze({})

export function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

export function isReserved(str) {
  const c = (str + '').charCodeAt(0)
  return c === 0x24 || c === 0x5F
}

const bailRE = /[^\w.$]/
export function parsePath(path) {
  // 空字符串
  if (bailRE.test(path)) {
    return
  }
  const segments = path.split('.')
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]]
    }
    return obj
  }
}
