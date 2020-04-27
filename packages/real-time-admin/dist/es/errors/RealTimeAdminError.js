import { FireError } from '@forest-fire/utility';
export class RealTimeAdminError extends FireError {
    constructor(message, classification = 'RealTimeAdmin/error', statusCode = 400) {
        super(message, classification, statusCode);
        this.kind = 'RealTimeAdminError';
    }
}
//# sourceMappingURL=RealTimeAdminError.js.map