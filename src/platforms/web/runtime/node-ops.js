/**
 * Created by Administrator on 2017/8/8 0008.
 */
import { namespaceMap } from 'web/util/index'

export function createElement(tagName, vnode) {
  const elm = document.createElement(tagName)
  if (tagName !== 'select') {
    return elm
  }
}

export function createElementNS(namespace, tagName) {
  return document.createElementNS(namespaceMap[namespace], tagName)
}

export function createTextNode(text) {
  return document.createTextNode(text)
}

export function createComment(text) {
  return document.createComment(text)
}

export function insertBefore(parentNode, newNode, referenceNode) {
  parentNode.insertBefore(newNode, referenceNode)
}

export function removeChild(node, child) {
  node.removeChild(child)
}

export function appendChild(node, child) {
  node.appendChild(child)
}

export function parentNode(node) {
  return node.parentNode
}

export function nextSibling(node) {
  return node.nextSibling
}

export function tagName(node) {
  return node.tagName
}

export function setTextContent() {
  console.log('setTextContent')
}

export function setAttribute() {
  console.log('setAttribute')
}
