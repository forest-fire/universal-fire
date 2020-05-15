"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Company = void 0;
const firemodel_1 = require("firemodel");
let Company = /** @class */ (() => {
    let Company = class Company extends firemodel_1.Model {
    };
    __decorate([
        firemodel_1.property,
        firemodel_1.length(20)
    ], Company.prototype, "name", void 0);
    __decorate([
        firemodel_1.property
    ], Company.prototype, "employees", void 0);
    __decorate([
        firemodel_1.property
    ], Company.prototype, "founded", void 0);
    Company = __decorate([
        firemodel_1.model({ dbOffset: 'authenticated', audit: true })
    ], Company);
    return Company;
})();
exports.Company = Company;
//# sourceMappingURL=Company.js.map