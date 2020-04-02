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
var AbstractedDatabase = /** @class */ (function () {
    function AbstractedDatabase() {
        /**
         * Indicates if the database is using the admin SDK.
         */
        this._isAdminApi = false;
        /**
         * Indicates if the database is a mock database.
         */
        this._isMock = false;
    }
    AbstractedDatabase.connect = function (constructor, config) {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                db = new constructor();
                db._initializeApp(config);
                db._connect();
                return [2 /*return*/, db];
            });
        });
    };
    Object.defineProperty(AbstractedDatabase.prototype, "app", {
        /**
         * Returns the `_app`.
         */
        get: function () {
            if (this._app) {
                return this._app;
            }
            throw new Error('Attempt to access Firebase App without having instantiated it');
        },
        /**
         * Sets the `_app`.
         */
        set: function (value) {
            this._app = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AbstractedDatabase.prototype, "database", {
        /**
         * Returns the `_database`.
         */
        get: function () {
            return this._database;
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
    /**
     * Returns the authentication API of the database.
     */
    AbstractedDatabase.prototype.auth = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, import('@firebase/auth')];
                    case 1:
                        _a.sent();
                        if (this.app.auth) {
                            return [2 /*return*/, this.app.auth()];
                        }
                        throw new Error('Attempt to use auth module without having installed Firebase auth dependency');
                }
            });
        });
    };
    Object.defineProperty(AbstractedDatabase.prototype, "isAdminApi", {
        /**
         * Indicates if the database is using the admin SDK.
         */
        get: function () {
            return this._isAdminApi;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AbstractedDatabase.prototype, "isMockDb", {
        /**
         * Indicates if the database is a mock database.
         */
        get: function () {
            return this._isMock;
        },
        enumerable: true,
        configurable: true
    });
    return AbstractedDatabase;
}());
export { AbstractedDatabase };
//# sourceMappingURL=AbstractedDatabase.js.map