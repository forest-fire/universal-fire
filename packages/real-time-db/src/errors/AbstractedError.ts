export class AbstractedError extends Error {
  public code: string;
  constructor(
    /** a human friendly error message */
    message: string,
    /**
     * either of the syntax `type/subType` or alternatively just
     * `subType` where type will be defaulted to **abstracted-firebase**
     */
    errorCode: string
  ) {
    super(message);
    const parts = errorCode.split("/");
    const [type, subType] =
      parts.length === 1 ? ["abstracted-firebase", parts[0]] : parts;
    this.name = `${type}/${subType}`;
    this.code = subType;
  }
}
