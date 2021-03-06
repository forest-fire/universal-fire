export class FireError extends Error {
  public universalFire = true;
  public kind: string = 'FireError';
  public code: string;
  public statusCode: number;
  constructor(
    message: string,
    /**
     * a type/subtype of the error or you can just state the "subtype"
     * and it will
     */
    classification: string = 'UniversalFire/error',
    statusCode: number = 400
  ) {
    super(message);
    const parts = classification.split('/');
    const klass = this.constructor.name;
    this.name = parts.length === 2 ? classification : `${klass}/${parts[0]}`;
    this.code = parts.length === 2 ? parts[1] : parts[0];
    this.kind = parts[0];
    this.statusCode = statusCode;
  }
}
