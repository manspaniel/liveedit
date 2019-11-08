import React from "react"
import styled from "styled-components"

type Props = {
  value: string
  onChange(val: string): void
}

export function TitleEditor(props: Props) {
  return (
    <Input
      type="text"
      value={props.value}
      onChange={e => props.onChange(e.currentTarget.value)}
    />
  )
}

const Input = styled.input`
  font-family: inherit;
  font-size: 24px;
  border: 1px solid #e1e1e1;
  padding: 10px;
  margin-bottom: 20px;
  display: block;
  width: 100%;
  box-sizing: border-box;
`
