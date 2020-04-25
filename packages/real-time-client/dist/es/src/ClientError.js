export class ClientError extends Error {
    constructor(message, classification = "abstracted-client/unknown") {
        super(message);
        this.kind = "ClientError";
        const parts = classification.split("/");
        const [type, subType] = parts.length === 1 ? ["abstracted-client", parts[0]] : parts;
        this.name = `${type}/${subType}`;
        this.code = subType;
    }
}
//# sourceMappingURL=ClientError.js.map