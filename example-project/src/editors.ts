import { ComponentType } from "react"
import { FileTypes } from "./client"
import { BlogPostEditor } from "./components/editors/BlogPostEditor"

type EditorComponent<TDoc> = ComponentType<{
  value: TDoc
  loaded?: boolean
  error?: string
  propose: (producer: (doc: TDoc) => void) => void
}>

// Define our list of editors, mapping a file type to an editor component
export const Editors: {
  [key in keyof FileTypes]: EditorComponent<FileTypes[key]>
} = {
  blogPost: BlogPostEditor
}
