import type { GoogleRecaptchaVerifier, RecaptchaVerifier_Instance } from '@forest-fire/types';
export declare class RecaptchaVerifier implements RecaptchaVerifier_Instance, GoogleRecaptchaVerifier {
    type: string;
    clear(): void;
    render(): Promise<number>;
    verify(): Promise<string>;
}
