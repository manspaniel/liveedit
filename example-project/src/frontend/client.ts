// import { ComponentType } from "react"
// import { LiveEditClient } from "../../../src/client"
// import { BlogPost } from "../schemas"

// // Define our list of filetypes, mapping their type name to their document type
// export type FileTypes = {
//   blogPost: BlogPost
// }

// export function createClient() {
//   // Create a websocket
//   const ws = new WebSocket("ws://127.0.0.1:8080/edit")

//   const client = new LiveEditClient<FileTypes>(msg =>
//     ws.send(JSON.stringify(msg))
//   )

//   ws.onmessage = e => {
//     client.handleMessage(JSON.parse(e.data))
//   }

//   window["client"] = client

//   return client
// }
