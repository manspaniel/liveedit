import React from "react"
import styled from "styled-components"
import { Auto } from "auto-immer"

type Props = {
  list: Auto<string[]>
}

export function TagList(props: Props) {
  return (
    <Wrapper>
      {props.list.map((label, x) => (
        <Item key={x}>
          <span>{label}</span>
          <Remove onClick={e => props.list.splice(x, 1)}></Remove>
        </Item>
      ))}
      <Item
        style={{ cursor: "pointer" }}
        onClick={e => {
          const value = prompt("Enter tag name")
          props.list.push(value)
        }}
      >
        + Add
      </Item>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  font-family: inherit;
  font-size: 20px;
  border: 1px solid #e1e1e1;
  padding: 10px;
  margin-bottom: 20px;
  display: block;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
`

const Item = styled.div`
  background: #f0f0f0;
  padding: 5px 10px;
  border-radius: 4px;
  white-space: nowrap;
  margin-right: 10px;
`

const Remove = styled.span`
  cursor: pointer;
  margin-left: 10px;
  &:after {
    content: "x";
  }
`
