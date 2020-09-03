import { AuthApiType, IAdminAuth, IClientAuth } from '../../index';

export interface INoAuth {
  kind: AuthApiType.noAuth;
}

export type IAuthApi = IClientAuth | IAdminAuth;
