import React from "react"
import styled from "styled-components"
import { FileList } from "./FileList"
import { createClient } from "../client"
import { Editors } from "../editors"
import { LiveEditDocument } from "../../../src/client"

export function App() {
  const client = React.useMemo(createClient, [])
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

  console.log("Doc is", doc)

  return (
    <Wrapper>
      <FileList
        onChoose={(type, id) => {
          console.log("Chose", type, id)
          setTarget({ type, id })
        }}
      />
      {doc && <Editor doc={doc} />}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`

function Editor({ doc }: { doc: LiveEditDocument }) {
  if (!doc) {
    return <div>select a doc!</div>
  } else if (doc.type in Editors) {
    const Component = Editors[doc.type]
    const [value, setValue] = React.useState(doc.value)
    React.useEffect(() => {
      setValue(doc.value)
      return doc.subscribe(value => {
        setValue(value)
      })
    }, [doc])
    console.log("Re-rendering editor component", value)
    return (
      <Component
        value={value}
        loaded={true}
        propose={(func: any) => doc.propose(func)}
      />
    )
  }
}
