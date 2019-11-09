import React from "react"
import produce from "immer"
import { auto, Auto } from "auto-immer"

const defaultState = {
  title: "Cool",
  list: [1, 2, 3]
}

function useAuto<T>(initial: T): Auto<T> {
  const [state, setState] = React.useState(initial)
  const val = auto(state, proposal => {
    setState(produce(state, proposal) as T)
  })
  return val
}

export function AutoTest() {
  const data = useAuto(defaultState)

  return <div>{JSON.stringify(data)}</div>
}
