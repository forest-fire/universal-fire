import { Omit } from 'common-types';
import { notImplemented } from "./notImplemented";
import type { FirebaseAuth } from '@forest-fire/types';
export declare const implemented: Omit<FirebaseAuth, keyof typeof notImplemented>;
