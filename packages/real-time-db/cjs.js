"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

var convert = require("typed-conversions");
var serializedQuery = require("serialized-query");

class FirebaseDepthExceeded extends Error {
  constructor(e) {
    super(e.message);
    this.stack = e.stack;
    if (e.name === "Error") {
      e.name = "AbstractedFirebase";
    }
  }
}

class UndefinedAssignment extends Error {
  constructor(e) {
    super(e.message);
    this.stack = e.stack;
    if (e.name === "Error") {
      e.name = "AbstractedFirebase";
    }
  }
}

function slashNotation(path) {
  return path.substr(0, 5) === ".info"
    ? path.substr(0, 5) + path.substring(5).replace(/\./g, "/")
    : path.replace(/\./g, "/");
}

(function(FirebaseBoolean) {
  FirebaseBoolean[(FirebaseBoolean["true"] = 1)] = "true";
  FirebaseBoolean[(FirebaseBoolean["false"] = 0)] = "false";
})(exports.FirebaseBoolean || (exports.FirebaseBoolean = {}));
class RealTimeDB {
  constructor(config = {}) {
    this._waitingForConnection = [];
    this._onConnected = [];
    this._onDisconnected = [];
    this._debugging = false;
    this._mocking = false;
    this._allowMocking = false;
    if (config.mocking) {
      this.getFireMock();
    }
  }
  query(path) {
    return serializedQuery.SerializedQuery.path(path);
  }
  ref(path) {
    return this._mocking ? this.mock.ref(path) : RealTimeDB.connection.ref(path);
  }
  allowMocking() {
    this._allowMocking = true;
  }
  get mock() {
    if (!this._mocking && !this._allowMocking) {
      throw new Error(
        "You can not mock the database without setting mocking in the constructor"
      );
    }
    return this._mock;
  }
  resetMockDb() {
    this._resetMockDb();
  }
  async waitForConnection() {
    if (this.isConnected) {
      return Promise.resolve();
    }
    return new Promise(resolve => {
      const cb = () => {
        resolve();
      };
      this._waitingForConnection.push(cb);
    });
  }
  get isConnected() {
    return this._isConnected;
  }
  async set(path, value) {
    try {
      return this.ref(path).set(value);
    } catch (e) {
      if (
        e.message.indexOf(
          "path specified exceeds the maximum depth that can be written"
        ) !== -1
      ) {
        console.log("FILE DEPTH EXCEEDED");
        throw new FirebaseDepthExceeded(e);
      }
      if (e.name === "Error") {
        e.name = "AbstractedFirebaseSetError";
      }
      if (e.message.indexOf("First argument contains undefined in property") !== -1) {
        e.name = "FirebaseUndefinedValueAssignment";
        throw new UndefinedAssignment(e);
      }
      throw e;
    }
  }
  multiPathSet(base) {
    const mps = [];
    const ref = this.ref.bind(this);
    let callback;
    const api = {
      _basePath: base || "/",
      basePath(path) {
        if (path === undefined) {
          return api._basePath;
        }
        api._basePath = path;
        return api;
      },
      add(pathValue) {
        const exists = new Set(api.paths);
        if (pathValue.path.indexOf("/") === -1) {
          pathValue.path = "/" + pathValue.path;
        }
        if (exists.has(pathValue.path)) {
          const e = new Error(
            `You have attempted to add the path "${pathValue.path}" twice.`
          );
          e.code = "duplicate-path";
          throw e;
        }
        mps.push(pathValue);
        return api;
      },
      get paths() {
        return mps.map(i => i.path);
      },
      get fullPaths() {
        return mps.map(i => [api._basePath, i.path].join("/").replace(/[\/]{2,3}/g, "/"));
      },
      callback(cb) {
        callback = cb;
        return;
      },
      async execute() {
        const updateHash = {};
        const fullyQualifiedPaths = mps.map(i =>
          Object.assign({}, i, {
            path: [api._basePath, i.path].join("/").replace(/[\/]{2,3}/g, "/")
          })
        );
        fullyQualifiedPaths.map(item => {
          updateHash[item.path] = item.value;
        });
        return ref()
          .update(updateHash)
          .then(() => {
            if (callback) {
              callback(null, mps);
              return;
            }
          })
          .catch(e => {
            if (callback) {
              callback(e, mps);
            }
            throw e;
          });
      }
    };
    return api;
  }
  async update(path, value) {
    try {
      return this.ref(path).update(value);
    } catch (e) {
      if (e.name === "Error") {
        e.name = "AbstractedFirebaseUpdateError";
      }
      if (
        e.message.indexOf("First argument path specified exceeds the maximum depth") !==
        -1
      ) {
        e.name = "AbstractedFirebaseUpdateDepthError";
      }
      throw e;
    }
  }
  async remove(path, ignoreMissing = false) {
    const ref = this.ref(path);
    return ref.remove().catch(e => {
      if (ignoreMissing && e.message.indexOf("key is not defined") !== -1) {
        return Promise.resolve();
      }
      this.handleError(e, "remove", `attempt to remove ${path} failed: `);
    });
  }
  async getSnapshot(path) {
    return typeof path === "string"
      ? this.ref(slashNotation(path)).once("value")
      : path.setDB(this).execute();
  }
  async getValue(path) {
    const snap = await this.getSnapshot(path);
    return snap.val();
  }
  async getRecord(path, idProp = "id") {
    return this.getSnapshot(path).then(snap => {
      let object = snap.val();
      if (typeof object !== "object") {
        object = { value: snap.val() };
      }
      return Object.assign({}, object, { [idProp]: snap.key });
    });
  }
  async getList(path, idProp = "id") {
    return this.getSnapshot(path).then(snap => {
      return snap.val() ? convert.snapshotToArray(snap, idProp) : [];
    });
  }
  async getSortedList(query, idProp = "id") {
    return this.getSnapshot(query).then(snap => {
      return convert.snapshotToArray(snap, idProp);
    });
  }
  async push(path, value) {
    this.ref(path).push(value);
  }
  async exists(path) {
    return this.getSnapshot(path).then(snap => (snap.val() ? true : false));
  }
  handleError(e, name, message = "") {
    console.error(`Error ${message}:`, e);
    return Promise.reject({
      code: `firebase/${name}`,
      message: message + e.message || e
    });
  }
  async getFireMock() {
    try {
      const FireMock = await Promise.resolve(require("firemock"));
      this._mock = new FireMock.Mock();
      this._mock.db.resetDatabase();
      this._mocking = true;
      return FireMock;
    } catch (e) {
      console.error(`There was an error asynchronously loading Firemock library`, e);
      this._mocking = false;
    }
  }
}
RealTimeDB.isConnected = false;
RealTimeDB.isAuthorized = false;

var rtdb = /*#__PURE__*/ Object.freeze({});

// export { FirebaseMessaging } from "@firebase/messaging-types";

exports.FileDepthExceeded = FirebaseDepthExceeded;
exports.UndefinedAssignment = UndefinedAssignment;
exports.RealTimeDB = RealTimeDB;
exports.rtdb = rtdb;
