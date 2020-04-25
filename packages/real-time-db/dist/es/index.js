export { RealTimeDb } from './RealTimeDb';
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
//TODO: Clean this file up; should ONLY be exports not function definitions!
export * from './RealTimeDb';
