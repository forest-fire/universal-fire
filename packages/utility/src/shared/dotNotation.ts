export function dotNotation(path: string) {
  path = path.slice(0, 1) === '/' ? path.slice(1) : path;
  return path ? path.replace(/\//g, '.') : undefined;
}
