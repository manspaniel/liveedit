import React from "react"
import styled from "styled-components"

type Props = {
  value: string[]
  update(producer: (draft: string[]) => void): void
}

export function TagList(props: Props) {
  return (
    <Wrapper>
      {props.value.map((label, x) => (
        <Item>
          <span>{label}</span>
          <Remove
            onClick={e =>
              props.update(draft => {
                draft.splice(x, 1)
              })
            }
          ></Remove>
        </Item>
      ))}
      <Item
        style={{ cursor: "pointer" }}
        onClick={e => {
          const value = prompt("Enter tag name")
          if (value.length) {
            props.update(draft => draft.push(value))
          }
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
