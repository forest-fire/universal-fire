import { IDictionary } from "common-types";
export interface ISimplifiedDb extends IDictionary {
    constructor: {
        name: string;
    };
}
export declare class SerializedQuery {
    static create(db: ISimplifiedDb, path?: string): any;
}
