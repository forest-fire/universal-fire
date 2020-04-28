/** Gets the  */
export function getRunningFirebaseApp(name, apps) {
    return name
        ? apps.find(i => i && i.name === name)
        : undefined;
}
//# sourceMappingURL=getRunningFirebaseApp.js.map