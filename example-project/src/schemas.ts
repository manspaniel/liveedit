/*
  In this file, we're declaring both JSON schemas and TypeScript
  types at the same, using Typebox.
  We use the JSON schemas to create validation functions, for use
  on the server only.

  Totally don't need to use typebox! Just nifty:
  https://github.com/sinclairzx81/typebox/

  We'll use the JSON schema definitions in combination with Ajv,
  which is a great JSON schema validator:

  https://github.com/epoberezkin/ajv
*/
import { Type as T, Static } from "./typebox"
import Ajv from "ajv"

const ajv = new Ajv()

export const BlogPostSchema = T.Object({
  title: T.String(),
  tags: T.Array(T.String()),
  paragraphs: T.Array(T.String()),
  totalLikes: T.Range(0, 10)
})

export type BlogPost = Static<typeof BlogPostSchema>

export function validateBlogPost(post: any): post is BlogPost {
  return ajv.validate(BlogPostSchema, post) as boolean
}
