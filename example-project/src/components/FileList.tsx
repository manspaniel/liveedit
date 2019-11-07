import React from "react"
import styled from "styled-components"

type Props = {
  onChoose: (type: string, id: string) => void
}

export function FileList(props: Props) {
  return (
    <ul>
      <li onClick={() => props.onChoose("blogPost", "12")}>Cool post</li>
      <li onClick={() => props.onChoose("blogPost", "15")}>
        Another cool post
      </li>
    </ul>
  )
}
