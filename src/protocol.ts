import { Patch } from "immer"

export type ClientToServerMessage =
  // Client is proposing a change
  | ["propose", { id: string; type: string; change: Change }]
  // Client wishes to subscribe to a document
  | ["subscribe", { id: string; type: string }]
  // Client wishes to unsubscribe from a document
  | ["unsubscribe", { id: string; type: string }]

export type ProposalResult = "NOPE" | "ACK" | "DROP"

export type ServerToClientMessage =
  // Notify client that a fatal error has occurred on the specified file
  | ["error", { id: string; type: string; code: number; errorMessage: string }]
  // Server is sending the initial value of a document
  | ["initial", { id: string; type: string; value: any; baseID: string }]
  // Server is informing the client of a patch
  | ["changed", { id: string; type: string; change: Change }]
  // Server is informing the client of a patch
  | [
      "proposalResult",
      { id: string; type: string; changeID: string; result: ProposalResult }
    ]

export interface Change {
  baseID: string
  changeID: string
  patches: Patch[]
}
