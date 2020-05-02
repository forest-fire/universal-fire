/// <reference types="faker" />
import { IDictionary } from "common-types";
export declare class MockHelper {
    context?: IDictionary<any> | undefined;
    constructor(context?: IDictionary<any> | undefined);
    get faker(): Faker.FakerStatic;
}
