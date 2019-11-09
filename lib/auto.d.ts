import { Draft } from "immer";
declare const AutoImmer: unique symbol;
declare type Auto<T> = T & {
    [AutoImmer]: true;
};
declare type Pointer = (string | number | symbol)[];
declare type Proposer<T> = (path: Pointer, mutator: Mutator<T>) => void;
declare type Mutator<T> = (draft: Draft<T>) => T | void;
export declare function autoImmer<T extends Object>(target: T, propose: Proposer<T>): Auto<T>;
export declare function isAuto<T>(o: any): o is Auto<T>;
export {};
