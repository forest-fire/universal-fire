/* eslint-disable @typescript-eslint/ban-types */
import { IFmModelMeta } from "~/types";
import { index, mock, model, property } from "~/decorators";
import { epochWithMilliseconds } from "common-types";

@model()
export class Model<C extends unknown = any> {
  // prettier-ignore
  // TODO: This should be made required and the API updated to make it optional where appropriate
  /** The primary-key for the record */
  @property public id?: string;
  // prettier-ignore
  /** The last time that a given record was updated */
  @property @mock("dateRecentMiliseconds") @index public lastUpdated?: epochWithMilliseconds;
  // prettier-ignore
  /** The datetime at which this record was first created */
  @property @mock("datePastMiliseconds") @index public createdAt?: epochWithMilliseconds;
  /** Metadata properties of the given schema */
  public META?: IFmModelMeta<C>;
}
