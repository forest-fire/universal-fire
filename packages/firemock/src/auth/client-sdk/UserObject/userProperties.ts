import { User } from "@forest-fire/types";
import { getRandomMockUid, getAnonymousUid } from "../../state-mgmt/index";

export const userProperties: () => Partial<User> = () => ({
  displayName: "",
  email: "",
  isAnonymous: true,
  metadata: {},
  phoneNumber: "",
  photoURL: "",
  providerData: [],
  providerId: "",
  refreshToken: "",
  uid: getAnonymousUid(),
});
