import { IFmModelPropertyMeta, Model, NamedFakes } from "firemodel";
import { PropertyNamePatterns, fakeIt } from "./index";
import { IDictionary } from "brilliant-errors";
import faker from "faker";

export function mockValue<T extends Model>(
  propMeta: IFmModelPropertyMeta<T>,
  context: IDictionary,
  ...rest: any[]
) {
  context = propMeta;
  const { type, mockType, mockParameters } = propMeta;

  if (mockType) {
    // MOCK is defined
    return typeof mockType === "function"
      ? mockType(faker)
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
