/**
 * Created by Administrator on 2017/8/8 0008.
 */
import {
  isDef,
  isUndef,
  isTrue,
  isPrimitive
} from '../util/index'
import {SSR_ATTR} from 'shared/constants'
import VNode from './vnode'
import {activeInstance} from '../instance/lifecycle'

export const emptyNode = new VNode('', {}, [])
const hooks = ['create', 'activate', 'update', 'remove', 'destroy']

function sameVnode(a, b) {
  // 比较了 key, tag, isComponent, data是否同时存在或同时不存在, 不是input
  return (
    a.key === b.key && (
      (
        a.tag === b.tag &&
        a.isComponent === b.component &&
        isDef(a.data) === isDef(b.data) &&
        sameInputType(a, b)
      ) || (
        isTrue(a.isAsyncPlaceholder) &&
        a.asyncFactory === b.asyncFactory &&
        isUndef(b.asyncFactory.error)
      )
    )
  )
}

function sameInputType(a, b) {
  if (a.tag !== 'input') return true
}

export function createPatchFunction(backend) {
  // 函数内部使用的全局变量
  let i, j
  const cbs = {}
  const {modules, nodeOps} = backend

  // 按hook归类
  for (i = 0; i < hooks.length; i++) {
    cbs[hooks[i]] = []
    for (j = 0; j < modules.length; j++) {
      if (isDef(modules[j][hooks[i]])) {
        cbs[hooks[i]].push(modules[j][hooks[i]])
      }
    }
  }

  function setScope(vnode) {
    let i
    let ancestor = vnode
    while (ancestor) {
      if (isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
        console.log(i)
      }
      ancestor = ancestor.parent
    }

    if (isDef(i = activeInstance) && i !== vnode.context && isDef(i = i.$options._scopeId)) {
      // ...
      debugger
    }
  }

  function emptyNodeAt(elm) {
    return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
  }

  // initial: vnode [] body 回车 undefined
  // sec: {text: 1} [] vnode.elm null true
  function createElm(vnode, insertedVnodeQueue, parentElm, refElm, nested) {
    vnode.isRootInsert = !nested

    // false
    // 组件
    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      return
    }

    const data = vnode.data
    const children = vnode.children
    const tag = vnode.tag

    // false
    if (isDef(tag)) {
      // createElement div
      vnode.elm = vnode.ns ? nodeOps.createElementNS(vnode.ns, tag) : nodeOps.createElement(tag, vnode)
      // 第一次运行啥也没干
      setScope(vnode)

      // ... WEEX

      createChildren(vnode, children, insertedVnodeQueue)
      if (isDef(data)) {
        // 执行指令的create方法
        invokeCreateHooks(vnode, insertedVnodeQueue)
      }
      // 将vnode.elm节点插入dom
      insert(parentElm, vnode.elm, refElm)
    } else if (isTrue(vnode.isComment)) {
      // ...
    } else {
      vnode.elm = nodeOps.createTextNode(vnode.text)
      insert(parentElm, vnode.elm, refElm)
    }
  }

  function invokeCreateHooks(vnode, insertedVnodeQueue) {
    for (let i = 0; i < cbs.create.length; i++) {
      cbs.create[i](emptyNode, vnode)
    }
    // 如果data.hook存在
    // 组件
    i = vnode.data.hook
    if (isDef(i)) {
      // i.create ...
      if (isDef(i.create)) i.create(emptyNode, vnode)
      // i.insert ...
      // 压入队列
      if (isDef(i.insert)) insertedVnodeQueue.push(vnode)
    }
  }

  // vnode [] false
  function invokeInsertHook(vnode, queue, initial) {
    if (isTrue(initial) && isDef(vnode.parent)) {
      // ... 组件内部会走这里
      vnode.parent.data.pendingInsert = queue
    } else {
      for (let i = 0; i < queue.length; ++i) {
        queue[i].data.hook.insert(queue[i])
      }
    }
  }

  // vnode [{a}] []
  function createChildren(vnode, children, insertedVnodeQueue) {
    if (Array.isArray(children)) {
      for (let i = 0; i < children.length; i++) {
        createElm(children[i], insertedVnodeQueue, vnode.elm, null, true)
      }
    } else if (isPrimitive(vnode.text)) {
      nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(vnode.text))
    }
  }

  function isPatchable(vnode) {
    while (vnode.componentInstance) {
      vnode = vnode.componentInstance._vnode
    }
    return isDef(vnode.tag)
  }

  function initComponent(vnode, insertedVnodeQueue) {
    if (isDef(vnode.data.pendingInsert)) {
      insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert)
      vnode.data.pendingInsert = null
    }
    vnode.elm = vnode.componentInstance.$el
    // 组件 true
    if (isPatchable(vnode)) {
      invokeCreateHooks(vnode, insertedVnodeQueue)
      setScope(vnode)
    } else {
      // ...
    }
  }

  function createComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
    let i = vnode.data
    if (isDef(i)) {
      // ...
      /* eslint-disable */
      const isReactivated = isDef(vnode.componentInstance) && i.keepAlive
      if (isDef(i = i.hook) && isDef(i = i.init)) {
        // 执行组件的init
        i(vnode, false /* hydrating */, parentElm, refElm)
      }
      if (isDef(vnode.componentInstance)) {
        debugger
        initComponent(vnode, insertedVnodeQueue)
        if (isTrue(isReactivated)) {
          reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
        }
        return true
      }
    }
  }

  function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      const ch = vnodes[startIdx]
      if (isDef(ch)) {
        if (isDef(ch.tag)) {
          // 删除节点
          removeAndInvokeRemoveHook(ch)
          // 调用ref 和 directive 的销毁方法
          invokeDestroyHook(ch)
        }
      }
    }
  }

  function invokeDestroyHook(vnode) {
    let i, j
    const data = vnode.data
    // 尝试调用vnode的 销毁函数
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.destory)) i(vnode)
      for (i = 0; i < cbs.destroy.length; i++) cbs.destroy[i](vnode)
    }
    // 递归调用子节点的销毁hook
    if (isDef(i = vnode.children)) {
      for (j = 0; j < vnode.children.length; ++j) {
        invokeDestroyHook(vnode.children[j])
      }
    }
  }

  // 应该是保证移除最上层节点
  function createRmCb(childElm, listeners) {
    function remove() {
      if (--remove.listeners === 0) {
        removeNode(childElm)
      }
    }

    remove.listeners = listeners
    return remove
  }

  function removeNode(el) {
    const parent = nodeOps.parentNode(el)
    if (isDef(parent)) {
      nodeOps.removeChild(parent, el)
    }
  }

  function removeAndInvokeRemoveHook(vnode, rm) {
    if (isDef(rm) || isDef(vnode.data)) {
      let i
      const listeners = cbs.remove.length + 1
      if (isDef(rm)) {
        // ...
      } else {
        rm = createRmCb(vnode.elm, listeners)
      }
      // ... component
      for (i = 0; i < cbs.remove.length; ++i) {
        // 这里调用了transition的remove方法
        cbs.remove[i](vnode, rm)
      }
      if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
        // ...
      } else {
        rm()
      }
    } else {
      // ...
    }
  }

  function insert(parent, elm, ref) {
    if (isDef(parent)) {
      if (isDef(ref)) {
        if (ref.parentNode === parent) {
          nodeOps.insertBefore(parent, elm, ref)
        }
      } else {
        nodeOps.appendChild(parent, elm)
      }
    }
  }

  function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    let oldStartIdx = 0
    let newStartIdx = 0
    let oldEndIdx = oldCh.length - 1
    let oldStartVnode = oldCh[0]
    let oldEndVnode = oldCh[oldEndIdx]
    let newEndIdx = newCh.length - 1
    let newStartVnode = newCh[0]
    let newEndVnode = newCh[newEndIdx]
    let oldKeyToIdx, idxInOld, elmToMove, refElm

    const canMove = !removeOnly

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        console.log('-----------------------')
      } else if (isUndef(oldEndVnode)) {
        console.log('-----------------------')
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
      }
    }
  }

  function patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly) {
    if (oldVnode === vnode) {
      return
    }

    const elm = vnode.elm = oldVnode.elm

    if (isTrue(oldVnode.isAsyncPlaceholder)) {
      if (isDef(vnode.asyncFactory.resolved)) {
        debugger
      } else {
        vnode.isAsyncPlaceholder = true
      }
      return
    }

    // 处理静态节点
    if (isTrue(vnode.isStatic) &&
      isTrue(oldVnode.isStatic) &&
      vnode.key === oldVnode.key &&
      (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
    ) {
      vnode.componentInstance = oldVnode.componentInstance
      return
    }

    let i
    const data = vnode.data
    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      // 暂时不知道干什么的
      debugger
    }

    const oldCh = oldVnode.children
    const ch = vnode.children
    if (isDef(data) && isPatchable(vnode)) {
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
      if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
    }
    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
      } else if (isDef(ch)) {
        debugger
      } else if (isDef(oldCh)) {
        debugger
      } else if (isDef(oldVnode.text)) {
        debugger
      }
    } else if (oldVnode.text !== vnode.text) {
      nodeOps.setTextContent(elm, vnode.text)
    }
    if (isDef(data)) {
      if(isDef(i = data.hook) && isDef(i = i.potpatch)) i(oldVnode, vnode)
    }
  }

