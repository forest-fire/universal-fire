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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { AbstractedDatabase } from 'abstracted-database';
var FirestoreDb = /** @class */ (function (_super) {
    __extends(FirestoreDb, _super);
    function FirestoreDb() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(FirestoreDb.prototype, "database", {
        /**
         * Returns the `_database`.
         */
        get: function () {
            if (this._database) {
                return this._database;
            }
            throw new Error('Attempt to use Firestore without having instantiated it');
        },
        /**
         * Sets the `_database`.
         */
        set: function (value) {
            this._database = value;
        },
        enumerable: true,
        configurable: true
    });
    FirestoreDb.prototype._isCollection = function (path) {
        if (typeof path === 'string') {
            return path.split('/').length % 2 === 0;
        }
        // Just for now.
        throw new Error('Serialized queries are not supported by Firestore');
    };
    FirestoreDb.prototype._isDocument = function (path) {
        return this._isCollection(path) === false;
    };
    Object.defineProperty(FirestoreDb.prototype, "mock", {
        get: function () {
            throw new Error('Not implemented');
        },
        enumerable: true,
        configurable: true
    });
    FirestoreDb.prototype.getList = function (path, idProp) {
        return __awaiter(this, void 0, void 0, function () {
            var querySnapshot;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database.collection(path).get()];
                    case 1:
                        querySnapshot = _a.sent();
                        return [2 /*return*/, querySnapshot.docs.map(function (doc) {
                                var _a;
                                return __assign((_a = {}, _a[idProp] = doc.id, _a), doc.data());
                            })];
                }
            });
        });
    };
    FirestoreDb.prototype.getPushKey = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.database.collection(path).doc().id];
            });
        });
    };
    FirestoreDb.prototype.getRecord = function (path, idProp) {
        return __awaiter(this, void 0, void 0, function () {
            var documentSnapshot;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.database.doc(path).get()];
                    case 1:
                        documentSnapshot = _b.sent();
                        return [2 /*return*/, __assign(__assign({}, documentSnapshot.data()), (_a = {}, _a[idProp] = documentSnapshot.id, _a))];
                }
            });
        });
    };
    FirestoreDb.prototype.getValue = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Not implemented');
            });
        });
    };
    FirestoreDb.prototype.add = function (path, value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database.collection(path).add(value)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    FirestoreDb.prototype.update = function (path, value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database.doc(path).update(value)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    FirestoreDb.prototype.set = function (path, value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Not implemented');
            });
        });
    };
    FirestoreDb.prototype.remove = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var pathIsCollection;
            return __generator(this, function (_a) {
                pathIsCollection = this._isCollection(path);
                if (pathIsCollection) {
                    this._removeCollection(path);
                }
                else {
                    this._removeDocument(path);
                }
                return [2 /*return*/];
            });
        });
    };
    FirestoreDb.prototype.watch = function (target, events, cb) {
        throw new Error('Not implemented');
    };
    FirestoreDb.prototype.unWatch = function (events, cb) {
        throw new Error('Not implemented');
    };
    FirestoreDb.prototype.ref = function (path) {
        if (path === void 0) { path = '/'; }
        throw new Error('Not implemented');
    };
    FirestoreDb.prototype._removeDocument = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database.doc(path).delete()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    FirestoreDb.prototype._removeCollection = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var batch;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        batch = this.database.batch();
                        this.database.collection(path).onSnapshot(function (snapshot) {
                            snapshot.docs.forEach(function (doc) {
                                batch.delete(doc.ref);
                            });
                        });
                        // All or nothing.
                        return [4 /*yield*/, batch.commit()];
                    case 1:
                        // All or nothing.
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return FirestoreDb;
}(AbstractedDatabase));
export { FirestoreDb };
//# sourceMappingURL=FirestoreDb.js.map