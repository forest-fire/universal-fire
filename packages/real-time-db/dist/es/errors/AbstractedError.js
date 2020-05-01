export class AbstractedError extends Error {
    constructor(
    /** a human friendly error message */
    message, 
    /**
     * either of the syntax `type/subType` or alternatively just
     * `subType` where type will be defaulted to **RealTimeDb**
     */
    errorCode) {
        super(message);
        const parts = errorCode.split('/');
        const [type, subType] = parts.length === 1 ? ['RealTimeDb', parts[0]] : parts;
        this.name = `${type}/${subType}`;
        this.code = subType;
    }
}
