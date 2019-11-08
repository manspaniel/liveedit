import { Patch } from "immer";
export declare type ClientToServerMessage = ["propose", {
    id: string;
    type: string;
    change: Change;
}] | ["subscribe", {
    id: string;
    type: string;
}] | ["unsubscribe", {
    id: string;
    type: string;
}];
export declare type ProposalResult = "NOPE" | "ACK" | "DROP";
export declare type ServerToClientMessage = ["error", {
    id: string;
    type: string;
    code: number;
    errorMessage: string;
}] | ["initial", {
    id: string;
    type: string;
    value: any;
    baseID: string;
}] | ["changed", {
    id: string;
    type: string;
    change: Change;
}] | ["proposalResult", {
    id: string;
    type: string;
    changeID: string;
    result: ProposalResult;
}];
export interface Change {
    baseID: string;
    changeID: string;
    patches: Patch[];
}
