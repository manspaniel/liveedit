import { ClientToServerMessage, ServerToClientMessage, Change } from "./protocol";
interface Options<T extends {
    [key: string]: any;
}> {
    types: {
        [key in keyof T]: {
            load(id: string): Promise<T[key]>;
            save(id: string, data: T[key]): Promise<void>;
            validate?(data: T[key]): boolean;
        };
    };
}
interface Connection<TUser = any> {
    user: TUser;
    docs: {
        type: string;
        id: string;
    }[];
    closed: boolean;
    handleIncoming(msg: ClientToServerMessage): void;
    close(): void;
    send(msg: ServerToClientMessage): void;
}
export declare class LiveEditServer<TDocs extends {
    [key: string]: any;
} = any, TUser = any> {
    types: Options<TDocs>["types"];
    connections: Connection<TUser>[];
    docs: {
        [type: string]: {
            [id: string]: LiveEditServerDocument;
        };
    };
    constructor(opts: Options<TDocs>);
    connect(user: TUser, sender: (msg: ServerToClientMessage) => void): Connection<TUser>;
    handleMessage(conn: Connection<TUser>, msg: ClientToServerMessage): Promise<void>;
    getOpenDoc(type: string, id: string): LiveEditServerDocument<any> | null;
    loadDoc<TTypeName extends keyof TDocs>(type: TTypeName, id: string): Promise<LiveEditServerDocument<TDocs[TTypeName]> | null>;
    closeInactiveDocs(): void;
    sendToSubscribers(msg: ServerToClientMessage, filter?: (conn: Connection<TUser>) => boolean): void;
}
export declare class LiveEditServerDocument<TDoc = any> {
    server: LiveEditServer;
    id: string;
    type: string;
    validate: (doc: TDoc) => boolean;
    changeID: string;
    doc: TDoc;
    constructor(server: LiveEditServer, id: string, type: string, initial: TDoc, validate?: (doc: TDoc) => boolean);
    handleProposal(change: Change, conn: Connection): void;
}
export {};
