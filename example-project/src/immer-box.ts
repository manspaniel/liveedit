import { useState, useContext, createContext } from "react"
import produce, { Draft } from "immer"
type Pointer = (string | number)[]

const BoxedValueContext = createContext<BoxedValue<any>>(null)

interface BoxedValue<T> {
  readonly path: Pointer
  readonly value: T
  _handler(pointer: Pointer[], func: (t: T) => void): void
  onChange(func: (t: T) => void): void
  observe: T extends []
    ? ((pointer: number) => BoxedValue<T[number]>)
    : ((pointer: number) => BoxedValue<null>)
}

// interface Changer<T> {
//   readonly pointer: Pointer
//   readonly func: (draft: T) => void
// }

export function boxedValueSource() {}

// extends [] | { [key: string]: any }
export function useRootBox<T extends {}>(
  value: T,
  handler: (pointer: Pointer[], func: (draft: any) => void) => void
): BoxedValue<T> {
  return {
    value,
    path: [],
    _handler: handler,
    onChange: value => handler([], value),
    // @ts-ignore
    observe(pointer) {
      return {
        value: value[pointer],
        path: [pointer],
        _handler: handler,
        onChange: value => handler([pointer as any], value)
      }
    }
  }
}

export function useBox<T>(): BoxedValue<T> {
  const parent = useContext(BoxedValueContext)
  if (!parent)
    throw new Error("The useBox() hook requies an ancestral BoxedValueProvider")
  return parent
}

///////

type Structure = {
  label: string
  shape: {
    name: string
    colours: {
      r: string
      g: string
      b: string
      tags: string[]
    }[]
  }
}

export function BoxedValueExample() {
  const [value, setValue] = useState(initialValue)
  const root = useRootBox<T>(value, apply => {
    const nextValue = produce(draft => apply(draft))
    setValue(nextValue)
  })
  root.observe()
}
