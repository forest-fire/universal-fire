import { FireError } from '@forest-fire/utility';
export declare class ClientError extends FireError {
    kind: string;
    constructor(message: string, classification?: string, statusCode?: number);
}
