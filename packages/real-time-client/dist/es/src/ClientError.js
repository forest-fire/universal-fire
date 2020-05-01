import { FireError } from '@forest-fire/utility';
export class ClientError extends FireError {
    constructor(message, classification = 'RealTimeClient/unknown', statusCode = 400) {
        super(message, classification, 400);
        this.kind = 'RealTimeClient';
    }
}
//# sourceMappingURL=ClientError.js.map