"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepPerson = void 0;
const firemodel_1 = require("firemodel");
const Company_1 = require("./Company");
let DeepPerson = /** @class */ (() => {
    var DeepPerson_1;
    let DeepPerson = DeepPerson_1 = class DeepPerson extends firemodel_1.Model {
    };
    __decorate([
        firemodel_1.property,
        firemodel_1.length(20)
    ], DeepPerson.prototype, "name", void 0);
    __decorate([
        firemodel_1.property
    ], DeepPerson.prototype, "age", void 0);
    __decorate([
        firemodel_1.property
    ], DeepPerson.prototype, "gender", void 0);
    __decorate([
        firemodel_1.property
    ], DeepPerson.prototype, "favoriteColor", void 0);
    __decorate([
        firemodel_1.property
    ], DeepPerson.prototype, "scratchpad", void 0);
    __decorate([
        firemodel_1.property,
        firemodel_1.pushKey
    ], DeepPerson.prototype, "tags", void 0);
    __decorate([
        firemodel_1.property
    ], DeepPerson.prototype, "group", void 0);
    __decorate([
        firemodel_1.ownedBy(() => DeepPerson_1, 'children')
    ], DeepPerson.prototype, "motherId", void 0);
    __decorate([
        firemodel_1.ownedBy(() => DeepPerson_1, 'children')
    ], DeepPerson.prototype, "fatherId", void 0);
    __decorate([
        firemodel_1.hasMany(() => DeepPerson_1)
    ], DeepPerson.prototype, "children", void 0);
    __decorate([
        firemodel_1.ownedBy(() => Company_1.Company)
    ], DeepPerson.prototype, "employerId", void 0);
    DeepPerson = DeepPerson_1 = __decorate([
        firemodel_1.model({ dbOffset: 'authenticated/:group' })
    ], DeepPerson);
    return DeepPerson;
})();
exports.DeepPerson = DeepPerson;
//# sourceMappingURL=DeepPerson.js.map