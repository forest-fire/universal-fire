import { length, model, Model, property } from 'firemodel';

@model({ dbOffset: 'authenticated', audit: true })
export class Company extends Model {
  @property @length(20) public name: string;
  @property public employees?: number;
  @property public founded?: string;
}
