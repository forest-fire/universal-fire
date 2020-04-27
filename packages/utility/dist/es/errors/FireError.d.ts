export declare class FireError extends Error {
    universalFire: boolean;
    kind: string;
    code: string;
    statusCode: number;
    constructor(message: string, classification?: string, statusCode?: number);
}
