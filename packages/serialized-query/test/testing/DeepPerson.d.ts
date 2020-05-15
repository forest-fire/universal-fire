import { fk, Model } from 'firemodel';
import { IDictionary } from 'common-types';
export declare class DeepPerson extends Model {
    name: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    favoriteColor?: string;
    scratchpad?: IDictionary;
    tags?: IDictionary<string>;
    group: string;
    motherId?: fk;
    fatherId?: fk;
    children?: IDictionary;
    employerId?: fk;
}
