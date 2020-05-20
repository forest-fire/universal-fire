/**
 * Returns an array of named apps that are running under
 * Firebase's control (admin API)
 */
export function getRunningApps(apps) {
    return apps.filter((i) => i !== null).map((i) => i.name);
}
//# sourceMappingURL=getRunningApps.js.map