import { FireError } from '../index';
/** Gets the  */
export function getRunningFirebaseApp(name, apps) {
    const result = name
        ? apps.find(i => i && i.name === name)
        : undefined;
    if (!result) {
        throw new FireError(`Attempt to get the Firebase app named "${name}" failed`, 'invalid-app-name');
    }
    return result;
}
//# sourceMappingURL=getRunningFirebaseApp.js.map