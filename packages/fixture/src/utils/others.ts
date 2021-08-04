/** converts a '/' delimited path to a '.' delimited one */
export function dotNotation(path: string): string {
  path = path.slice(0, 1) === '/' ? path.slice(1) : path;
  return path ? path.replace(/\//g, '.') : undefined;
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}