export declare class ClientError extends Error {
    kind: string;
    code: string;
    constructor(message: string, classification?: string);
}
