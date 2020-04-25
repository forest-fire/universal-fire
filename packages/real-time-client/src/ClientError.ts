export class ClientError extends Error {
  public kind: string = "ClientError";
  public code: string;
  constructor(
    message: string,
    classification: string = "abstracted-client/unknown"
  ) {
    super(message);
    const parts = classification.split("/");
    const [type, subType] =
      parts.length === 1 ? ["abstracted-client", parts[0]] : parts;
    this.name = `${type}/${subType}`;
    this.code = subType;
  }
}
