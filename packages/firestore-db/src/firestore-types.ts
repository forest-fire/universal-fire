import type { FirestoreDb } from "./index";
import type { AbstractedDatabase } from "@forest-fire/abstracted-database";


/**
 * Because Typescript can't type a _chain_ of dependencies (aka., A => B => C),
 * we have created this type represents the full typing of `RealTimeDb`
 */
export type IFirestoreDb = FirestoreDb & AbstractedDatabase;