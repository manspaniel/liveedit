import { Draft } from "immer"
import { symbol } from "prop-types"

const AutoImmer = Symbol("AutoImmer")

type Auto<T> = T & { [AutoImmer]: true }

type Pointer = (string | number | symbol)[]

type Proposer<T> = (path: Pointer, mutator: Mutator<T>) => void

type Mutator<T> = (draft: Draft<T>) => T | void

export function autoImmer<T extends Object>(
  target: T,
  propose: Proposer<T>
): Auto<T> {
  return fork(target, propose, [])
}

export function isAuto<T>(o: any): o is Auto<T> {
  return o[AutoImmer]
}

function fork<T extends Object>(
  target: T,
  propose: Proposer<T>,
  path: Pointer
): Auto<T> {
  const base: any = Array.isArray(target) ? [] : {}
  base[AutoImmer] = true
  const proxy = new Proxy(
    base as Auto<T>,
    createProxyHandler(target, path, propose)
  )
  return proxy as Auto<T>
}

function createProxyHandler<T extends Object>(
  obj: T,
  path: Pointer,
  propose: Proposer<T>
): ProxyHandler<T> {
  return {
    set(t, prop, val: T) {
      propose(path, draft => {
        // @ts-ignore
        draft[prop] = val
      })
      return true
    },
    has(t, prop) {
      return prop in obj
    },
    getOwnPropertyDescriptor(t, prop) {
      const desc = Object.getOwnPropertyDescriptor(obj, prop)
      return { configurable: true, enumerable: desc && desc.enumerable }
    },
    ownKeys(t) {
      return [
        ...Object.getOwnPropertyNames(obj),
        ...Object.getOwnPropertySymbols(obj)
      ]
    },
    deleteProperty(t, prop) {
      console.log("TODO DELTE PROPERT")
      return true
    },
    get(t, prop) {
      // @ts-ignore
      const value = obj[prop]
      if (prop === "toSource") {
        return "asdfasdfasdf"
      }
      if (prop === Symbol.iterator) {
        // Ensure the target object is still iterable
        // @ts-ignore
        const iterator = obj[Symbol.iterator]()
        console.log("Iterator2", iterator)
        let i = 0
        return function*() {
          while (true) {
            const n = iterator.next()
            i++
            console.log("NN", typeof n.value)
            if (n.done) return
            yield typeof n.value === "object"
              ? fork(n.value, propose, [...path, i])
              : n.value
          }
        }
      } else if (typeof value === "function") {
        // If the value is a function, return a proposed version
        return (...args: any) => {
          let result
          propose(path, draft => {
            // @ts-ignore
            result = draft[prop](...args)
          })
        }
      } else {
        // If the value is an object or array, fork it
        if (typeof value === "object") {
          return fork(value, propose, [...path, prop])
        }
      }
      return value
    }
  }
}
