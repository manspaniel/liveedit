import {
  ServerToClientMessage,
  ClientToServerMessage,
  Change,
  ProposalResult
} from "./protocol"
import produce, { Patch, applyPatches, produceWithPatches } from "immer"
import uuid from "uuid/v4"
import { string } from "prop-types"
import { resolve } from "dns"
import { rejects } from "assert"

interface DocTypeSet {
  [typeName: string]: any
}

export class LiveEditClient<TDocTypeSet extends DocTypeSet> {
  documents: {
    [key in keyof TDocTypeSet]?: {
      [id: string]: LiveEditDocument<TDocTypeSet[key]>
    }
  } = {}
  send: (msg: ClientToServerMessage) => void

  pendingDocuments: {
    type: string
    id: string
    resolve: (val: any) => void
    reject: (err: Error) => void
  }[] = []

  constructor(send: (msg: ClientToServerMessage) => void) {
    this.send = send
  }

  handleMessage(msg: ServerToClientMessage) {
    const self = this
    switch (msg[0]) {
      case "changed":
        {
          const { id, type, change } = msg[1]
          console.log("Got change", change)
          const typedItems = this.documents[type]
          if (typedItems) {
            if (id in typedItems) {
              const liveEditDoc: LiveEditDocument = typedItems[id]
              console.log("Found doc", liveEditDoc)
              liveEditDoc.patch(change)
            }
          }
        }
        break
      case "proposalResult":
        {
          const { id, type, changeID, result } = msg[1]
          console.log(
            "Got response",
            type in this.documents,
            type,
            this.documents
          )
          if (type in this.documents) {
            console.log("> Type", this.documents, type)
            const typedItems = this.documents[type]
            if (typedItems && id in typedItems) {
              const liveEditDoc: LiveEditDocument = typedItems[id]
              console.log("Doc?", liveEditDoc.pendingResponses)
              if (liveEditDoc.pendingResponses[changeID]) {
                liveEditDoc.pendingResponses[changeID](result)
              }
            }
          }
        }
        break
      case "initial":
        {
          const { id, type, value, baseID } = msg[1]
          const liveEditDoc: LiveEditDocument = new LiveEditDocument(
            type,
            id,
            this
          )
          liveEditDoc.setInitial(baseID, value)
          for (const pending of this.pendingDocuments) {
            if (pending.type === type && pending.id === id) {
              pending.resolve(liveEditDoc)
            }
          }
        }
        break
      case "error":
        {
          const { id, type, errorMessage } = msg[1]
          for (const pending of this.pendingDocuments) {
            if (pending.type === type && pending.id === id) {
              pending.reject(new Error(errorMessage))
            }
          }
        }
        break
    }
  }

  async loadDocument<
    TTypeName extends keyof TDocTypeSet,
    TDocType = TDocTypeSet[TTypeName]
  >(type: TTypeName, id: string): Promise<LiveEditDocument<TDocType>> {
    return new Promise((resolve, reject) => {
      // Subscribe
      this.send(["subscribe", { id: String(id), type: String(type) }])

      // Create the document
      this.pendingDocuments.push({
        type: String(type),
        id: id,
        resolve: doc => {
          // Save it
          if (!this.documents[type]) {
            this.documents[type] = {}
          }

          // TODO: fix this? Types seem compatible to me! TS complains though...
          // @ts-ignore
          this.documents[type][id] = doc

          resolve(doc)
        },
        reject: err => {
          reject(err)
        }
      })
    })
  }
}

type DocumentListener<TDoc = any> = (
  value: TDoc,
  doc: LiveEditDocument<TDoc>
) => void

export class LiveEditDocument<TDoc = any> {
  type: string
  id: string
  client: LiveEditClient<any>

  // Listeners
  listeners: DocumentListener[] = []

  // False when the document hasn't yet loaded, true when it has
  ready: boolean = false
  // True when a proposal is in progress
  proposing: boolean = false
  pendingResponses: {
    [changeID: string]: (result: ProposalResult) => void
  } = {}

  // The confirmed state and baseID
  value?: TDoc
  baseID: string = ""

  // The optimistic value and baseID
  confirmedValue?: TDoc
  confirmedBaseID: string = ""

  queue: {
    changeID: string
    func: (draft: TDoc) => void
    patches: Patch[]
  }[] = []

  constructor(type: string, id: string, client: LiveEditClient<any>) {
    this.type = type
    this.id = id
    this.client = client
  }

  propose(func: (draft: TDoc) => void) {
    console.log("Proposing")
    const changeID = uuid()
    // let patches: Patch[]
    console.log("Old value", this.value)
    const [nextValue, patches] = produceWithPatches(this.value, draft => {
      func(draft as TDoc)
    })
    this.value = nextValue
    this.queue.push({
      changeID,
      func,
      patches
    })
    this.changed()
    if (this.queue.length === 1) {
      this.distributeFirstChange()
    }
  }

  async sendProposal(change: Change): Promise<ProposalResult> {
    return new Promise(resolve => {
      this.pendingResponses[change.changeID] = resolve
      this.client.send(["propose", { id: this.id, type: this.type, change }])
    })
  }

  async distributeFirstChange() {
    if (this.proposing) return
    const change = this.queue[0]
    this.proposing = true
    console.log("Distributing")
    const response = await this.sendProposal({
      baseID: this.confirmedBaseID,
      changeID: change.changeID,
      patches: change.patches
    })
    console.log("Got result back")
    this.proposing = false
    if (response === "NOPE") {
      console.log("Got rejected")
      // we keep the actions for now, and we will try to replay them after receiving the next change
    } else if (response === "DROP") {
      // we've been instructed to drop this change
      console.log("Dropping")
      let doc = this.confirmedValue
      this.queue.shift()
      for (const change of this.queue) {
        doc = applyPatches(doc, change.patches)
      }
      this.value = doc
      this.changed()
      // Send the next change!
      if (this.queue.length) this.distributeFirstChange()
    } else if (response === "ACK") {
      console.log("Applying")
      this.confirmedValue = applyPatches(this.confirmedValue, change.patches)
      this.confirmedBaseID = change.changeID
      this.queue.shift()
      // Send the next change!
      if (this.queue.length) this.distributeFirstChange()
    }
    this.changed()
  }

  subscribe(handler: (doc: TDoc) => void) {
    this.listeners.push(handler)
    return () => {
      const index = this.listeners.indexOf(handler)
      if (index !== -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  patch(change: Change) {
    console.log("Changing", change)
    if (change.baseID !== this.confirmedBaseID) throw "Illegal state"
    this.confirmedBaseID = change.changeID
    this.confirmedValue = applyPatches(this.confirmedValue, change.patches)
    const queue = this.queue
    this.queue = []
    this.value = this.confirmedValue

    // Apply pending changes again
    while (queue.length) {
      const p = queue.shift()
      try {
        if (p) this.propose(p.func)
      } catch (e) {
        console.warn("Dropped change, it can no longer be applied")
      }
    }

    this.changed()
  }

  setInitial(baseID: string, doc: TDoc) {
    this.value = doc
    this.confirmedValue = doc
    this.baseID = baseID
    this.confirmedBaseID = baseID
    this.ready = true
    this.changed()
  }

  changed() {
    this.listeners.forEach(subscriber => {
      subscriber(this.value, this)
    })
  }

  close() {
    this.listeners = []
    this.client.send(["unsubscribe", { type: this.type, id: this.id }])
  }
}
