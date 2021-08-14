import { ClassReflection } from "~/decorators/utils";

export function isRelationship(klass: ClassReflection): (prop: string) => boolean {
  return (prop) => {
    return klass.meta[prop]?.isRelationship ? true : false;
  };
}