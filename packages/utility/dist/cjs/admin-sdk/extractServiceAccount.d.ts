import { IServiceAccount, IAdminConfig, IMockConfig } from '@forest-fire/types';
/**
 * Takes as input a variety of possible formats and converts it into
 * a Firebase service account (`IServiceAccount`). The input formats
 * which it accepts are:
 *
 * - an `IServiceAccount` object (_in which case nothing to be done_)
 * - a JSON encoded string of the `IServiceAccount` object
 * - a base64 encoded string of a `IServiceAccount` object (_possible but not recommended
 * as an ENV variable may run out of room to encode_)
 * - a base64 encoded GZIP of a `IServiceAccount` object (_this is ideal for ENV vars
 * which have limited length and must be string_)
 */
export declare function extractServiceAccount(config?: IAdminConfig | IMockConfig): IServiceAccount;
