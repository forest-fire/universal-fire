export interface IAsyncStreamCallback {
  output: string[];
  restore(): void;
}

export type AsyncIgnoreCallback = () => void;

export interface ITestStream {
  inspect(): IAsyncStreamCallback;
  ignore(): AsyncIgnoreCallback;
  inspectSync(): string[];
  ignoreSync(): void;
}
