import { FireError } from '@forest-fire/utility';
export declare class RealTimeAdminError extends FireError {
    kind: string;
    constructor(message: string, classification?: string, statusCode?: number);
}
