import { IFmCrudOperation } from "@/types";
import { IModel, ISdk } from "@forest-fire/types";

import { FireModelError } from "@/errors";
import { Record } from "@/core";
import { capitalize } from "@/util";

export class RecordCrudFailure<T extends IModel> extends FireModelError<T> {
  constructor(
    rec: Record<ISdk, T>,
    crudAction: IFmCrudOperation,
    transactionId: string,
    e?: Error
  ) {
    super(
      "",
      e.name !== "Error" ? e.name : `firemodel/record-${crudAction}-failure`
    );
    const message = `Attempt to "${crudAction}" "${capitalize(
      rec.modelName
    )}::${rec.id}" failed [ ${transactionId} ] ${e ? e.message : "for unknown reasons"
      }`;
    this.message = message;
    this.stack = e.stack;
  }
}
