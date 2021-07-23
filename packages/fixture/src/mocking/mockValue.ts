import { IFmModelPropertyMeta, Model, NamedFakes } from "firemodel";
import { PropertyNamePatterns, fakeIt } from "./index";
import { IDatabaseSdk } from "@forest-fire/types";
import { IDictionary } from "brilliant-errors";

export function mockValue<T extends Model>(
  db: IDatabaseSdk<any>,
  propMeta: IFmModelPropertyMeta<T>,
  context: IDictionary,
  ...rest: any[]
) {
  context = propMeta;
  const { type, mockType, mockParameters } = propMeta;

  if (mockType) {
    // MOCK is defined
    return typeof mockType === "function"
      ? mockType(context)
      : fakeIt(
        context,
        mockType as keyof typeof NamedFakes,
        ...(mockParameters || [])
      );
  } else {
    // MOCK is undefined
    const fakedMockType = (Object.keys(NamedFakes).includes(propMeta.property)
      ? PropertyNamePatterns[propMeta.property]
      : type) as keyof typeof NamedFakes;
    return fakeIt<T>(context, fakedMockType, ...(mockParameters || []));
  }
}
