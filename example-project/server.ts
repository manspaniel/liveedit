import http from "http"
import express from "express"
import { Server as WebSocketServer } from "ws"
import { LiveEditServer } from "../src/server"
import devMiddleware from "webpack-dev-middleware"
import webpack from "webpack"

type User = {
  name: string
}

type DocID = string

function bootExample() {
  // Create http server and express
  const app = express()
  const httpServer = http.createServer(app)

  // Webpack stuff
  const compiler = webpack(require("./webpack.config"))
  app.use(
    devMiddleware(compiler, {
      publicPath: "/",
      index: "index.html"
    })
  )

  // Create websocket server
  const wss = new WebSocketServer({
    server: httpServer,
    path: "/edit"
  })

  // Create the live edit server
  const liveEdit = new LiveEditServer({
    types: {
      blogPost: {
        async load(id: string) {
          return {
            title: "fish",
            authors: ["daniel"],
            paragraphs: ["oh heeyyy!"]
          }
        },
        async save(id, data) {}
      }
    }
  })

  // Hookk up the websocket server to the live edit server
  wss.on("connection", (socket, req) => {
    // Grab user info from the request, if that's something you need
    // Note that we're just using the Authorization header in this example because it's easy.
    const username = req.headers.authorization

    // Create a new live edit session for this connection
    const session = liveEdit.connect({ name: username || "unknown" }, msg => {
      // The live edit server wants to send a message to the client, so do that
      socket.send(JSON.stringify(msg))
    })

    // Whenever we receive a websocket message from the client, pass it directly to the live edit server
    socket.on("message", data => {
      const msg = JSON.parse(data.toString())
      session.handleIncoming(msg)
    })

    // When the socket closes (meaning the user has disconnected), inform the live edit server by calling session.close
    socket.on("close", () => {
      session.close()
    })
  })

  httpServer.listen(8080)
}

bootExample()
