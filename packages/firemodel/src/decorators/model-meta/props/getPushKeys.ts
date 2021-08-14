import { ClassReflection } from "~/decorators";
import { keys } from "native-dash";


export function getPushKeys(klass: ClassReflection): string[] {
  const result: string[] = [];
  for (const prop of keys(klass.meta)) {
    if (klass.meta[prop].pushKey) {
      result.push(prop as string);
    }
  }

  return result;
}
