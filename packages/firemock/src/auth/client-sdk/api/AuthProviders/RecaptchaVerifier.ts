import type {
  GoogleRecaptchaVerifier,
  RecaptchaVerifier_Instance,
} from '@forest-fire/types';

export class RecaptchaVerifier
  implements RecaptchaVerifier_Instance, GoogleRecaptchaVerifier {
  public type: string;

  public clear() {
    //
  }

  public async render(): Promise<number> {
    throw new Error('not-implemented');
  }

  public async verify(): Promise<string> {
    throw new Error('not-implemented');
  }
}
