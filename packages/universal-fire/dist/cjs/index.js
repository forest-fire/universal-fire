'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index = require('./index-5e88db3a.js');
require('events');
var realTimeAdmin = require('@forest-fire/real-time-admin');
var firestoreAdmin = require('@forest-fire/firestore-admin');



exports.FirestoreClient = index.FirestoreClient;
exports.RealTimeClient = index.RealTimeClient;
exports.SerializedQuery = index.SerializedQuery;
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
