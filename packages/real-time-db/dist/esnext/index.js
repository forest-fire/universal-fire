export { RealTimeDb } from './db';
export { FileDepthExceeded } from './errors/FileDepthExceeded';
export { UndefinedAssignment } from './errors/UndefinedAssignment';
export { _getFirebaseType } from './util';
export * from './mockingSymbols';
export * from './types';
export function isMockConfig(config = {}) {
    return config.mocking === true;
}
export function isRealDbConfig(config) {
    return config.mocking !== true;
}
