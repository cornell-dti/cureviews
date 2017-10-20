//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
// Source maps are supported by all recent versions of Chrome, Safari,  //
// and Firefox, and by Internet Explorer 11.                            //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var AllowDeny = Package['allow-deny'].AllowDeny;
var Random = Package.random.Random;
var EJSON = Package.ejson.EJSON;
var _ = Package.underscore._;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var DDP = Package['ddp-client'].DDP;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var DiffSequence = Package['diff-sequence'].DiffSequence;
var MongoID = Package['mongo-id'].MongoID;
var check = Package.check.check;
var Match = Package.check.Match;
var meteorInstall = Package.modules.meteorInstall;
var process = Package.modules.process;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;
var Symbol = Package['ecmascript-runtime-client'].Symbol;
var Map = Package['ecmascript-runtime-client'].Map;
var Set = Package['ecmascript-runtime-client'].Set;

/* Package-scope variables */
var LocalCollectionDriver, Mongo;

var require = meteorInstall({"node_modules":{"meteor":{"mongo":{"local_collection_driver.js":function(){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// packages/mongo/local_collection_driver.js                                                                    //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
LocalCollectionDriver = function () {                                                                           // 1
  var self = this;                                                                                              // 2
  self.noConnCollections = {};                                                                                  // 3
};                                                                                                              // 4
                                                                                                                //
var ensureCollection = function (name, collections) {                                                           // 6
  if (!(name in collections)) collections[name] = new LocalCollection(name);                                    // 7
  return collections[name];                                                                                     // 9
};                                                                                                              // 10
                                                                                                                //
_.extend(LocalCollectionDriver.prototype, {                                                                     // 12
  open: function (name, conn) {                                                                                 // 13
    var self = this;                                                                                            // 14
    if (!name) return new LocalCollection();                                                                    // 15
                                                                                                                //
    if (!conn) {                                                                                                // 17
      return ensureCollection(name, self.noConnCollections);                                                    // 18
    }                                                                                                           // 19
                                                                                                                //
    if (!conn._mongo_livedata_collections) conn._mongo_livedata_collections = {}; // XXX is there a way to keep track of a connection's collections without
    // dangling it off the connection object?                                                                   // 23
                                                                                                                //
    return ensureCollection(name, conn._mongo_livedata_collections);                                            // 24
  }                                                                                                             // 25
}); // singleton                                                                                                // 12
                                                                                                                //
                                                                                                                //
LocalCollectionDriver = new LocalCollectionDriver();                                                            // 29
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"collection.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// packages/mongo/collection.js                                                                                 //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
// options.connection, if given, is a LivedataClient or LivedataServer                                          // 1
// XXX presently there is no way to destroy/clean up a Collection                                               // 2
/**                                                                                                             // 4
 * @summary Namespace for MongoDB-related items                                                                 //
 * @namespace                                                                                                   //
 */Mongo = {}; /**                                                                                              //
                * @summary Constructor for a Collection                                                         //
                * @locus Anywhere                                                                               //
                * @instancename collection                                                                      //
                * @class                                                                                        //
                * @param {String} name The name of the collection.  If null, creates an unmanaged (unsynchronized) local collection.
                * @param {Object} [options]                                                                     //
                * @param {Object} options.connection The server connection that will manage this collection. Uses the default connection if not specified.  Pass the return value of calling [`DDP.connect`](#ddp_connect) to specify a different server. Pass `null` to specify no connection. Unmanaged (`name` is null) collections cannot specify a connection.
                * @param {String} options.idGeneration The method of generating the `_id` fields of new documents in this collection.  Possible values:
                                                                                                                //
                - **`'STRING'`**: random strings                                                                //
                - **`'MONGO'`**:  random [`Mongo.ObjectID`](#mongo_object_id) values                            //
                                                                                                                //
               The default id generation technique is `'STRING'`.                                               //
                * @param {Function} options.transform An optional transformation function. Documents will be passed through this function before being returned from `fetch` or `findOne`, and before being passed to callbacks of `observe`, `map`, `forEach`, `allow`, and `deny`. Transforms are *not* applied for the callbacks of `observeChanges` or to cursors returned from publish functions.
                * @param {Boolean} options.defineMutationMethods Set to `false` to skip setting up the mutation methods that enable insert/update/remove from client code. Default `true`.
                */                                                                                              //
                                                                                                                //
Mongo.Collection = function (name, options) {                                                                   // 27
  var self = this;                                                                                              // 28
  if (!(self instanceof Mongo.Collection)) throw new Error('use "new" to construct a Mongo.Collection');        // 29
                                                                                                                //
  if (!name && name !== null) {                                                                                 // 32
    Meteor._debug("Warning: creating anonymous collection. It will not be " + "saved or synchronized over the network. (Pass null for " + "the collection name to turn off this warning.)");
                                                                                                                //
    name = null;                                                                                                // 36
  }                                                                                                             // 37
                                                                                                                //
  if (name !== null && typeof name !== "string") {                                                              // 39
    throw new Error("First argument to new Mongo.Collection must be a string or null");                         // 40
  }                                                                                                             // 42
                                                                                                                //
  if (options && options.methods) {                                                                             // 44
    // Backwards compatibility hack with original signature (which passed                                       // 45
    // "connection" directly instead of in options. (Connections must have a "methods"                          // 46
    // method.)                                                                                                 // 47
    // XXX remove before 1.0                                                                                    // 48
    options = {                                                                                                 // 49
      connection: options                                                                                       // 49
    };                                                                                                          // 49
  } // Backwards compatibility: "connection" used to be called "manager".                                       // 50
                                                                                                                //
                                                                                                                //
  if (options && options.manager && !options.connection) {                                                      // 52
    options.connection = options.manager;                                                                       // 53
  }                                                                                                             // 54
                                                                                                                //
  options = _.extend({                                                                                          // 55
    connection: undefined,                                                                                      // 56
    idGeneration: 'STRING',                                                                                     // 57
    transform: null,                                                                                            // 58
    _driver: undefined,                                                                                         // 59
    _preventAutopublish: false                                                                                  // 60
  }, options);                                                                                                  // 55
                                                                                                                //
  switch (options.idGeneration) {                                                                               // 63
    case 'MONGO':                                                                                               // 64
      self._makeNewID = function () {                                                                           // 65
        var src = name ? DDP.randomStream('/collection/' + name) : Random.insecure;                             // 66
        return new Mongo.ObjectID(src.hexString(24));                                                           // 67
      };                                                                                                        // 68
                                                                                                                //
      break;                                                                                                    // 69
                                                                                                                //
    case 'STRING':                                                                                              // 70
    default:                                                                                                    // 71
      self._makeNewID = function () {                                                                           // 72
        var src = name ? DDP.randomStream('/collection/' + name) : Random.insecure;                             // 73
        return src.id();                                                                                        // 74
      };                                                                                                        // 75
                                                                                                                //
      break;                                                                                                    // 76
  }                                                                                                             // 63
                                                                                                                //
  self._transform = LocalCollection.wrapTransform(options.transform);                                           // 79
  if (!name || options.connection === null) // note: nameless collections never have a connection               // 81
    self._connection = null;else if (options.connection) self._connection = options.connection;else if (Meteor.isClient) self._connection = Meteor.connection;else self._connection = Meteor.server;
                                                                                                                //
  if (!options._driver) {                                                                                       // 91
    // XXX This check assumes that webapp is loaded so that Meteor.server !==                                   // 92
    // null. We should fully support the case of "want to use a Mongo-backed                                    // 93
    // collection from Node code without webapp", but we don't yet.                                             // 94
    // #MeteorServerNull                                                                                        // 95
    if (name && self._connection === Meteor.server && typeof MongoInternals !== "undefined" && MongoInternals.defaultRemoteCollectionDriver) {
      options._driver = MongoInternals.defaultRemoteCollectionDriver();                                         // 99
    } else {                                                                                                    // 100
      options._driver = LocalCollectionDriver;                                                                  // 101
    }                                                                                                           // 102
  }                                                                                                             // 103
                                                                                                                //
  self._collection = options._driver.open(name, self._connection);                                              // 105
  self._name = name;                                                                                            // 106
  self._driver = options._driver;                                                                               // 107
                                                                                                                //
  if (self._connection && self._connection.registerStore) {                                                     // 109
    // OK, we're going to be a slave, replicating some remote                                                   // 110
    // database, except possibly with some temporary divergence while                                           // 111
    // we have unacknowledged RPC's.                                                                            // 112
    var ok = self._connection.registerStore(name, {                                                             // 113
      // Called at the beginning of a batch of updates. batchSize is the number                                 // 114
      // of update calls to expect.                                                                             // 115
      //                                                                                                        // 116
      // XXX This interface is pretty janky. reset probably ought to go back to                                 // 117
      // being its own function, and callers shouldn't have to calculate                                        // 118
      // batchSize. The optimization of not calling pause/remove should be                                      // 119
      // delayed until later: the first call to update() should buffer its                                      // 120
      // message, and then we can either directly apply it at endUpdate time if                                 // 121
      // it was the only update, or do pauseObservers/apply/apply at the next                                   // 122
      // update() if there's another one.                                                                       // 123
      beginUpdate: function (batchSize, reset) {                                                                // 124
        // pause observers so users don't see flicker when updating several                                     // 125
        // objects at once (including the post-reconnect reset-and-reapply                                      // 126
        // stage), and so that a re-sorting of a query can take advantage of the                                // 127
        // full _diffQuery moved calculation instead of applying change one at a                                // 128
        // time.                                                                                                // 129
        if (batchSize > 1 || reset) self._collection.pauseObservers();                                          // 130
        if (reset) self._collection.remove({});                                                                 // 133
      },                                                                                                        // 135
      // Apply an update.                                                                                       // 137
      // XXX better specify this interface (not in terms of a wire message)?                                    // 138
      update: function (msg) {                                                                                  // 139
        var mongoId = MongoID.idParse(msg.id);                                                                  // 140
                                                                                                                //
        var doc = self._collection.findOne(mongoId); // Is this a "replace the whole doc" message coming from the quiescence
        // of method writes to an object? (Note that 'undefined' is a valid                                     // 144
        // value meaning "remove it".)                                                                          // 145
                                                                                                                //
                                                                                                                //
        if (msg.msg === 'replace') {                                                                            // 146
          var replace = msg.replace;                                                                            // 147
                                                                                                                //
          if (!replace) {                                                                                       // 148
            if (doc) self._collection.remove(mongoId);                                                          // 149
          } else if (!doc) {                                                                                    // 151
            self._collection.insert(replace);                                                                   // 152
          } else {                                                                                              // 153
            // XXX check that replace has no $ ops                                                              // 154
            self._collection.update(mongoId, replace);                                                          // 155
          }                                                                                                     // 156
                                                                                                                //
          return;                                                                                               // 157
        } else if (msg.msg === 'added') {                                                                       // 158
          if (doc) {                                                                                            // 159
            throw new Error("Expected not to find a document already present for an add");                      // 160
          }                                                                                                     // 161
                                                                                                                //
          self._collection.insert(_.extend({                                                                    // 162
            _id: mongoId                                                                                        // 162
          }, msg.fields));                                                                                      // 162
        } else if (msg.msg === 'removed') {                                                                     // 163
          if (!doc) throw new Error("Expected to find a document already present for removed");                 // 164
                                                                                                                //
          self._collection.remove(mongoId);                                                                     // 166
        } else if (msg.msg === 'changed') {                                                                     // 167
          if (!doc) throw new Error("Expected to find a document to change");                                   // 168
                                                                                                                //
          if (!_.isEmpty(msg.fields)) {                                                                         // 170
            var modifier = {};                                                                                  // 171
                                                                                                                //
            _.each(msg.fields, function (value, key) {                                                          // 172
              if (value === undefined) {                                                                        // 173
                if (!modifier.$unset) modifier.$unset = {};                                                     // 174
                modifier.$unset[key] = 1;                                                                       // 176
              } else {                                                                                          // 177
                if (!modifier.$set) modifier.$set = {};                                                         // 178
                modifier.$set[key] = value;                                                                     // 180
              }                                                                                                 // 181
            });                                                                                                 // 182
                                                                                                                //
            self._collection.update(mongoId, modifier);                                                         // 183
          }                                                                                                     // 184
        } else {                                                                                                // 185
          throw new Error("I don't know how to deal with this message");                                        // 186
        }                                                                                                       // 187
      },                                                                                                        // 189
      // Called at the end of a batch of updates.                                                               // 191
      endUpdate: function () {                                                                                  // 192
        self._collection.resumeObservers();                                                                     // 193
      },                                                                                                        // 194
      // Called around method stub invocations to capture the original versions                                 // 196
      // of modified documents.                                                                                 // 197
      saveOriginals: function () {                                                                              // 198
        self._collection.saveOriginals();                                                                       // 199
      },                                                                                                        // 200
      retrieveOriginals: function () {                                                                          // 201
        return self._collection.retrieveOriginals();                                                            // 202
      },                                                                                                        // 203
      // Used to preserve current versions of documents across a store reset.                                   // 205
      getDoc: function (id) {                                                                                   // 206
        return self.findOne(id);                                                                                // 207
      },                                                                                                        // 208
      // To be able to get back to the collection from the store.                                               // 210
      _getCollection: function () {                                                                             // 211
        return self;                                                                                            // 212
      }                                                                                                         // 213
    });                                                                                                         // 113
                                                                                                                //
    if (!ok) {                                                                                                  // 216
      var message = "There is already a collection named \"" + name + "\"";                                     // 217
                                                                                                                //
      if (options._suppressSameNameError === true) {                                                            // 218
        // XXX In theory we do not have to throw when `ok` is falsy. The store is already defined               // 219
        // for this collection name, but this will simply be another reference to it and everything             // 220
        // should work. However, we have historically thrown an error here, so for now we will                  // 221
        // skip the error only when `_suppressSameNameError` is `true`, allowing people to opt in               // 222
        // and give this some real world testing.                                                               // 223
        console.warn ? console.warn(message) : console.log(message);                                            // 224
      } else {                                                                                                  // 225
        throw new Error(message);                                                                               // 226
      }                                                                                                         // 227
    }                                                                                                           // 228
  } // XXX don't define these until allow or deny is actually used for this                                     // 229
  // collection. Could be hard if the security rules are only defined on the                                    // 232
  // server.                                                                                                    // 233
                                                                                                                //
                                                                                                                //
  if (options.defineMutationMethods !== false) {                                                                // 234
    try {                                                                                                       // 235
      self._defineMutationMethods({                                                                             // 236
        useExisting: options._suppressSameNameError === true                                                    // 236
      });                                                                                                       // 236
    } catch (error) {                                                                                           // 237
      // Throw a more understandable error on the server for same collection name                               // 238
      if (error.message === "A method named '/" + name + "/insert' is already defined") throw new Error("There is already a collection named \"" + name + "\"");
      throw error;                                                                                              // 241
    }                                                                                                           // 242
  } // autopublish                                                                                              // 243
                                                                                                                //
                                                                                                                //
  if (Package.autopublish && !options._preventAutopublish && self._connection && self._connection.publish) {    // 246
    self._connection.publish(null, function () {                                                                // 247
      return self.find();                                                                                       // 248
    }, {                                                                                                        // 249
      is_auto: true                                                                                             // 249
    });                                                                                                         // 249
  }                                                                                                             // 250
}; ///                                                                                                          // 251
/// Main collection API                                                                                         // 254
///                                                                                                             // 255
                                                                                                                //
                                                                                                                //
_.extend(Mongo.Collection.prototype, {                                                                          // 258
  _getFindSelector: function (args) {                                                                           // 260
    if (args.length == 0) return {};else return args[0];                                                        // 261
  },                                                                                                            // 265
  _getFindOptions: function (args) {                                                                            // 267
    var self = this;                                                                                            // 268
                                                                                                                //
    if (args.length < 2) {                                                                                      // 269
      return {                                                                                                  // 270
        transform: self._transform                                                                              // 270
      };                                                                                                        // 270
    } else {                                                                                                    // 271
      check(args[1], Match.Optional(Match.ObjectIncluding({                                                     // 272
        fields: Match.Optional(Match.OneOf(Object, undefined)),                                                 // 273
        sort: Match.Optional(Match.OneOf(Object, Array, Function, undefined)),                                  // 274
        limit: Match.Optional(Match.OneOf(Number, undefined)),                                                  // 275
        skip: Match.Optional(Match.OneOf(Number, undefined))                                                    // 276
      })));                                                                                                     // 272
      return _.extend({                                                                                         // 279
        transform: self._transform                                                                              // 280
      }, args[1]);                                                                                              // 279
    }                                                                                                           // 282
  },                                                                                                            // 283
  /**                                                                                                           // 285
   * @summary Find the documents in a collection that match the selector.                                       //
   * @locus Anywhere                                                                                            //
   * @method find                                                                                               //
   * @memberOf Mongo.Collection                                                                                 //
   * @instance                                                                                                  //
   * @param {MongoSelector} [selector] A query describing the documents to find                                 //
   * @param {Object} [options]                                                                                  //
   * @param {MongoSortSpecifier} options.sort Sort order (default: natural order)                               //
   * @param {Number} options.skip Number of results to skip at the beginning                                    //
   * @param {Number} options.limit Maximum number of results to return                                          //
   * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.                     //
   * @param {Boolean} options.reactive (Client only) Default `true`; pass `false` to disable reactivity         //
   * @param {Function} options.transform Overrides `transform` on the  [`Collection`](#collections) for this cursor.  Pass `null` to disable transformation.
   * @param {Boolean} options.disableOplog (Server only) Pass true to disable oplog-tailing on this query. This affects the way server processes calls to `observe` on this query. Disabling the oplog can be useful when working with data that updates in large batches.
   * @param {Number} options.pollingIntervalMs (Server only) When oplog is disabled (through the use of `disableOplog` or when otherwise not available), the frequency (in milliseconds) of how often to poll this query when observing on the server. Defaults to 10000ms (10 seconds).
   * @param {Number} options.pollingThrottleMs (Server only) When oplog is disabled (through the use of `disableOplog` or when otherwise not available), the minimum time (in milliseconds) to allow between re-polling when observing on the server. Increasing this will save CPU and mongo load at the expense of slower updates to users. Decreasing this is not recommended. Defaults to 50ms.
   * @param {Number} options.maxTimeMs (Server only) If set, instructs MongoDB to set a time limit for this cursor's operations. If the operation reaches the specified time limit (in milliseconds) without the having been completed, an exception will be thrown. Useful to prevent an (accidental or malicious) unoptimized query from causing a full collection scan that would disrupt other database users, at the expense of needing to handle the resulting error.
   * @param {String|Object} options.hint (Server only) Overrides MongoDB's default index selection and query optimization process. Specify an index to force its use, either by its name or index specification. You can also specify `{ $natural : 1 }` to force a forwards collection scan, or `{ $natural : -1 }` for a reverse collection scan. Setting this is only recommended for advanced users.
   * @returns {Mongo.Cursor}                                                                                    //
   */find: function () /* selector, options */{                                                                 //
    // Collection.find() (return all docs) behaves differently                                                  // 307
    // from Collection.find(undefined) (return 0 docs).  so be                                                  // 308
    // careful about the length of arguments.                                                                   // 309
    var self = this;                                                                                            // 310
                                                                                                                //
    var argArray = _.toArray(arguments);                                                                        // 311
                                                                                                                //
    return self._collection.find(self._getFindSelector(argArray), self._getFindOptions(argArray));              // 312
  },                                                                                                            // 314
  /**                                                                                                           // 316
   * @summary Finds the first document that matches the selector, as ordered by sort and skip options. Returns `undefined` if no matching document is found.
   * @locus Anywhere                                                                                            //
   * @method findOne                                                                                            //
   * @memberOf Mongo.Collection                                                                                 //
   * @instance                                                                                                  //
   * @param {MongoSelector} [selector] A query describing the documents to find                                 //
   * @param {Object} [options]                                                                                  //
   * @param {MongoSortSpecifier} options.sort Sort order (default: natural order)                               //
   * @param {Number} options.skip Number of results to skip at the beginning                                    //
   * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.                     //
   * @param {Boolean} options.reactive (Client only) Default true; pass false to disable reactivity             //
   * @param {Function} options.transform Overrides `transform` on the [`Collection`](#collections) for this cursor.  Pass `null` to disable transformation.
   * @returns {Object}                                                                                          //
   */findOne: function () /* selector, options */{                                                              //
    var self = this;                                                                                            // 332
                                                                                                                //
    var argArray = _.toArray(arguments);                                                                        // 333
                                                                                                                //
    return self._collection.findOne(self._getFindSelector(argArray), self._getFindOptions(argArray));           // 334
  }                                                                                                             // 336
});                                                                                                             // 258
                                                                                                                //
Mongo.Collection._publishCursor = function (cursor, sub, collection) {                                          // 340
  var observeHandle = cursor.observeChanges({                                                                   // 341
    added: function (id, fields) {                                                                              // 342
      sub.added(collection, id, fields);                                                                        // 343
    },                                                                                                          // 344
    changed: function (id, fields) {                                                                            // 345
      sub.changed(collection, id, fields);                                                                      // 346
    },                                                                                                          // 347
    removed: function (id) {                                                                                    // 348
      sub.removed(collection, id);                                                                              // 349
    }                                                                                                           // 350
  }); // We don't call sub.ready() here: it gets called in livedata_server, after                               // 341
  // possibly calling _publishCursor on multiple returned cursors.                                              // 354
  // register stop callback (expects lambda w/ no args).                                                        // 356
                                                                                                                //
  sub.onStop(function () {                                                                                      // 357
    observeHandle.stop();                                                                                       // 357
  }); // return the observeHandle in case it needs to be stopped early                                          // 357
                                                                                                                //
  return observeHandle;                                                                                         // 360
}; // protect against dangerous selectors.  falsey and {_id: falsey} are both                                   // 361
// likely programmer error, and not what you want, particularly for destructive                                 // 364
// operations.  JS regexps don't serialize over DDP but can be trivially                                        // 365
// replaced by $regex. If a falsey _id is sent in, a new string _id will be                                     // 366
// generated and returned; if a fallbackId is provided, it will be returned                                     // 367
// instead.                                                                                                     // 368
                                                                                                                //
                                                                                                                //
Mongo.Collection._rewriteSelector = function (selector) {                                                       // 369
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},                            // 369
      fallbackId = _ref.fallbackId;                                                                             // 369
                                                                                                                //
  // shorthand -- scalars match _id                                                                             // 370
  if (LocalCollection._selectorIsId(selector)) selector = {                                                     // 371
    _id: selector                                                                                               // 372
  };                                                                                                            // 372
                                                                                                                //
  if (_.isArray(selector)) {                                                                                    // 374
    // This is consistent with the Mongo console itself; if we don't do this                                    // 375
    // check passing an empty array ends up selecting all items                                                 // 376
    throw new Error("Mongo selector can't be an array.");                                                       // 377
  }                                                                                                             // 378
                                                                                                                //
  if (!selector || '_id' in selector && !selector._id) {                                                        // 380
    // can't match anything                                                                                     // 381
    return {                                                                                                    // 382
      _id: fallbackId || Random.id()                                                                            // 382
    };                                                                                                          // 382
  }                                                                                                             // 383
                                                                                                                //
  var ret = {};                                                                                                 // 385
  Object.keys(selector).forEach(function (key) {                                                                // 386
    var value = selector[key]; // Mongo supports both {field: /foo/} and {field: {$regex: /foo/}}               // 387
                                                                                                                //
    if (value instanceof RegExp) {                                                                              // 389
      ret[key] = convertRegexpToMongoSelector(value);                                                           // 390
    } else if (value && value.$regex instanceof RegExp) {                                                       // 391
      ret[key] = convertRegexpToMongoSelector(value.$regex); // if value is {$regex: /foo/, $options: ...} then $options
      // override the ones set on $regex.                                                                       // 394
                                                                                                                //
      if (value.$options !== undefined) ret[key].$options = value.$options;                                     // 395
    } else if (_.contains(['$or', '$and', '$nor'], key)) {                                                      // 397
      // Translate lower levels of $and/$or/$nor                                                                // 398
      ret[key] = _.map(value, function (v) {                                                                    // 399
        return Mongo.Collection._rewriteSelector(v);                                                            // 400
      });                                                                                                       // 401
    } else {                                                                                                    // 402
      ret[key] = value;                                                                                         // 403
    }                                                                                                           // 404
  });                                                                                                           // 405
  return ret;                                                                                                   // 406
}; // convert a JS RegExp object to a Mongo {$regex: ..., $options: ...}                                        // 407
// selector                                                                                                     // 410
                                                                                                                //
                                                                                                                //
function convertRegexpToMongoSelector(regexp) {                                                                 // 411
  check(regexp, RegExp); // safety belt                                                                         // 412
                                                                                                                //
  var selector = {                                                                                              // 414
    $regex: regexp.source                                                                                       // 414
  };                                                                                                            // 414
  var regexOptions = ''; // JS RegExp objects support 'i', 'm', and 'g'. Mongo regex $options                   // 415
  // support 'i', 'm', 'x', and 's'. So we support 'i' and 'm' here.                                            // 417
                                                                                                                //
  if (regexp.ignoreCase) regexOptions += 'i';                                                                   // 418
  if (regexp.multiline) regexOptions += 'm';                                                                    // 420
  if (regexOptions) selector.$options = regexOptions;                                                           // 422
  return selector;                                                                                              // 425
} // 'insert' immediately returns the inserted document's new _id.                                              // 426
// The others return values immediately if you are in a stub, an in-memory                                      // 429
// unmanaged collection, or a mongo-backed collection and you don't pass a                                      // 430
// callback. 'update' and 'remove' return the number of affected                                                // 431
// documents. 'upsert' returns an object with keys 'numberAffected' and, if an                                  // 432
// insert happened, 'insertedId'.                                                                               // 433
//                                                                                                              // 434
// Otherwise, the semantics are exactly like other methods: they take                                           // 435
// a callback as an optional last argument; if no callback is                                                   // 436
// provided, they block until the operation is complete, and throw an                                           // 437
// exception if it fails; if a callback is provided, then they don't                                            // 438
// necessarily block, and they call the callback when they finish with error and                                // 439
// result arguments.  (The insert method provides the document ID as its result;                                // 440
// update and remove provide the number of affected docs as the result; upsert                                  // 441
// provides an object with numberAffected and maybe insertedId.)                                                // 442
//                                                                                                              // 443
// On the client, blocking is impossible, so if a callback                                                      // 444
// isn't provided, they just return immediately and any error                                                   // 445
// information is lost.                                                                                         // 446
//                                                                                                              // 447
// There's one more tweak. On the client, if you don't provide a                                                // 448
// callback, then if there is an error, a message will be logged with                                           // 449
// Meteor._debug.                                                                                               // 450
//                                                                                                              // 451
// The intent (though this is actually determined by the underlying                                             // 452
// drivers) is that the operations should be done synchronously, not                                            // 453
// generating their result until the database has acknowledged                                                  // 454
// them. In the future maybe we should provide a flag to turn this                                              // 455
// off.                                                                                                         // 456
/**                                                                                                             // 458
 * @summary Insert a document in the collection.  Returns its unique _id.                                       //
 * @locus Anywhere                                                                                              //
 * @method  insert                                                                                              //
 * @memberOf Mongo.Collection                                                                                   //
 * @instance                                                                                                    //
 * @param {Object} doc The document to insert. May not yet have an _id attribute, in which case Meteor will generate one for you.
 * @param {Function} [callback] Optional.  If present, called with an error object as the first argument and, if no error, the _id as the second.
 */                                                                                                             //
                                                                                                                //
Mongo.Collection.prototype.insert = function () {                                                               // 467
  function insert(doc, callback) {                                                                              // 467
    // Make sure we were passed a document to insert                                                            // 468
    if (!doc) {                                                                                                 // 469
      throw new Error("insert requires an argument");                                                           // 470
    } // Shallow-copy the document and possibly generate an ID                                                  // 471
                                                                                                                //
                                                                                                                //
    doc = _.extend({}, doc);                                                                                    // 474
                                                                                                                //
    if ('_id' in doc) {                                                                                         // 476
      if (!doc._id || !(typeof doc._id === 'string' || doc._id instanceof Mongo.ObjectID)) {                    // 477
        throw new Error("Meteor requires document _id fields to be non-empty strings or ObjectIDs");            // 478
      }                                                                                                         // 479
    } else {                                                                                                    // 480
      var generateId = true; // Don't generate the id if we're the client and the 'outermost' call              // 481
      // This optimization saves us passing both the randomSeed and the id                                      // 484
      // Passing both is redundant.                                                                             // 485
                                                                                                                //
      if (this._isRemoteCollection()) {                                                                         // 486
        var enclosing = DDP._CurrentMethodInvocation.get();                                                     // 487
                                                                                                                //
        if (!enclosing) {                                                                                       // 488
          generateId = false;                                                                                   // 489
        }                                                                                                       // 490
      }                                                                                                         // 491
                                                                                                                //
      if (generateId) {                                                                                         // 493
        doc._id = this._makeNewID();                                                                            // 494
      }                                                                                                         // 495
    } // On inserts, always return the id that we generated; on all other                                       // 496
    // operations, just return the result from the collection.                                                  // 499
                                                                                                                //
                                                                                                                //
    var chooseReturnValueFromCollectionResult = function (result) {                                             // 500
      if (doc._id) {                                                                                            // 501
        return doc._id;                                                                                         // 502
      } // XXX what is this for??                                                                               // 503
      // It's some iteraction between the callback to _callMutatorMethod and                                    // 506
      // the return value conversion                                                                            // 507
                                                                                                                //
                                                                                                                //
      doc._id = result;                                                                                         // 508
      return result;                                                                                            // 510
    };                                                                                                          // 511
                                                                                                                //
    var wrappedCallback = wrapCallback(callback, chooseReturnValueFromCollectionResult);                        // 513
                                                                                                                //
    if (this._isRemoteCollection()) {                                                                           // 515
      var result = this._callMutatorMethod("insert", [doc], wrappedCallback);                                   // 516
                                                                                                                //
      return chooseReturnValueFromCollectionResult(result);                                                     // 517
    } // it's my collection.  descend into the collection object                                                // 518
    // and propagate any exception.                                                                             // 521
                                                                                                                //
                                                                                                                //
    try {                                                                                                       // 522
      // If the user provided a callback and the collection implements this                                     // 523
      // operation asynchronously, then queryRet will be undefined, and the                                     // 524
      // result will be returned through the callback instead.                                                  // 525
      var _result = this._collection.insert(doc, wrappedCallback);                                              // 526
                                                                                                                //
      return chooseReturnValueFromCollectionResult(_result);                                                    // 527
    } catch (e) {                                                                                               // 528
      if (callback) {                                                                                           // 529
        callback(e);                                                                                            // 530
        return null;                                                                                            // 531
      }                                                                                                         // 532
                                                                                                                //
      throw e;                                                                                                  // 533
    }                                                                                                           // 534
  }                                                                                                             // 535
                                                                                                                //
  return insert;                                                                                                // 467
}(); /**                                                                                                        // 467
      * @summary Modify one or more documents in the collection. Returns the number of matched documents.       //
      * @locus Anywhere                                                                                         //
      * @method update                                                                                          //
      * @memberOf Mongo.Collection                                                                              //
      * @instance                                                                                               //
      * @param {MongoSelector} selector Specifies which documents to modify                                     //
      * @param {MongoModifier} modifier Specifies how to modify the documents                                   //
      * @param {Object} [options]                                                                               //
      * @param {Boolean} options.multi True to modify all matching documents; false to only modify one of the matching documents (the default).
      * @param {Boolean} options.upsert True to insert a document if no matching documents are found.           //
      * @param {Function} [callback] Optional.  If present, called with an error object as the first argument and, if no error, the number of affected documents as the second.
      */                                                                                                        //
                                                                                                                //
Mongo.Collection.prototype.update = function () {                                                               // 550
  function update(selector, modifier) {                                                                         // 550
    for (var _len = arguments.length, optionsAndCallback = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      optionsAndCallback[_key - 2] = arguments[_key];                                                           // 550
    }                                                                                                           // 550
                                                                                                                //
    var callback = popCallbackFromArgs(optionsAndCallback); // We've already popped off the callback, so we are left with an array
    // of one or zero items                                                                                     // 554
                                                                                                                //
    var options = _.clone(optionsAndCallback[0]) || {};                                                         // 555
    var insertedId = void 0;                                                                                    // 556
                                                                                                                //
    if (options && options.upsert) {                                                                            // 557
      // set `insertedId` if absent.  `insertedId` is a Meteor extension.                                       // 558
      if (options.insertedId) {                                                                                 // 559
        if (!(typeof options.insertedId === 'string' || options.insertedId instanceof Mongo.ObjectID)) throw new Error("insertedId must be string or ObjectID");
        insertedId = options.insertedId;                                                                        // 562
      } else if (!selector || !selector._id) {                                                                  // 563
        insertedId = this._makeNewID();                                                                         // 564
        options.insertedId = insertedId;                                                                        // 565
      }                                                                                                         // 566
    }                                                                                                           // 567
                                                                                                                //
    selector = Mongo.Collection._rewriteSelector(selector, {                                                    // 569
      fallbackId: insertedId                                                                                    // 570
    });                                                                                                         // 570
    var wrappedCallback = wrapCallback(callback);                                                               // 572
                                                                                                                //
    if (this._isRemoteCollection()) {                                                                           // 574
      var args = [selector, modifier, options];                                                                 // 575
      return this._callMutatorMethod("update", args, wrappedCallback);                                          // 581
    } // it's my collection.  descend into the collection object                                                // 582
    // and propagate any exception.                                                                             // 585
                                                                                                                //
                                                                                                                //
    try {                                                                                                       // 586
      // If the user provided a callback and the collection implements this                                     // 587
      // operation asynchronously, then queryRet will be undefined, and the                                     // 588
      // result will be returned through the callback instead.                                                  // 589
      return this._collection.update(selector, modifier, options, wrappedCallback);                             // 590
    } catch (e) {                                                                                               // 592
      if (callback) {                                                                                           // 593
        callback(e);                                                                                            // 594
        return null;                                                                                            // 595
      }                                                                                                         // 596
                                                                                                                //
      throw e;                                                                                                  // 597
    }                                                                                                           // 598
  }                                                                                                             // 599
                                                                                                                //
  return update;                                                                                                // 550
}(); /**                                                                                                        // 550
      * @summary Remove documents from the collection                                                           //
      * @locus Anywhere                                                                                         //
      * @method remove                                                                                          //
      * @memberOf Mongo.Collection                                                                              //
      * @instance                                                                                               //
      * @param {MongoSelector} selector Specifies which documents to remove                                     //
      * @param {Function} [callback] Optional.  If present, called with an error object as its argument.        //
      */                                                                                                        //
                                                                                                                //
Mongo.Collection.prototype.remove = function () {                                                               // 610
  function remove(selector, callback) {                                                                         // 610
    selector = Mongo.Collection._rewriteSelector(selector);                                                     // 611
    var wrappedCallback = wrapCallback(callback);                                                               // 613
                                                                                                                //
    if (this._isRemoteCollection()) {                                                                           // 615
      return this._callMutatorMethod("remove", [selector], wrappedCallback);                                    // 616
    } // it's my collection.  descend into the collection object                                                // 617
    // and propagate any exception.                                                                             // 620
                                                                                                                //
                                                                                                                //
    try {                                                                                                       // 621
      // If the user provided a callback and the collection implements this                                     // 622
      // operation asynchronously, then queryRet will be undefined, and the                                     // 623
      // result will be returned through the callback instead.                                                  // 624
      return this._collection.remove(selector, wrappedCallback);                                                // 625
    } catch (e) {                                                                                               // 626
      if (callback) {                                                                                           // 627
        callback(e);                                                                                            // 628
        return null;                                                                                            // 629
      }                                                                                                         // 630
                                                                                                                //
      throw e;                                                                                                  // 631
    }                                                                                                           // 632
  }                                                                                                             // 633
                                                                                                                //
  return remove;                                                                                                // 610
}(); // Determine if this collection is simply a minimongo representation of a real                             // 610
// database on another server                                                                                   // 636
                                                                                                                //
                                                                                                                //
Mongo.Collection.prototype._isRemoteCollection = function () {                                                  // 637
  function _isRemoteCollection() {                                                                              // 637
    // XXX see #MeteorServerNull                                                                                // 638
    return this._connection && this._connection !== Meteor.server;                                              // 639
  }                                                                                                             // 640
                                                                                                                //
  return _isRemoteCollection;                                                                                   // 637
}(); // Convert the callback to not return a result if there is an error                                        // 637
                                                                                                                //
                                                                                                                //
function wrapCallback(callback, convertResult) {                                                                // 643
  if (!callback) {                                                                                              // 644
    return;                                                                                                     // 645
  } // If no convert function was passed in, just use a "blank function"                                        // 646
                                                                                                                //
                                                                                                                //
  convertResult = convertResult || _.identity;                                                                  // 649
  return function (error, result) {                                                                             // 651
    callback(error, !error && convertResult(result));                                                           // 652
  };                                                                                                            // 653
} /**                                                                                                           // 654
   * @summary Modify one or more documents in the collection, or insert one if no matching documents were found. Returns an object with keys `numberAffected` (the number of documents modified)  and `insertedId` (the unique _id of the document that was inserted, if any).
   * @locus Anywhere                                                                                            //
   * @param {MongoSelector} selector Specifies which documents to modify                                        //
   * @param {MongoModifier} modifier Specifies how to modify the documents                                      //
   * @param {Object} [options]                                                                                  //
   * @param {Boolean} options.multi True to modify all matching documents; false to only modify one of the matching documents (the default).
   * @param {Function} [callback] Optional.  If present, called with an error object as the first argument and, if no error, the number of affected documents as the second.
   */                                                                                                           //
                                                                                                                //
Mongo.Collection.prototype.upsert = function () {                                                               // 665
  function upsert(selector, modifier, options, callback) {                                                      // 665
    if (!callback && typeof options === "function") {                                                           // 667
      callback = options;                                                                                       // 668
      options = {};                                                                                             // 669
    }                                                                                                           // 670
                                                                                                                //
    var updateOptions = _.extend({}, options, {                                                                 // 672
      _returnObject: true,                                                                                      // 673
      upsert: true                                                                                              // 674
    });                                                                                                         // 672
                                                                                                                //
    return this.update(selector, modifier, updateOptions, callback);                                            // 677
  }                                                                                                             // 678
                                                                                                                //
  return upsert;                                                                                                // 665
}(); // We'll actually design an index API later. For now, we just pass through to                              // 665
// Mongo's, but make it synchronous.                                                                            // 681
                                                                                                                //
                                                                                                                //
Mongo.Collection.prototype._ensureIndex = function (index, options) {                                           // 682
  var self = this;                                                                                              // 683
  if (!self._collection._ensureIndex) throw new Error("Can only call _ensureIndex on server collections");      // 684
                                                                                                                //
  self._collection._ensureIndex(index, options);                                                                // 686
};                                                                                                              // 687
                                                                                                                //
Mongo.Collection.prototype._dropIndex = function (index) {                                                      // 688
  var self = this;                                                                                              // 689
  if (!self._collection._dropIndex) throw new Error("Can only call _dropIndex on server collections");          // 690
                                                                                                                //
  self._collection._dropIndex(index);                                                                           // 692
};                                                                                                              // 693
                                                                                                                //
Mongo.Collection.prototype._dropCollection = function () {                                                      // 694
  var self = this;                                                                                              // 695
  if (!self._collection.dropCollection) throw new Error("Can only call _dropCollection on server collections");
                                                                                                                //
  self._collection.dropCollection();                                                                            // 698
};                                                                                                              // 699
                                                                                                                //
Mongo.Collection.prototype._createCappedCollection = function (byteSize, maxDocuments) {                        // 700
  var self = this;                                                                                              // 701
  if (!self._collection._createCappedCollection) throw new Error("Can only call _createCappedCollection on server collections");
                                                                                                                //
  self._collection._createCappedCollection(byteSize, maxDocuments);                                             // 704
}; /**                                                                                                          // 705
    * @summary Returns the [`Collection`](http://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html) object corresponding to this collection from the [npm `mongodb` driver module](https://www.npmjs.com/package/mongodb) which is wrapped by `Mongo.Collection`.
    * @locus Server                                                                                             //
    */                                                                                                          //
                                                                                                                //
Mongo.Collection.prototype.rawCollection = function () {                                                        // 711
  var self = this;                                                                                              // 712
                                                                                                                //
  if (!self._collection.rawCollection) {                                                                        // 713
    throw new Error("Can only call rawCollection on server collections");                                       // 714
  }                                                                                                             // 715
                                                                                                                //
  return self._collection.rawCollection();                                                                      // 716
}; /**                                                                                                          // 717
    * @summary Returns the [`Db`](http://mongodb.github.io/node-mongodb-native/2.2/api/Db.html) object corresponding to this collection's database connection from the [npm `mongodb` driver module](https://www.npmjs.com/package/mongodb) which is wrapped by `Mongo.Collection`.
    * @locus Server                                                                                             //
    */                                                                                                          //
                                                                                                                //
Mongo.Collection.prototype.rawDatabase = function () {                                                          // 723
  var self = this;                                                                                              // 724
                                                                                                                //
  if (!(self._driver.mongo && self._driver.mongo.db)) {                                                         // 725
    throw new Error("Can only call rawDatabase on server collections");                                         // 726
  }                                                                                                             // 727
                                                                                                                //
  return self._driver.mongo.db;                                                                                 // 728
}; /**                                                                                                          // 729
    * @summary Create a Mongo-style `ObjectID`.  If you don't specify a `hexString`, the `ObjectID` will generated randomly (not using MongoDB's ID construction rules).
    * @locus Anywhere                                                                                           //
    * @class                                                                                                    //
    * @param {String} [hexString] Optional.  The 24-character hexadecimal contents of the ObjectID to create    //
    */                                                                                                          //
                                                                                                                //
Mongo.ObjectID = MongoID.ObjectID; /**                                                                          // 738
                                    * @summary To create a cursor, use find. To access the documents in a cursor, use forEach, map, or fetch.
                                    * @class                                                                    //
                                    * @instanceName cursor                                                      //
                                    */                                                                          //
Mongo.Cursor = LocalCollection.Cursor; /**                                                                      // 745
                                        * @deprecated in 0.9.1                                                  //
                                        */                                                                      //
Mongo.Collection.Cursor = Mongo.Cursor; /**                                                                     // 750
                                         * @deprecated in 0.9.1                                                 //
                                         */                                                                     //
Mongo.Collection.ObjectID = Mongo.ObjectID; /**                                                                 // 755
                                             * @deprecated in 0.9.1                                             //
                                             */                                                                 //
Meteor.Collection = Mongo.Collection; // Allow deny stuff is now in the allow-deny package                      // 760
                                                                                                                //
_.extend(Meteor.Collection.prototype, AllowDeny.CollectionPrototype);                                           // 763
                                                                                                                //
function popCallbackFromArgs(args) {                                                                            // 765
  // Pull off any callback (or perhaps a 'callback' variable that was passed                                    // 766
  // in undefined, like how 'upsert' does it).                                                                  // 767
  if (args.length && (args[args.length - 1] === undefined || args[args.length - 1] instanceof Function)) {      // 768
    return args.pop();                                                                                          // 771
  }                                                                                                             // 772
}                                                                                                               // 773
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});
require("./node_modules/meteor/mongo/local_collection_driver.js");
require("./node_modules/meteor/mongo/collection.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package.mongo = {}, {
  Mongo: Mongo
});

})();
