export enum AuthApiType {
  admin = 'admin',
  client = 'client',
  noAuth = 'noAuth',
}

/**
 * this is a work in progress, but is meant to eventually be a complete
 * list of possible values for the `providerId` property in identifying
 * "providers" supported in Firebase's Auth API.
 */
export enum FirebaseAuthProvider {
  anonymous = 'anonymous',
  emailAndPassword = 'emailAndPassword',
}
