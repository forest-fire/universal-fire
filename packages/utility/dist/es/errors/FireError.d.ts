export declare class FireError extends Error {
    universalFire: boolean;
    kind: string;
    code: string;
    statusCode: number;
    constructor(message: string, 
    /**
     * a type/subtype of the error or you can just state the "subtype"
     * and it will
     */
    classification?: string, statusCode?: number);
}
