export function dotNotation(path) {
    path = path.slice(0, 1) === '/' ? path.slice(1) : path;
    return path ? path.replace(/\//g, '.') : undefined;
}
//# sourceMappingURL=dotNotation.js.map