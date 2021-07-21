import { DefaultDbCache, FireModel, Record } from "~/core";
import { IAuditChange, IAuditOperations, IModelOptions } from "~/types";

import { AuditLog } from "~/models";
import { capitalize } from "~/util";
import { ISdk } from "@forest-fire/types";

/**
 * writeAudit
 *
 * Allows for a consistent way of writing audit records to the database
 *
 * @param recordId the ID of the record which is changing
 * @param pluralName the plural name of the Model type
 * @param action CRUD action
 * @param changes array of changes
 * @param options
 */
export async function writeAudit<T>(
  record: Record<ISdk, T>,
  action: IAuditOperations,
  changes: IAuditChange[],
  options: IModelOptions = {}
): Promise<void> {
  const db = options.db || DefaultDbCache().get();
  await Record.add(
    AuditLog,
    {
      modelName: capitalize(record.modelName),
      modelId: record.id,
      action,
      changes,
    },
    { db }
  );
}
