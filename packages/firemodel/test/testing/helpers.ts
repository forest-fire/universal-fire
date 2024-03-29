/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import "./test-console"; // TS declaration

import * as fs from "fs";
import * as process from "process";
import * as yaml from "js-yaml";

import { first, keys, last } from "native-dash";
import { stderr, stdout } from "test-console";

import { IDictionary } from "common-types";

// tslint:disable-next-line
interface Console {
  _restored: boolean;
  // Console: typeof NodeJS.Console;
  assert(value: any, message?: string, ...optionalParams: any[]): void;
  dir(
    obj: any,
    options?: { showHidden?: boolean; depth?: number; colors?: boolean }
  ): void;
  error(message?: any, ...optionalParams: any[]): void;
  info(message?: any, ...optionalParams: any[]): void;
  log(message?: any, ...optionalParams: any[]): void;
  time(label: string): void;
  timeEnd(label: string): void;
  trace(message?: any, ...optionalParams: any[]): void;
  warn(message?: any, ...optionalParams: any[]): void;
}

declare let console: Console;

export function restoreStdoutAndStderr(): void {
  console._restored = true;
}

export async function wait(ms: number): Promise<unknown> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function timeout(ms: number): Promise<unknown> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface IStagedVariables {
  dev: IDictionary;
  test: IDictionary;
  stage: IDictionary;
  prod: IDictionary;
}

let envIsSetup = false;
const stage = (process.env.AWS_STAGE || "dev") as keyof IStagedVariables &
  string;
export function setupEnv() {
  if (!envIsSetup) {
    if (!stage) {
      process.env.AWS_STAGE = "test";
    }
    const yamlConfig = yaml.load(
      fs.readFileSync("./env.yml", "utf8")
    ) as IStagedVariables;
    if (typeof yamlConfig === "string") {
      throw new Error(
        `Attempt to setup the test environment failed as env.yml was not brought in as a dictionary!`
      );
    }
    const combined = {
      ...yamlConfig[stage],
      ...process.env,
    };
    console.log(`ENV setup for "${stage}" stage:`);

    Object.keys(combined).forEach((key) => (process.env[key] = combined[key]));
    envIsSetup = true;

    return combined;
  }
}

export function ignoreStdout() {
  const rStdout = stdout.ignore();
  const restore = () => {
    rStdout();
    console._restored = true;
  };

  return restore;
}

export function captureStdout(): () => any {
  const rStdout: IAsyncStreamCallback = stdout.inspect();
  const restore = (): string[] => {
    rStdout.restore();
    console._restored = true;
    return rStdout.output;
  };

  return restore;
}

export function captureStderr(): () => any {
  const rStderr: IAsyncStreamCallback = stderr.inspect();
  const restore = (): string[] => {
    rStderr.restore();
    console._restored = true;
    return rStderr.output;
  };

  return restore;
}

export function ignoreStderr() {
  const rStdErr = stderr.ignore();
  const restore = () => {
    rStdErr();
    console._restored = true;
  };

  return restore;
}

export function ignoreBoth() {
  const rStdOut = stdout.ignore();
  const rStdErr = stderr.ignore();
  const restore = () => {
    rStdOut();
    rStdErr();
    console._restored = true;
  };

  return restore;
}

/**
 * The first key in a Hash/Dictionary
 */
export function firstKey<T = any>(dictionary: IDictionary<T>): string {
  return first(Object.keys(dictionary || {}));
}

/**
 * The first record in a Hash/Dictionary of records
 */
export function firstRecord<T extends IDictionary>(dictionary: T): T[keyof T] {
  if (!dictionary) {
    throw new Error("firstRecord() test util used but dictionary passed in was undefined!")
  }
  return dictionary[this.firstKey(dictionary || {})];
}

/**
 * The last key in a Hash/Dictionary
 */
export function lastKey<T extends IDictionary>(listOf: T): string & keyof T {
  return last(Object.keys(listOf || {}));
}

/**
 * The last record in a Hash/Dictionary of records
 */
export function lastRecord<T extends IDictionary>(dictionary: T): T[keyof T] {
  return dictionary[this.lastKey(dictionary)];
}

export function valuesOf<T extends IDictionary>(listOf: T, property: keyof T): T[keyof T][keyof T][] {
  const k = keys(listOf);
  return k.map((key) => {
    const item = listOf[key];
    return item[property];
  });
}

export function length(listOf: IDictionary): number {
  return listOf ? Object.keys(listOf).length : 0;
}
