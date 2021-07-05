import './test-console'; // TS declaration
// import '~/global.d.ts';

import * as fs from 'fs';
import * as process from 'process';
import * as yaml from 'js-yaml';

import { stderr, stdout } from 'test-console';

// tslint:disable:no-implicit-dependencies
import { IDictionary } from 'common-types';
import first from 'lodash.first';
import last from 'lodash.last';

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

declare var console: Console;

export function restoreStdoutAndStderr() {
  console._restored = true;
}

export async function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function setupEnv() {
  if (!process.env.AWS_STAGE) {
    process.env.AWS_STAGE = 'test';
  }
  const stage = process.env.AWS_STAGE || process.env.NODE_ENV || 'test';
  process.env.AWS_STAGE = stage;
  process.env.NODE_ENV = stage;

  const current = process.env;
  const yamlConfig = yaml.safeLoad(fs.readFileSync('./env.yml', 'utf8'));
  const combined = {
    ...yamlConfig[stage],
    ...process.env,
  };

  Object.keys(combined).forEach((key) => (process.env[key] = combined[key]));
  return combined;
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
  const restore = () => {
    rStdout.restore();
    console._restored = true;
    return rStdout.output;
  };

  return restore;
}

export function captureStderr(): () => any {
  const rStderr: IAsyncStreamCallback = stderr.inspect();
  const restore = () => {
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
export function firstKey<T = any>(dictionary: IDictionary<T>) {
  return first(Object.keys(dictionary));
}

/**
 * The first record in a Hash/Dictionary of records
 */
export function firstRecord<T = any>(dictionary: IDictionary<T>) {
  return dictionary[firstKey(dictionary) as keyof typeof dictionary];
}

/**
 * The last key in a Hash/Dictionary
 */
export function lastKey<T = any>(listOf: IDictionary<T>) {
  return last(Object.keys(listOf));
}

/**
 * The last record in a Hash/Dictionary of records
 */
export function lastRecord<T = any>(dictionary: IDictionary<T>) {
  return dictionary[lastKey(dictionary) as keyof typeof dictionary];
}

export function valuesOf<T = any>(listOf: IDictionary<T>, property: string) {
  const keys: any[] = Object.keys(listOf);
  return keys.map((key: any) => {
    const item: IDictionary = listOf[key];
    return item[property];
  });
}

export function length(listOf: IDictionary) {
  return listOf ? Object.keys(listOf).length : 0;
}
