/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { IDictionary } from "common-types";
import { first, last } from "lodash";
import * as fs from "fs";
import * as yaml from "js-yaml";
import * as process from "process";

export async function timeout(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms, null));
}

export function setupEnv(): void {
  if (!process.env.AWS_STAGE) {
    process.env.AWS_STAGE = "test";
  }

  if (process.env.MOCK === undefined) {
    process.env.MOCK = 'true';
  }
  const yamlConfig = yaml.load(
    fs.readFileSync('./env.yml', 'utf8')
  ) as IDictionary;
  const combined = {
    ...yamlConfig[process.env.AWS_STAGE],
    ...process.env
  };

  Object.keys(combined).forEach(key => (process.env[key] = combined[key]));
  return combined;
}


/**
 * The first key in a Hash/Dictionary
 */
export function firstKey<T extends IDictionary>(dictionary: T): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return first(Object.keys(dictionary));
}

/**
 * The first record in a Hash/Dictionary of records
 */
export function firstRecord<T extends IDictionary>(dictionary: T): any {
  return dictionary[this.firstKey(dictionary)];
}

/**
 * The last key in a Hash/Dictionary
 */
export function lastKey<T extends any>(dictionary: T): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return last(Object.keys(dictionary));
}

/**
 * The last record in a Hash/Dictionary of records
 */
export function lastRecord<T extends IDictionary>(dictionary: T): string {
  return dictionary[this.lastKey(dictionary)];
}

export function valuesOf<T extends IDictionary, K extends keyof T & string>(listOf: T, property: K): T[K][] {
  const keys = Object.keys(listOf);
  return keys.map((key: string) => {
    const item: IDictionary = listOf[key];
    return item[property];
  });
}

export function length(listOf: IDictionary): number {
  return listOf ? Object.keys(listOf).length : 0;
}
