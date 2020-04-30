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

@model({ dbOffset: 'authenticated' })
export class Person extends Model {
  @property @length(20) public name: string;
  @property public age?: number;
  @property public gender?: 'male' | 'female' | 'other';
  @property public favoriteColor?: string;
  @property public scratchpad?: IDictionary;
  @property @pushKey public tags?: IDictionary<string>;

  @ownedBy(() => Person, 'children') public motherId?: fk;
  @ownedBy(() => Person, 'children') public fatherId?: fk;
  @hasMany(() => Person) public children?: IDictionary;
  @ownedBy(() => Company) public employerId?: fk;
}
