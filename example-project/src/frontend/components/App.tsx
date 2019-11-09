import React from "react"
import styled from "styled-components"
import { FileList } from "./FileList"
// import { createClient } from "../client"
import { Editors } from "../editors"
// import { LiveEditDocument } from "../../../src/client"
import { LiveEditDocument, useClient } from "../../../../lib"
import { auto } from "auto-immer"

import { BlogPost } from "../../schemas"

// // Define our list of filetypes, mapping their type name to their document type
export type FileTypes = {
  blogPost: BlogPost
}

function useForceUpdate() {
  const [v, setV] = React.useState(0)
  return () => setV(Date.now())
}

export function App() {
  const client = useClient<FileTypes>("ws://127.0.0.1:8080/edit")
  const forceUpdate = useForceUpdate()
  const [target, setTarget] = React.useState({
    type: "",
    id: ""
  })
  const [doc, setDoc] = React.useState<LiveEditDocument>(null)

  React.useEffect(() => {
    let cancelled = false
    let doc: any
    client
      .loadDocument(target.type as any, target.id)
      .then(d => {
        doc = d
        console.log("Loaded the doc", d)
        if (cancelled) {
          doc.close()
        } else {
          setDoc(doc)
        }
      })
      .catch(err => {
        console.log("Error", err)
      })
    return () => {
      cancelled = true
      if (doc) doc.close()
    }
  }, [target.type, target.id])

  React.useEffect(() => {
    if (doc) {
      return doc.subscribe(() => {
        forceUpdate()
      })
    }
  }, [doc])

  const EditorComponent = doc && Editors[doc.type]

  const editableDoc =
    doc &&
    auto(doc.value, proposal => {
      doc.propose(proposal)
    })

  return (
    <Wrapper>
      <Sidebar>
        <FileList
          selected={target}
          onChoose={(type, id) => {
            setTarget({ type, id })
            setDoc(null)
          }}
        />
      </Sidebar>
      {editableDoc && EditorComponent && (
        <Editor>
          <EditorComponent
            value={editableDoc}
            propose={func => doc.propose(func)}
          />
        </Editor>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  font-family: "Roboto", --apple-system, sans-serif;
  font-size: 15px;
  align-items: stretch;
  color: #555555;
`

const Sidebar = styled.div`
  background: #f0f0f0;
  width: 30%;
  max-width: 500px;
  min-width: 150px;
`

const Editor = styled.div`
  flex: 1 1 auto;
  background: white;
`

// function Editor({ doc }: { doc: LiveEditDocument }) {
//   if (!doc) {
//     return <div>select a doc!</div>
//   } else if (doc.type in Editors) {
//     const Component = Editors[doc.type]
//     const [value, setValue] = React.useState(doc.value)
//     React.useEffect(() => {
//       setValue(doc.value)
//       return doc.subscribe(value => {
//         setValue(value)
//       })
//     }, [doc])
//     console.log("Re-rendering editor component", value)
//     return (
//       <Component
//         value={value}
//         loaded={true}
//         propose={(func: any) => doc.propose(func)}
//       />
//     )
//   }
// }
