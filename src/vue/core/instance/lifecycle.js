/**
 * Created by Administrator on 2017/8/6 0006.
 */
import {noop} from '../util/index'
import Watcher from '../observer/watcher'

export let activeInstance = null
export let isUpdatingChildComponent = false

export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode, hydrating) {
    console.log('update')
    const vm = this

    // 选择出的dom节点
    const prevEl = vm.$el

    // null
    const prevVnode = vm._vnode
    const prevActiveInstance = activeInstance

    activeInstance = vm
    vm._vnode = vnode

    if (!prevVnode) {
      // 渲染
      vm.$el = vm.__patch__(
        vm.$el, vnode, hydrating, false /* removeOnly */,
        vm.$options._parentElm,
        vm.$options._refElm
      )

      vm.$options._parentElm = vm.$options._refElm = null
    } else {
      console.log('update render')
      vm.$el = vm.__patch__(prevVnode, vnode)
    }
    activeInstance = prevActiveInstance
    if (prevEl) {
      prevEl.__vue__ = null
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm
    }
    // 如果父节点是临时的 更新父节点
    // ...
    debugger
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el
    }
  }

  // 强制更新
  Vue.prototype.$forceUpdate = function (vnode, hydrating) {
    console.log('$forceUpdate')
  }

  // 销毁
  Vue.prototype.$destroy = function (vnode, hydrating) {
    console.log('$destroy')
  }
}

export function initLifecycle(vm) {
  const options = vm.$options

  // 找到第一个parent, 没有abstract的
  // component分支时 会挂载在父vm实例的$children上
  let parent = options.parent
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent
    }
    parent.$children.push(vm)
  }

  vm.$parent = parent
  vm.$root = parent ? parent.$root : vm

  vm.$children = []
  vm.$refs = {}

  vm._watcher = null
  vm._inactive = null
  vm._directInactive = false
  vm._isMounted = false
  vm._isDestroyed = false
  vm._isBeingDestroyed = false
}

export function callHook(vm, hook) {
  console.log(hook)
}

export function mountComponent(vm, el, hydrating) {
  vm.$el = el

  if (!vm.$options.render) {
    // ...
  }
  callHook(vm, 'beforeMount')

  let updateComponent = () => {
    // vm._render 返回vm的vnode
    vm._update(vm._render(), hydrating)
  }

  /*
   *  watcher 内部会调用一次 updateComponent 用于收集依赖
   * */
  vm._watcher = new Watcher(vm, updateComponent, noop)
  hydrating = false

  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
  return vm
}
