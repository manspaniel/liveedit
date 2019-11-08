import React from "react"
import styled from "styled-components"
import { BlogPost } from "../../../schemas"
import { TitleEditor } from "../TitleEditor"
import { TagList } from "../TagList"

type Props = {
  value: BlogPost
  propose: (func: (doc: BlogPost) => void) => void
}

export function BlogPostEditor(props: Props) {
  const post = props.value
  const propose = props.propose
  return (
    <Wrapper>
      <TitleEditor
        value={post.title}
        onChange={newTitle => {
          props.propose(draft => {
            draft.title = newTitle
          })
        }}
      />
      <TagList
        value={post.tags}
        update={func => propose(draft => func(draft.tags))}
      />
      <LikeCounter>
        <div>{post.totalLikes} Likes</div>
        <button onClick={() => propose(draft => draft.totalLikes--)}>-</button>
        <button onClick={() => propose(draft => draft.totalLikes++)}>+</button>
      </LikeCounter>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  padding: 30px;
`

const LikeCounter = styled.div`
  > span {
    font-size: 20px;
  }

  button {
    display: block;
  }
`
