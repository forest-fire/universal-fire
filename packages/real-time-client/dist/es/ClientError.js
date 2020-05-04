import { FireError } from '@forest-fire/utility';
import { HttpStatusCodes } from 'common-types';
export class ClientError extends FireError {
    constructor(
    /** a human friendly error message */
    message, 
    /**
     * either of the syntax `type/subType` or alternatively just
     * `subType` where type will be defaulted to **RealTimeDb**
     */
    classification, 
    /**
     * A numeric HTTP status code; defaults to 400 if not stated
     */
    httpStatusCode = HttpStatusCodes.BadRequest) {
        super(message, classification.includes('/')
            ? classification
            : `RealTimeClient/${classification}`, httpStatusCode);
    }
}
//# sourceMappingURL=ClientError.js.map