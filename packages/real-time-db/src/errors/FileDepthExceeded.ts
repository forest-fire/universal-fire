export class FileDepthExceeded extends Error {
  public code: string;
  constructor(e: Error) {
    super(e.message);
    this.stack = e.stack;
    const name = 'RealTimeDb/depth-exceeded';
    if (e.name === 'Error') {
      this.name = name;
    }
    this.code = name.split('/')[1];
    this.stack = e.stack;
  }
}
