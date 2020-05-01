import { FireError } from '@forest-fire/utility';
export declare class RealTimeDbError extends FireError {
    constructor(
    /** a human friendly error message */
    message: string, 
    /**
     * either of the syntax `type/subType` or alternatively just
     * `subType` where type will be defaulted to **RealTimeDb**
     */
    classification: string, 
    /**
     * A numeric HTTP status code; defaults to 400 if not stated
     */
    httpStatusCode?: number);
}
