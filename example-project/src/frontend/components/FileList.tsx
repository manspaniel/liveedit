import React from "react"
import styled from "styled-components"

type Props = {
  selected?: { type: string; id: string }
  onChoose: (type: string, id: string) => void
}

export function FileList(props: Props) {
  const sections = [
    {
      label: "Blog Posts",
      items: [
        {
          type: "blogPost",
          label: "Blog post 5",
          id: "1"
        },
        {
          type: "blogPost",
          label: "Blog post 4",
          id: "2"
        },
        {
          type: "blogPost",
          label: "Blog post 3",
          id: "3"
        }
      ]
    }
  ]
  return (
    <Styles>
      <ul>
        {sections.map(section => (
          <li key={section.label}>
            <span>{section.label}</span>
            <ul>
              {section.items.map(item => (
                <li
                  key={item.id}
                  className={
                    props.selected &&
                    (props.selected.id == item.id &&
                      props.selected.type == item.type)
                      ? "--active"
                      : ""
                  }
                  onClick={() => props.onChoose(item.type, item.id)}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </Styles>
  )
}

const Styles = styled.div`
  ul,
  li {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  > ul {
    line-height: 2em;

    > li {
      > span {
        display: block;
        text-transform: uppercase;
        font-size: 0.8em;
        padding-left: 10px;
        opacity: 0.7;
      }

      > ul {
        margin: 0;
        padding: 0;

        > li {
          padding-left: 15px;
          cursor: pointer;

          &:hover {
            background: #e7e7e7;
          }

          &.--active {
            background: #2255aa;
            color: white;
          }
        }
      }
    }
  }
`
