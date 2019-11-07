import React from "react"
import styled from "styled-components"
import { BlogPost } from "../../schemas"

type Props = {
  value: BlogPost
  loaded: boolean
  propose: (func: (doc: BlogPost) => void) => void
}

export function BlogPostEditor(props: Props) {
  return (
    <div>
      Editor here {!props.loaded && "Loading..."}
      {props.loaded && (
        <input
          type="text"
          value={props.value.title}
          onChange={e => {
            const newTitle = e.currentTarget.value
            props.propose(doc => {
              doc.title = newTitle
            })
          }}
        />
      )}
      {JSON.stringify(props.value)}
    </div>
  )
}
