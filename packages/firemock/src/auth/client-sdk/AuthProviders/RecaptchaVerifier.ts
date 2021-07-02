import type {
  GoogleRecaptchaVerifier,
  RecaptchaVerifier_Instance,
} from '@forest-fire/types';

export class RecaptchaVerifier
  implements RecaptchaVerifier_Instance, GoogleRecaptchaVerifier {
  public type: string;

  public clear(): void {
    // TODO:
  }

  public render(): Promise<number> {
    throw new Error('not-implemented');
  }

  public verify(): Promise<string> {
    throw new Error('not-implemented');
  }
}
