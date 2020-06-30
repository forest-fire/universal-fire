'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var serializerFactory = require('@forest-fire/serializer-factory');
var realTimeClient = require('@forest-fire/real-time-client');
var firestoreClient = require('@forest-fire/firestore-client');
var realTimeAdmin = require('@forest-fire/real-time-admin');
var firestoreAdmin = require('@forest-fire/firestore-admin');



Object.defineProperty(exports, 'SerializedQuery', {
  enumerable: true,
  get: function () {
    return serializerFactory.SerializedQuery;
  }
});
Object.defineProperty(exports, 'RealTimeClient', {
  enumerable: true,
  get: function () {
    return realTimeClient.RealTimeClient;
  }
});
Object.defineProperty(exports, 'FirestoreClient', {
  enumerable: true,
  get: function () {
    return firestoreClient.FirestoreClient;
  }
});
Object.defineProperty(exports, 'RealTimeAdmin', {
  enumerable: true,
  get: function () {
    return realTimeAdmin.RealTimeAdmin;
  }
});
Object.defineProperty(exports, 'FirestoreAdmin', {
  enumerable: true,
  get: function () {
    return firestoreAdmin.FirestoreAdmin;
  }
});
//# sourceMappingURL=index.js.map
