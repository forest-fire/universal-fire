import { model, Model, property, encrypt, index, fk, min } from 'firemodel';

@model()
export class Product extends Model<Product> {
  @property name: string;
  @property @index price: number;
  @property store: fk;
}
