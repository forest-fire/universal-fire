import { UserCredential, ConfirmationResult } from "@forest-fire/types";
import { IPartialUserCredential } from "../../index";
export { UserCredential };
/**
 * takes a partial user auth and adds enough to make it officially
 * a full UserCrediental
 */
export declare function completeUserCredential(partial: IPartialUserCredential): UserCredential;
export declare const fakeApplicationVerifier: ConfirmationResult;
