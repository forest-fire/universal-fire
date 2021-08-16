import type { FirebaseNamespace, IClientAuth } from '@forest-fire/types';
import { Auth } from './Auth';
import { EmailAuthProvider } from './EmailAuthProvider';
import { FacebookAuthProvider } from './FacebookAuthProvider';
import { GithubAuthProvider } from './GithubAuthProvider';
import { GoogleAuthProvider } from './GoogleAuthProvider';
import { TwitterAuthProvider } from './TwitterAuthProvider';
import { SAMLAuthProvider } from './SAMLAuthProvider';
import { OAuthProvider } from './OAuthProvider';
import { PhoneAuthProvider } from './PhoneAuthProvider';
import { RecaptchaVerifier } from './RecaptchaVerifier';

/**
 * The mocked Auth API for a Client SDK
 */
const authProviders: Partial<FirebaseNamespace['auth']> = {
  Auth: Auth as unknown as FirebaseNamespace['auth']['Auth'],
  EmailAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  TwitterAuthProvider,
  SAMLAuthProvider,
  OAuthProvider,
  PhoneAuthProvider,
  RecaptchaVerifier,
};

const fn = (): IClientAuth => {
  throw new Error('not allowed');
};

export default (authProviders || fn) as FirebaseNamespace['auth'];
