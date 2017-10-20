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
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var MongoID = Package['mongo-id'].MongoID;
var DiffSequence = Package['diff-sequence'].DiffSequence;
var _ = Package.underscore._;
var Random = Package.random.Random;

/* Package-scope variables */
var ObserveSequence, seqChangedToEmpty, seqChangedToArray, seqChangedToCursor;

(function(){

///////////////////////////////////////////////////////////////////////////////////
//                                                                               //
// packages/observe-sequence/observe_sequence.js                                 //
//                                                                               //
///////////////////////////////////////////////////////////////////////////////////
                                                                                 //
var warn = function () {                                                         // 1
  if (ObserveSequence._suppressWarnings) {                                       // 2
    ObserveSequence._suppressWarnings--;                                         // 3
  } else {                                                                       // 4
    if (typeof console !== 'undefined' && console.warn)                          // 5
      console.warn.apply(console, arguments);                                    // 6
                                                                                 // 7
    ObserveSequence._loggedWarnings++;                                           // 8
  }                                                                              // 9
};                                                                               // 10
                                                                                 // 11
// isArray returns true for arrays of these types:                               // 12
// standard arrays: instanceof Array === true, _.isArray(arr) === true           // 13
// vm generated arrays: instanceOf Array === false, _.isArray(arr) === true      // 14
// subclassed arrays: instanceof Array === true, _.isArray(arr) === false        // 15
// see specific tests                                                            // 16
function isArray(arr) {                                                          // 17
  return arr instanceof Array || _.isArray(arr);                                 // 18
}                                                                                // 19
                                                                                 // 20
var idStringify = MongoID.idStringify;                                           // 21
var idParse = MongoID.idParse;                                                   // 22
                                                                                 // 23
ObserveSequence = {                                                              // 24
  _suppressWarnings: 0,                                                          // 25
  _loggedWarnings: 0,                                                            // 26
                                                                                 // 27
  // A mechanism similar to cursor.observe which receives a reactive             // 28
  // function returning a sequence type and firing appropriate callbacks         // 29
  // when the value changes.                                                     // 30
  //                                                                             // 31
  // @param sequenceFunc {Function} a reactive function returning a              // 32
  //     sequence type. The currently supported sequence types are:              // 33
  //     Array, Cursor, and null.                                                // 34
  //                                                                             // 35
  // @param callbacks {Object} similar to a specific subset of                   // 36
  //     callbacks passed to `cursor.observe`                                    // 37
  //     (http://docs.meteor.com/#observe), with minor variations to             // 38
  //     support the fact that not all sequences contain objects with            // 39
  //     _id fields.  Specifically:                                              // 40
  //                                                                             // 41
  //     * addedAt(id, item, atIndex, beforeId)                                  // 42
  //     * changedAt(id, newItem, oldItem, atIndex)                              // 43
  //     * removedAt(id, oldItem, atIndex)                                       // 44
  //     * movedTo(id, item, fromIndex, toIndex, beforeId)                       // 45
  //                                                                             // 46
  // @returns {Object(stop: Function)} call 'stop' on the return value           // 47
  //     to stop observing this sequence function.                               // 48
  //                                                                             // 49
  // We don't make any assumptions about our ability to compare sequence         // 50
  // elements (ie, we don't assume EJSON.equals works; maybe there is extra      // 51
  // state/random methods on the objects) so unlike cursor.observe, we may       // 52
  // sometimes call changedAt() when nothing actually changed.                   // 53
  // XXX consider if we *can* make the stronger assumption and avoid             // 54
  //     no-op changedAt calls (in some cases?)                                  // 55
  //                                                                             // 56
  // XXX currently only supports the callbacks used by our                       // 57
  // implementation of {{#each}}, but this can be expanded.                      // 58
  //                                                                             // 59
  // XXX #each doesn't use the indices (though we'll eventually need             // 60
  // a way to get them when we support `@index`), but calling                    // 61
  // `cursor.observe` causes the index to be calculated on every                 // 62
  // callback using a linear scan (unless you turn it off by passing             // 63
  // `_no_indices`).  Any way to avoid calculating indices on a pure             // 64
  // cursor observe like we used to?                                             // 65
  observe: function (sequenceFunc, callbacks) {                                  // 66
    var lastSeq = null;                                                          // 67
    var activeObserveHandle = null;                                              // 68
                                                                                 // 69
    // 'lastSeqArray' contains the previous value of the sequence                // 70
    // we're observing. It is an array of objects with '_id' and                 // 71
    // 'item' fields.  'item' is the element in the array, or the                // 72
    // document in the cursor.                                                   // 73
    //                                                                           // 74
    // '_id' is whichever of the following is relevant, unless it has            // 75
    // already appeared -- in which case it's randomly generated.                // 76
    //                                                                           // 77
    // * if 'item' is an object:                                                 // 78
    //   * an '_id' field, if present                                            // 79
    //   * otherwise, the index in the array                                     // 80
    //                                                                           // 81
    // * if 'item' is a number or string, use that value                         // 82
    //                                                                           // 83
    // XXX this can be generalized by allowing {{#each}} to accept a             // 84
    // general 'key' argument which could be a function, a dotted                // 85
    // field name, or the special @index value.                                  // 86
    var lastSeqArray = []; // elements are objects of form {_id, item}           // 87
    var computation = Tracker.autorun(function () {                              // 88
      var seq = sequenceFunc();                                                  // 89
                                                                                 // 90
      Tracker.nonreactive(function () {                                          // 91
        var seqArray; // same structure as `lastSeqArray` above.                 // 92
                                                                                 // 93
        if (activeObserveHandle) {                                               // 94
          // If we were previously observing a cursor, replace lastSeqArray with
          // more up-to-date information.  Then stop the old observe.            // 96
          lastSeqArray = _.map(lastSeq.fetch(), function (doc) {                 // 97
            return {_id: doc._id, item: doc};                                    // 98
          });                                                                    // 99
          activeObserveHandle.stop();                                            // 100
          activeObserveHandle = null;                                            // 101
        }                                                                        // 102
                                                                                 // 103
        if (!seq) {                                                              // 104
          seqArray = seqChangedToEmpty(lastSeqArray, callbacks);                 // 105
        } else if (isArray(seq)) {                                               // 106
          seqArray = seqChangedToArray(lastSeqArray, seq, callbacks);            // 107
        } else if (isStoreCursor(seq)) {                                         // 108
          var result /* [seqArray, activeObserveHandle] */ =                     // 109
                seqChangedToCursor(lastSeqArray, seq, callbacks);                // 110
          seqArray = result[0];                                                  // 111
          activeObserveHandle = result[1];                                       // 112
        } else {                                                                 // 113
          throw badSequenceError();                                              // 114
        }                                                                        // 115
                                                                                 // 116
        diffArray(lastSeqArray, seqArray, callbacks);                            // 117
        lastSeq = seq;                                                           // 118
        lastSeqArray = seqArray;                                                 // 119
      });                                                                        // 120
    });                                                                          // 121
                                                                                 // 122
    return {                                                                     // 123
      stop: function () {                                                        // 124
        computation.stop();                                                      // 125
        if (activeObserveHandle)                                                 // 126
          activeObserveHandle.stop();                                            // 127
      }                                                                          // 128
    };                                                                           // 129
  },                                                                             // 130
                                                                                 // 131
  // Fetch the items of `seq` into an array, where `seq` is of one of the        // 132
  // sequence types accepted by `observe`.  If `seq` is a cursor, a              // 133
  // dependency is established.                                                  // 134
  fetch: function (seq) {                                                        // 135
    if (!seq) {                                                                  // 136
      return [];                                                                 // 137
    } else if (isArray(seq)) {                                                   // 138
      return seq;                                                                // 139
    } else if (isStoreCursor(seq)) {                                             // 140
      return seq.fetch();                                                        // 141
    } else {                                                                     // 142
      throw badSequenceError();                                                  // 143
    }                                                                            // 144
  }                                                                              // 145
};                                                                               // 146
                                                                                 // 147
var badSequenceError = function () {                                             // 148
  return new Error("{{#each}} currently only accepts " +                         // 149
                   "arrays, cursors or falsey values.");                         // 150
};                                                                               // 151
                                                                                 // 152
var isStoreCursor = function (cursor) {                                          // 153
  return cursor && _.isObject(cursor) &&                                         // 154
    _.isFunction(cursor.observe) && _.isFunction(cursor.fetch);                  // 155
};                                                                               // 156
                                                                                 // 157
// Calculates the differences between `lastSeqArray` and                         // 158
// `seqArray` and calls appropriate functions from `callbacks`.                  // 159
// Reuses Minimongo's diff algorithm implementation.                             // 160
var diffArray = function (lastSeqArray, seqArray, callbacks) {                   // 161
  var diffFn = Package['diff-sequence'].DiffSequence.diffQueryOrderedChanges;    // 162
  var oldIdObjects = [];                                                         // 163
  var newIdObjects = [];                                                         // 164
  var posOld = {}; // maps from idStringify'd ids                                // 165
  var posNew = {}; // ditto                                                      // 166
  var posCur = {};                                                               // 167
  var lengthCur = lastSeqArray.length;                                           // 168
                                                                                 // 169
  _.each(seqArray, function (doc, i) {                                           // 170
    newIdObjects.push({_id: doc._id});                                           // 171
    posNew[idStringify(doc._id)] = i;                                            // 172
  });                                                                            // 173
  _.each(lastSeqArray, function (doc, i) {                                       // 174
    oldIdObjects.push({_id: doc._id});                                           // 175
    posOld[idStringify(doc._id)] = i;                                            // 176
    posCur[idStringify(doc._id)] = i;                                            // 177
  });                                                                            // 178
                                                                                 // 179
  // Arrays can contain arbitrary objects. We don't diff the                     // 180
  // objects. Instead we always fire 'changedAt' callback on every               // 181
  // object. The consumer of `observe-sequence` should deal with                 // 182
  // it appropriately.                                                           // 183
  diffFn(oldIdObjects, newIdObjects, {                                           // 184
    addedBefore: function (id, doc, before) {                                    // 185
      var position = before ? posCur[idStringify(before)] : lengthCur;           // 186
                                                                                 // 187
      if (before) {                                                              // 188
        // If not adding at the end, we need to update indexes.                  // 189
        // XXX this can still be improved greatly!                               // 190
        _.each(posCur, function (pos, id) {                                      // 191
          if (pos >= position)                                                   // 192
            posCur[id]++;                                                        // 193
        });                                                                      // 194
      }                                                                          // 195
                                                                                 // 196
      lengthCur++;                                                               // 197
      posCur[idStringify(id)] = position;                                        // 198
                                                                                 // 199
      callbacks.addedAt(                                                         // 200
        id,                                                                      // 201
        seqArray[posNew[idStringify(id)]].item,                                  // 202
        position,                                                                // 203
        before);                                                                 // 204
    },                                                                           // 205
    movedBefore: function (id, before) {                                         // 206
      if (id === before)                                                         // 207
        return;                                                                  // 208
                                                                                 // 209
      var oldPosition = posCur[idStringify(id)];                                 // 210
      var newPosition = before ? posCur[idStringify(before)] : lengthCur;        // 211
                                                                                 // 212
      // Moving the item forward. The new element is losing one position as it   // 213
      // was removed from the old position before being inserted at the new      // 214
      // position.                                                               // 215
      // Ex.:   0  *1*  2   3   4                                                // 216
      //        0   2   3  *1*  4                                                // 217
      // The original issued callback is "1" before "4".                         // 218
      // The position of "1" is 1, the position of "4" is 4.                     // 219
      // The generated move is (1) -> (3)                                        // 220
      if (newPosition > oldPosition) {                                           // 221
        newPosition--;                                                           // 222
      }                                                                          // 223
                                                                                 // 224
      // Fix up the positions of elements between the old and the new positions  // 225
      // of the moved element.                                                   // 226
      //                                                                         // 227
      // There are two cases:                                                    // 228
      //   1. The element is moved forward. Then all the positions in between    // 229
      //   are moved back.                                                       // 230
      //   2. The element is moved back. Then the positions in between *and* the
      //   element that is currently standing on the moved element's future      // 232
      //   position are moved forward.                                           // 233
      _.each(posCur, function (elCurPosition, id) {                              // 234
        if (oldPosition < elCurPosition && elCurPosition < newPosition)          // 235
          posCur[id]--;                                                          // 236
        else if (newPosition <= elCurPosition && elCurPosition < oldPosition)    // 237
          posCur[id]++;                                                          // 238
      });                                                                        // 239
                                                                                 // 240
      // Finally, update the position of the moved element.                      // 241
      posCur[idStringify(id)] = newPosition;                                     // 242
                                                                                 // 243
      callbacks.movedTo(                                                         // 244
        id,                                                                      // 245
        seqArray[posNew[idStringify(id)]].item,                                  // 246
        oldPosition,                                                             // 247
        newPosition,                                                             // 248
        before);                                                                 // 249
    },                                                                           // 250
    removed: function (id) {                                                     // 251
      var prevPosition = posCur[idStringify(id)];                                // 252
                                                                                 // 253
      _.each(posCur, function (pos, id) {                                        // 254
        if (pos >= prevPosition)                                                 // 255
          posCur[id]--;                                                          // 256
      });                                                                        // 257
                                                                                 // 258
      delete posCur[idStringify(id)];                                            // 259
      lengthCur--;                                                               // 260
                                                                                 // 261
      callbacks.removedAt(                                                       // 262
        id,                                                                      // 263
        lastSeqArray[posOld[idStringify(id)]].item,                              // 264
        prevPosition);                                                           // 265
    }                                                                            // 266
  });                                                                            // 267
                                                                                 // 268
  _.each(posNew, function (pos, idString) {                                      // 269
    var id = idParse(idString);                                                  // 270
    if (_.has(posOld, idString)) {                                               // 271
      // specifically for primitive types, compare equality before               // 272
      // firing the 'changedAt' callback. otherwise, always fire it              // 273
      // because doing a deep EJSON comparison is not guaranteed to              // 274
      // work (an array can contain arbitrary objects, and 'transform'           // 275
      // can be used on cursors). also, deep diffing is not                      // 276
      // necessarily the most efficient (if only a specific subfield             // 277
      // of the object is later accessed).                                       // 278
      var newItem = seqArray[pos].item;                                          // 279
      var oldItem = lastSeqArray[posOld[idString]].item;                         // 280
                                                                                 // 281
      if (typeof newItem === 'object' || newItem !== oldItem)                    // 282
          callbacks.changedAt(id, newItem, oldItem, pos);                        // 283
      }                                                                          // 284
  });                                                                            // 285
};                                                                               // 286
                                                                                 // 287
seqChangedToEmpty = function (lastSeqArray, callbacks) {                         // 288
  return [];                                                                     // 289
};                                                                               // 290
                                                                                 // 291
seqChangedToArray = function (lastSeqArray, array, callbacks) {                  // 292
  var idsUsed = {};                                                              // 293
  var seqArray = _.map(array, function (item, index) {                           // 294
    var id;                                                                      // 295
    if (typeof item === 'string') {                                              // 296
      // ensure not empty, since other layers (eg DomRange) assume this as well  // 297
      id = "-" + item;                                                           // 298
    } else if (typeof item === 'number' ||                                       // 299
               typeof item === 'boolean' ||                                      // 300
               item === undefined ||                                             // 301
               item === null) {                                                  // 302
      id = item;                                                                 // 303
    } else if (typeof item === 'object') {                                       // 304
      id = (item && ('_id' in item)) ? item._id : index;                         // 305
    } else {                                                                     // 306
      throw new Error("{{#each}} doesn't support arrays with " +                 // 307
                      "elements of type " + typeof item);                        // 308
    }                                                                            // 309
                                                                                 // 310
    var idString = idStringify(id);                                              // 311
    if (idsUsed[idString]) {                                                     // 312
      if (item && typeof item === 'object' && '_id' in item)                     // 313
        warn("duplicate id " + id + " in", array);                               // 314
      id = Random.id();                                                          // 315
    } else {                                                                     // 316
      idsUsed[idString] = true;                                                  // 317
    }                                                                            // 318
                                                                                 // 319
    return { _id: id, item: item };                                              // 320
  });                                                                            // 321
                                                                                 // 322
  return seqArray;                                                               // 323
};                                                                               // 324
                                                                                 // 325
seqChangedToCursor = function (lastSeqArray, cursor, callbacks) {                // 326
  var initial = true; // are we observing initial data from cursor?              // 327
  var seqArray = [];                                                             // 328
                                                                                 // 329
  var observeHandle = cursor.observe({                                           // 330
    addedAt: function (document, atIndex, before) {                              // 331
      if (initial) {                                                             // 332
        // keep track of initial data so that we can diff once                   // 333
        // we exit `observe`.                                                    // 334
        if (before !== null)                                                     // 335
          throw new Error("Expected initial data from observe in order");        // 336
        seqArray.push({ _id: document._id, item: document });                    // 337
      } else {                                                                   // 338
        callbacks.addedAt(document._id, document, atIndex, before);              // 339
      }                                                                          // 340
    },                                                                           // 341
    changedAt: function (newDocument, oldDocument, atIndex) {                    // 342
      callbacks.changedAt(newDocument._id, newDocument, oldDocument,             // 343
                          atIndex);                                              // 344
    },                                                                           // 345
    removedAt: function (oldDocument, atIndex) {                                 // 346
      callbacks.removedAt(oldDocument._id, oldDocument, atIndex);                // 347
    },                                                                           // 348
    movedTo: function (document, fromIndex, toIndex, before) {                   // 349
      callbacks.movedTo(                                                         // 350
        document._id, document, fromIndex, toIndex, before);                     // 351
    }                                                                            // 352
  });                                                                            // 353
  initial = false;                                                               // 354
                                                                                 // 355
  return [seqArray, observeHandle];                                              // 356
};                                                                               // 357
                                                                                 // 358
///////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['observe-sequence'] = {}, {
  ObserveSequence: ObserveSequence
});

})();
