/* eslint-disable @typescript-eslint/no-explicit-any */
import { scalar } from "common-types";
import { Model } from "~/models/Model";

export class AuditLogItem extends Model {
  value: scalar;
  recordId: string;
  /** the record-level operation */
  action: IAuditOperations;
  /** the changes to properties, typically not represented in a "removed" op */
  changes: IAuditChange[];
}

export interface IAuditChange {
  /** the property name which changed */
  property: string;
  /** the property level operation */
  action: IAuditOperations;
  before: any;
  after: any;
}

export type IAuditOperations = "added" | "updated" | "removed";

export interface IAuditRecordReference {
  id: string;
  createdAt: number;
  action: IAuditOperations;
}
