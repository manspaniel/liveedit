import { ServerToClientMessage, ClientToServerMessage, Change, ProposalResult } from "./protocol";
import { Patch } from "immer";
interface DocTypeSet {
    [typeName: string]: any;
}
export declare class LiveEditClient<TDocTypeSet extends DocTypeSet> {
    documents: {
        [key in keyof TDocTypeSet]?: {
            [id: string]: LiveEditDocument<TDocTypeSet[key]>;
        };
    };
    send: (msg: ClientToServerMessage) => void;
    pendingDocuments: {
        type: string;
        id: string;
        resolve: (val: any) => void;
        reject: (err: Error) => void;
    }[];
    connected: boolean;
    constructor(send: (msg: ClientToServerMessage) => void);
    handleMessage(msg: ServerToClientMessage): void;
    loadDocument<TTypeName extends keyof TDocTypeSet, TDocType = TDocTypeSet[TTypeName]>(type: TTypeName, id: string): Promise<LiveEditDocument<TDocType>>;
}
declare type DocumentListener<TDoc = any> = (value: TDoc, doc: LiveEditDocument<TDoc>) => void;
export declare class LiveEditDocument<TDoc = any> {
    type: string;
    id: string;
    client: LiveEditClient<any>;
    listeners: DocumentListener[];
    ready: boolean;
    proposing: boolean;
    pendingResponses: {
        [changeID: string]: (result: ProposalResult) => void;
    };
    value?: TDoc;
    baseID: string;
    confirmedValue?: TDoc;
    confirmedBaseID: string;
    queue: {
        changeID: string;
        func: (draft: TDoc) => void;
        patches: Patch[];
    }[];
    constructor(type: string, id: string, client: LiveEditClient<any>);
    propose(func: (draft: TDoc) => void): void;
    sendProposal(change: Change): Promise<ProposalResult>;
    distributeFirstChange(): Promise<void>;
    subscribe(handler: (doc: TDoc) => void): () => void;
    patch(change: Change): void;
    setInitial(baseID: string, doc: TDoc): void;
    changed(): void;
    close(): void;
}
export {};
