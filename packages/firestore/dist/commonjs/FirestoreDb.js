"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var database_1 = require("@forest-fire/database");
require("@firebase/firestore");
var FirestoreDb = /** @class */ (function (_super) {
    __extends(FirestoreDb, _super);
    function FirestoreDb() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return FirestoreDb;
}(database_1.Database));
exports.FirestoreDb = FirestoreDb;
//# sourceMappingURL=FirestoreDb.js.map