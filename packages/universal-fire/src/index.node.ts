export * from './proxy-symbols';

export type { IAdminAuth as IAuth } from '@forest-fire/types';
export type { IAdminConfig as IConfig } from '@forest-fire/types';

export type { RealTimeAdmin as IRealTime } from '@forest-fire/real-time-admin';
export type { FirestoreAdmin as IFirestore } from '@forest-fire/firestore-admin';

import { FirestoreAdmin as FSA } from '@forest-fire/firestore-admin';
import { RealTimeAdmin as RTA } from '@forest-fire/real-time-admin';
import { FirestoreClient as FC } from '@forest-fire/firestore-client';
import { RealTimeClient as RTC } from '@forest-fire/real-time-client';
import { IClientConfig, IMockConfig, IAdminConfig } from '@forest-fire/types';

export const FirestoreClient = {
  create(): FC {
    throw new Error(
      'You are using the node entry point for universal-fire; use FirestoreAdmin instead.'
    );
  },

  async connect(config: IClientConfig | IMockConfig): Promise<FC> {
    throw new Error(
      'You are using the node entry point for universal-fire; use FirestoreAdmin instead.'
    );
  },
};
export const RealTimeClient = {
  create(): RTC {
    throw new Error(
      'You are using the node entry point for universal-fire; use RealTimeAdmin instead.'
    );
  },

  async connect(config: IClientConfig | IMockConfig): Promise<RTC> {
    throw new Error(
      'You are using the node entry point for universal-fire; use RealTimeAdmin instead.'
    );
  },
};

export const FirestoreAdmin = {
  create(): FSA {
    return new FSA();
  },

  async connect(config: IAdminConfig | IMockConfig): Promise<FSA> {
    return FSA.connect(config);
  },
};
export const RealTimeAdmin = {
  create(): RTA {
    return new RTA();
  },

  async connect(config: IAdminConfig | IMockConfig): Promise<RTA> {
    return RTA.connect(config);
  },
};
