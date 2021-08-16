import {
  GooglePhoneAuthProvider,
  AuthCredential,
  PhoneAuthProvider_Instance,
  ApplicationVerifier,
  AuthProviderName,
} from '@forest-fire/types';

export class PhoneAuthProvider
  implements PhoneAuthProvider_Instance, GooglePhoneAuthProvider
{
  public static PROVIDER_ID: string = AuthProviderName.phone;
  public static PHONE_SIGN_IN_METHOD: string;

  public static credential(
    _verificationId: string,
    _verificationCode: string
  ): AuthCredential {
    throw new Error('not implemented');
  }

  public providerId: string = AuthProviderName.phone;
  public verifyPhoneNumber(
    _phoneNumber: string,
    _applicationVerifier: ApplicationVerifier
  ): Promise<string> {
    throw new Error('not-implemented');
  }
}
