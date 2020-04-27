/**
 * Returns an array of named apps that are running under
 * Firebase's control (admin API)
 */
export function runningApps(apps) {
    return apps.filter(i => i !== null).map(i => i.name);
}
//# sourceMappingURL=runningApps.js.map