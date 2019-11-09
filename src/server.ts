import {
  ClientToServerMessage,
  ServerToClientMessage,
  Change,
  ProposalResult
} from "./protocol"
import { applyPatches, produce } from "immer"

interface Options<T extends { [key: string]: any }> {
  types: {
    [key in keyof T]: {
      load(id: string): Promise<T[key]>
      save(id: string, data: T[key]): Promise<void>
      validate?(data: T[key]): boolean
    }
  }
}

interface Connection<TUser = any> {
  user: TUser
  docs: { type: string; id: string }[]
  closed: boolean
  handleIncoming(msg: ClientToServerMessage): void
  close(): void
  send(msg: ServerToClientMessage): void
}

export class LiveEditServer<
  TDocs extends { [key: string]: any } = any,
  TUser = any
> {
  types: Options<TDocs>["types"]

  connections: Connection<TUser>[] = []
  docs: {
    [type: string]: {
      [id: string]: LiveEditServerDocument
    }
  } = {}

  constructor(opts: Options<TDocs>) {
    this.types = opts.types
  }

  connect(
    user: TUser,
    sender: (msg: ServerToClientMessage) => void
  ): Connection<TUser> {
    const conn = {
      user,
      docs: [],
      closed: false,
      handleIncoming: (msg: ClientToServerMessage) => {
        this.handleMessage(conn, msg)
      },
      close: () => {
        conn.closed = true
        const i = this.connections.indexOf(conn)
        if (i !== -1) {
          this.connections.splice(i, 1)
        }
      },
      send: (msg: ServerToClientMessage) => {
        if (conn.closed) return
        sender(msg)
      }
    }
    this.connections.push(conn)
    return conn
  }

  async handleMessage(conn: Connection<TUser>, msg: ClientToServerMessage) {
    switch (msg[0]) {
      case "propose":
        {
          const { id, type, change } = msg[1]
          const doc = this.getOpenDoc(type, id)
          if (!doc) {
            conn.send([
              "error",
              {
                type,
                id,
                code: 400,
                errorMessage:
                  "The document you are attempting to modify has not been loaded"
              }
            ])
          } else {
            doc.handleProposal(change, conn)
          }
        }
        break
      case "subscribe":
        {
          const { id, type } = msg[1]
          let doc = this.getOpenDoc(type, id)
          if (doc) {
            // Doc is already loaded!
            conn.docs.push({ id, type })
            conn.send([
              "initial",
              { type, id, baseID: doc.changeID, value: doc.doc }
            ])
          } else {
            // Doc hasn't loaded... load it
            try {
              doc = await this.loadDoc(type, id)
            } catch (err) {
              console.error(err)
              console.error(
                `The error above was generated while attempting to load a document (type=${type},id=${id})`
              )
              conn.send([
                "error",
                {
                  type,
                  id,
                  code: 500,
                  errorMessage:
                    "An error occurred while attempting to load the document"
                }
              ])
              break
            }
            doc = this.getOpenDoc(type, id) || doc
            if (doc) {
              if (!this.docs[type]) this.docs[type] = {}
              this.docs[type][id] = doc
              conn.send([
                "initial",
                { type, id, baseID: doc.changeID, value: doc.doc }
              ])
            } else {
              conn.send([
                "error",
                {
                  type,
                  id,
                  code: 404,
                  errorMessage:
                    "The document you are attempting to access could not be found"
                }
              ])
            }
          }
        }
        break
      case "unsubscribe":
        {
          const { id, type } = msg[1]
          conn.docs = conn.docs.filter(item =>
            item.type === type && item.id === id ? false : true
          )
          this.closeInactiveDocs()
        }
        break
    }
  }

  getOpenDoc(type: string, id: string) {
    const doc =
      this.docs[type] && this.docs[type][id] ? this.docs[type][id] : null
    return doc
  }

  async loadDoc<TTypeName extends keyof TDocs>(
    type: TTypeName,
    id: string
  ): Promise<LiveEditServerDocument<TDocs[TTypeName]> | null> {
    // if (this.types)
    if (this.types[type]) {
      // Load the doc using config
      const doc = await this.types[type].load(id)
      // Return the new object with initial value already set, and give it a validator function
      return new LiveEditServerDocument(
        this,
        id,
        type as string,
        doc,
        this.types[type].validate
      )
    } else {
      return null
    }
  }

  closeInactiveDocs() {
    console.log("Close unused files")
  }

  sendToSubscribers(
    msg: ServerToClientMessage,
    filter?: (conn: Connection<TUser>) => boolean
  ) {
    for (const conn of this.connections) {
      if (!filter || filter(conn)) {
        conn.send(msg)
      }
    }
  }
}

export class LiveEditServerDocument<TDoc = any> {
  server: LiveEditServer
  id: string
  type: string
  validate: (doc: TDoc) => boolean

  // State
  changeID: string = "initial"
  doc: TDoc

  constructor(
    server: LiveEditServer,
    id: string,
    type: string,
    initial: TDoc,
    validate?: (doc: TDoc) => boolean
  ) {
    this.server = server
    this.id = id
    this.type = type
    this.doc = initial
    this.validate = validate || ((doc: TDoc) => true)
  }

  handleProposal(change: Change, conn: Connection) {
    // Only accept the proposal if the change is coming from the latest version of the document
    if (change.baseID !== this.changeID) {
      conn.send([
        "proposalResult",
        {
          id: this.id,
          type: this.type,
          changeID: change.changeID,
          result: "NOPE"
        }
      ])
      return
    }

    // Apply patches, receiving a new doc
    const nextDoc = applyPatches(this.doc, change.patches)

    // Ensure the document is still valid
    if (!this.validate(nextDoc)) {
      // Inform the user that the change is invalid, as it makes the document invalid
      conn.send([
        "proposalResult",
        {
          id: this.id,
          type: this.type,
          changeID: change.changeID,
          result: "DROP"
        }
      ])
      return
    }

    // The changes are accepted
    this.doc = nextDoc
    this.changeID = change.changeID

    // Distribute the change to all subscribers of this document, except for the client who sent this one
    this.server.sendToSubscribers(
      ["changed", { id: this.id, type: this.type, change }],
      c =>
        c !== conn &&
        !!c.docs.find(d => d.type === this.type && d.id === this.id)
    )

    // Inform the current client of their success
    conn.send([
      "proposalResult",
      { id: this.id, type: this.type, changeID: change.changeID, result: "ACK" }
    ])
  }

  // produce(changer: (draft: TDoc) => void) {
  //   this.doc = produce(this.doc, changer, patches => {
  //     const change: Change = {
  //       baseID: this.changeID,
  //       changeID: "__" + uuid(),
  //       patches
  //     }
  //     this.changeID = change.changeID
  //     this.clients.forEach(c => {
  //       this.handler.send(c, { change })
  //     })
  //   })
  // }
}
