import { ICompositeKey } from "@/types";
import { IModel } from "@forest-fire/types";
import { keys } from "native-dash";

/**
   * **_reduceCompositeNotationToStringRepresentation**
   *
   * Reduces a `ICompositeKey` hash into string representation of the form:
   *
```typescript
`${id}::${prop}:${propValue}::${prop2}:${propValue2}`
```
   */
export function reduceCompositeNotationToStringRepresentation<T extends IModel = IModel>(
  ck: ICompositeKey<T>
): string {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const others = keys(ck).filter((k) => k !== "id").map((k) => `::${k}:${ck[k]}`);
  return `${ck.id}${others.join("")}`
}
