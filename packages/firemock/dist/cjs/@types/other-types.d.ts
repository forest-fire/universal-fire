import { IDictionary } from 'common-types';
/** named network delays */
export declare enum Delays {
    random = "random",
    weak = "weak-mobile",
    mobile = "mobile",
    WiFi = "WIFI"
}
export declare type DelayType = number | number[] | IDictionary<number> | Delays;
