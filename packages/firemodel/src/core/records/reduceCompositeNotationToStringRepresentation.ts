import { ICompositeKey } from "~/types";
import { keys } from "native-dash";
import { Model } from "~/models/Model";
/**
   * **_reduceCompositeNotationToStringRepresentation**
   *
   * Reduces a `ICompositeKey` hash into string representation of the form:
   *
```typescript
`${id}::${prop}:${propValue}::${prop2}:${propValue2}`
```
   */
export function reduceCompositeNotationToStringRepresentation<T extends Model = Model>(
  ck: ICompositeKey<T>
): string {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const others = keys(ck).filter((k) => k !== "id").map((k) => `::${k}:${ck[k]}`);
  return `${ck.id}${others.join("")}`
}
