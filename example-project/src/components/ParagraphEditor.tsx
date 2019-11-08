import React from 'react'

/*
  Just a little example of integrating block-based content
*/

export function ParagraphEditor(props: { value }) {
  return <div>
    {props.value.length }
  </div>
}