import { FireModelProxyError, UnknownRelationshipProblem } from "~/errors";
import {
  FmEvents,
  ForeignKey,
  IFmLocalRelationshipEvent,
  IFmPathValuePair,
  IFmRelationshipOperation,
  IFmRelationshipOptions,
  IFmRelationshipOptionsForHasMany,
} from "~/types";
import { capitalize, getModelMeta } from "~/util";
import { createCompositeRef, locallyUpdateFkOnRecord } from "./index";

import { ConstructorFor, IDictionary } from "common-types";
import { IModel } from "~/types";
import { Record } from "~/core";
import { ISdk } from "@forest-fire/types";

/**
 * **relationshipOperation**
 *
 * updates the current Record while also executing the appropriate two-phased commit
 * with the `dispatch()` function; looking to associate with watchers wherever possible
 */
export async function relationshipOperation<
  S extends ISdk,
  TFrom extends IModel,
  TTo extends IModel = IModel
>(
  rec: Record<S, TFrom>,
  /**
   * **operation**
   *
   * The relationship operation that is being executed
   */
  operation: IFmRelationshipOperation,
  /**
   * **property**
   *
   * The property on this model which changing its relationship status in some way
   */
  property: keyof TFrom & string,
  /**
   * The array of _foreign keys_ (of the "from" model) which will be operated on
   */
  fkRefs: Array<ForeignKey<TTo>>,
  /**
   * **paths**
   *
   * a set of name value pairs where the `name` is the DB path that needs updating
   * and the value is the value to set.
   */
  paths: IFmPathValuePair[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _options: IFmRelationshipOptions<S> | IFmRelationshipOptionsForHasMany<S> = {}
): Promise<void> {
  // make sure all FK's are strings
  const fks = fkRefs.map((fk) => {
    return typeof fk === "object" ? createCompositeRef(fk) : fk;
  });
  const dispatchEvents = {
    set: [
      FmEvents.RELATIONSHIP_SET_LOCALLY,
      FmEvents.RELATIONSHIP_SET_CONFIRMATION,
      FmEvents.RELATIONSHIP_SET_ROLLBACK,
    ],
    clear: [
      FmEvents.RELATIONSHIP_REMOVED_LOCALLY,
      FmEvents.RELATIONSHIP_REMOVED_CONFIRMATION,
      FmEvents.RELATIONSHIP_REMOVED_ROLLBACK,
    ],
    // update: [
    //   FMEvents.RELATIONSHIP_UPDATED_LOCALLY,
    //   FMEvents.RELATIONSHIP_UPDATED_CONFIRMATION,
    //   FMEvents.RELATIONSHIP_UPDATED_ROLLBACK
    // ],
    add: [
      FmEvents.RELATIONSHIP_ADDED_LOCALLY,
      FmEvents.RELATIONSHIP_ADDED_CONFIRMATION,
      FmEvents.RELATIONSHIP_ADDED_ROLLBACK,
    ],
    remove: [
      FmEvents.RELATIONSHIP_REMOVED_LOCALLY,
      FmEvents.RELATIONSHIP_REMOVED_CONFIRMATION,
      FmEvents.RELATIONSHIP_REMOVED_ROLLBACK,
    ],
  };

  try {
    const [localEvent, confirmEvent, rollbackEvent] = dispatchEvents[operation];
    const fkConstructor = rec.META.relationship(property).fkConstructor() as unknown as ConstructorFor<TTo>;
    // TODO: fix the typing here to make sure fkConstructor knows it's type
    const fkRecord = new Record<S, TTo>(fkConstructor);
    const fkMeta = getModelMeta(fkRecord);
    const transactionId: string =
      "t-reln-" +
      Math.random().toString(36).substr(2, 5) +
      "-" +
      Math.random().toString(36).substr(2, 5);

    const event: Omit<IFmLocalRelationshipEvent<TFrom, TTo>, "type"> = {
      key: rec.compositeKeyRef,
      operation,
      property,
      kind: "relationship",
      eventType: "local",
      transactionId,
      fks,
      paths,
      from: capitalize(rec.modelName),
      to: capitalize(fkRecord.modelName),
      fromLocal: rec.localPath,
      toLocal: fkRecord.localPath,
      fromConstructor: rec.modelConstructor,
      toConstructor: fkRecord.modelConstructor,
    };

    const inverseProperty = rec.META.relationship(property).inverseProperty;
    if (inverseProperty) {
      event.inverseProperty = inverseProperty as keyof TTo;
    }

    try {
      await localRelnOp<S, TFrom, TTo>(rec, event, localEvent);
      await relnConfirmation(rec, event, confirmEvent);
    } catch (e) {
      await relnRollback(rec, event, rollbackEvent);
      throw new FireModelProxyError(
        e,
        `Encountered an error executing a relationship operation between the "${event.from
        }" model and "${event.to
        }". The paths that were being modified were: ${event.paths
          .map((i) => i.path)
          .join("- \n")}\n A dispatch for a rollback event has been issued.`
      );
    }
  } catch (e) {
    if (e.firemodel) {
      throw e;
    } else {
      throw new UnknownRelationshipProblem(e, rec, property, operation);
    }
  }
}

export async function localRelnOp<S extends ISdk, TFrom extends IModel, TTo extends IModel>(
  rec: Record<S, TFrom>,
  event: Omit<IFmLocalRelationshipEvent<TFrom, TTo>, "type">,
  type: FmEvents
): Promise<void> {
  try {
    // locally modify Record's values
    // const ids = extractFksFromPaths(rec, event.property, event.paths);
    event.fks.map((fk) => {
      locallyUpdateFkOnRecord<S, TFrom, TTo>(rec, fk, { ...event, type } as unknown as IFmLocalRelationshipEvent<TFrom, TTo>);
    });
    // local optimistic dispatch
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    rec.dispatch({ ...event, type });
    const ref = rec.db.ref("/");
    await (ref).update(
      event.paths.reduce((acc: IDictionary, curr) => {
        acc[curr.path] = curr.value;
        return acc;
      }, {})
    );
  } catch (e) {
    throw new FireModelProxyError(
      e,
      `While operating doing a local relationship operation ran into an error. Note that the "paths" passed in were:\n${JSON.stringify(
        event.paths
      )}.\n\nThe underlying error message was:`
    );
  }
}

export async function relnConfirmation<S extends ISdk, F extends IModel, T extends IModel>(
  rec: Record<S, F>,
  event: Omit<IFmLocalRelationshipEvent<F, T>, "type">,
  type: FmEvents
): Promise<void> {
  await rec.dispatch({ ...event, type });
}

export async function relnRollback<S extends ISdk, F extends IModel, T extends IModel>(
  rec: Record<S, F>,
  event: Omit<IFmLocalRelationshipEvent<F, T>, "type">,
  type: FmEvents
): Promise<void> {
  //
  /**
   * no writes will have actually been done to DB but
   * front end framework will need to know as it probably
   * adjusted _optimistically_
   */
  await rec.dispatch({ ...event, type });
}
