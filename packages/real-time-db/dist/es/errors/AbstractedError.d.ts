export declare class AbstractedError extends Error {
    code: string;
    constructor(
    /** a human friendly error message */
    message: string, 
    /**
     * either of the syntax `type/subType` or alternatively just
     * `subType` where type will be defaulted to **RealTimeDb**
     */
    errorCode: string);
}
