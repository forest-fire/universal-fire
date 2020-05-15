"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Person = void 0;
const firemodel_1 = require("firemodel");
const Company_1 = require("./Company");
let Person = /** @class */ (() => {
    var Person_1;
    let Person = Person_1 = class Person extends firemodel_1.Model {
    };
    __decorate([
        firemodel_1.property,
        firemodel_1.length(20)
    ], Person.prototype, "name", void 0);
    __decorate([
        firemodel_1.property
    ], Person.prototype, "age", void 0);
    __decorate([
        firemodel_1.property
    ], Person.prototype, "gender", void 0);
    __decorate([
        firemodel_1.property
    ], Person.prototype, "favoriteColor", void 0);
    __decorate([
        firemodel_1.property
    ], Person.prototype, "scratchpad", void 0);
    __decorate([
        firemodel_1.property,
        firemodel_1.pushKey
    ], Person.prototype, "tags", void 0);
    __decorate([
        firemodel_1.ownedBy(() => Person_1, 'children')
    ], Person.prototype, "motherId", void 0);
    __decorate([
        firemodel_1.ownedBy(() => Person_1, 'children')
    ], Person.prototype, "fatherId", void 0);
    __decorate([
        firemodel_1.hasMany(() => Person_1)
    ], Person.prototype, "children", void 0);
    __decorate([
        firemodel_1.ownedBy(() => Company_1.Company)
    ], Person.prototype, "employerId", void 0);
    Person = Person_1 = __decorate([
        firemodel_1.model({ dbOffset: 'authenticated' })
    ], Person);
    return Person;
})();
exports.Person = Person;
//# sourceMappingURL=Person.js.map