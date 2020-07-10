export * from './proxy-symbols';

export type { RealTimeClient as IRealTimeClient } from '@forest-fire/real-time-client';
export type { FirestoreClient as IFirestoreClient } from '@forest-fire/firestore-client';

import type { RealTimeAdmin as IRealTimeAdmin } from '@forest-fire/real-time-admin';
import type { FirestoreAdmin as IFirestoreAdmin } from '@forest-fire/firestore-admin';
import { FirestoreClient as FC } from '@forest-fire/firestore-client';
import { RealTimeClient as RTC } from '@forest-fire/real-time-client';
import { IClientConfig, IMockConfig } from '@forest-fire/types';

export const FirestoreClient = {
  create(): FC {
    return new FC();
  },

  async connect(config: IClientConfig | IMockConfig): Promise<FC> {
    return FC.connect(config);
  },
};
export const RealTimeClient = {
  create(): RTC {
    return new RTC();
  },

  async connect(config: IClientConfig | IMockConfig): Promise<RTC> {
    return RTC.connect(config);
  },
};

export const FirestoreAdmin = {
  create(): IFirestoreAdmin {
    throw new Error(
      'You are using the client/browser entry point for universal-fire; use RealTimeClient instead.'
    );
  },

  async connect(...args: any[]): Promise<IFirestoreAdmin> {
    throw new Error(
      'You are using the client/browser entry point for universal-fire; use RealTimeClient instead.'
    );
  },
};
export const RealTimeAdmin = {
  create(): IRealTimeAdmin {
    throw new Error(
      'You are using the client/browser entry point for universal-fire; use RealTimeClient instead.'
    );
  },

  async connect(...args: any[]): Promise<IRealTimeAdmin> {
    throw new Error(
      'You are using the client/browser entry point for universal-fire; use RealTimeClient instead.'
    );
  },
};
