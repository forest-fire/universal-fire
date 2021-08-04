import { model, Model, property, mock } from "firemodel";

@model({ dbOffset: 'authenticated' })
export class Product extends Model<Product> {
  @property @mock('name') name: string;
  @property category: string;
  @property @mock('number', { min: 10, max: 100 }) minCost?: number;
  @property isInStock: boolean;
}
