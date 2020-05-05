import {
  fk,
  hasMany,
  length,
  model,
  Model,
  ownedBy,
  property,
  pushKey
} from 'firemodel';
import { IDictionary } from 'common-types';

import { Company } from './Company';

@model({ dbOffset: 'authenticated/:group' })
export class DeepPerson extends Model {
  @property @length(20) name: string;
  @property age?: number;
  @property gender?: 'male' | 'female' | 'other';
  @property favoriteColor?: string;
  @property scratchpad?: IDictionary;
  @property @pushKey tags?: IDictionary<string>;
  @property group: string;

  @ownedBy(() => DeepPerson, 'children') motherId?: fk;
  @ownedBy(() => DeepPerson, 'children') fatherId?: fk;
  @hasMany(() => DeepPerson) children?: IDictionary;
  @ownedBy(() => Company) employerId?: fk;
}
