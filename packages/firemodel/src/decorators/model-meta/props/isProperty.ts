import { ClassReflection } from "~/decorators/utils";

export function isProperty(klass: ClassReflection) {
  return (prop: string): boolean => {
    return klass.meta[prop]?.isProperty ? true : false;
  };
}