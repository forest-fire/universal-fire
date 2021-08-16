import "reflect-metadata";

import { propertyReflector } from "~/decorators/utils/propertyReflector";

export const index = propertyReflector(
  {
    isIndex: true,
    isUniqueIndex: false,
  }
);

export const uniqueIndex = propertyReflector(
  {
    isIndex: true,
    isUniqueIndex: true,
  }
);