// initial
// 初始dom vnode false false undefined undefined
  return function patch(oldVnode, vnode, hydrating, removeOnly, parentElm, refElm) {
    debugger
    if (isUndef(vnode)) {
      // ...
      console.warn('[VNode] is UnDef')
      return
    }
    let isInitialPatch = false
    const insertedVnodeQueue = []

    if (isUndef(oldVnode)) {
      // oldNode 不存在
      // 组件可能会走这个分支, 创建根元素
      isInitialPatch = true
      createElm(vnode, insertedVnodeQueue, parentElm, refElm)
    } else {
      const isRealElement = isDef(oldVnode.nodeType)

      // 看vnode是否值得比较
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly)
      } else {
        if (isRealElement) {
          if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
            // 服务端渲染相关
            // ...
          }

          if (isTrue(hydrating)) {
            // ...
          }

          // initial return -> VNode tag: div, elm: div#app
          oldVnode = emptyNodeAt(oldVnode)
        }

        const oldElm = oldVnode.elm
        // ubdefined
        const parentElm = nodeOps.parentNode(oldElm)
        // 创建并添加新节点
        createElm(vnode,
          insertedVnodeQueue,
          oldElm._leaveCb ? null : parentElm,
          nodeOps.nextSibling(oldElm))

        if (isDef(vnode.parent)) {
          // ...
        }

        // 移除原始节点
        if (isDef(parentElm)) {
          removeVnodes(parentElm, [oldVnode], 0, 0)
        }
      }
    }
    // 在这里会调用组件的mount() hook
    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
    return vnode.elm
  }
}
