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
var meteorInstall = Package.modules.meteorInstall;
var process = Package.modules.process;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Symbol, Map, Set;

var require = meteorInstall({"node_modules":{"meteor":{"ecmascript-runtime-client":{"runtime.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////
//                                                                      //
// packages/ecmascript-runtime-client/runtime.js                        //
//                                                                      //
//////////////////////////////////////////////////////////////////////////
                                                                        //
try {                                                                   // 1
  require("core-js/modules/es6.symbol");                                // 2
  require("core-js/modules/es6.map");                                   // 3
  require("core-js/modules/es6.set");                                   // 4
                                                                        // 5
  var core = function () {                                              // 6
    try {                                                               // 7
      return require("core-js/modules/_core");                          // 8
    } catch (e) {                                                       // 9
      // Older versions of core-js had a different file layout.         // 10
      return require("core-js/modules/$.core");                         // 11
    }                                                                   // 12
  }();                                                                  // 13
                                                                        // 14
} catch (e) {                                                           // 15
  throw new Error([                                                     // 16
    "The core-js npm package could not be found in your node_modules ",
    "directory. Please run the following command to install it:",       // 18
    "",                                                                 // 19
    "  meteor npm install --save core-js",                              // 20
    ""                                                                  // 21
  ].join("\n"));                                                        // 22
}                                                                       // 23
                                                                        // 24
Symbol = exports.Symbol = core.Symbol;                                  // 25
Map = exports.Map = core.Map;                                           // 26
Set = exports.Set = core.Set;                                           // 27
                                                                        // 28
// ECMAScript 2015 polyfills.                                           // 29
require("core-js/es6/array");                                           // 30
require("core-js/es6/function");                                        // 31
require("core-js/es6/math");                                            // 32
require("core-js/es6/object");                                          // 33
require("core-js/es6/regexp");                                          // 34
require("core-js/es6/string");                                          // 35
require("core-js/es6/weak-map");                                        // 36
require("core-js/es6/weak-set");                                        // 37
                                                                        // 38
// ECMAScript 2017 polyfills.                                           // 39
require("core-js/es7/array");                                           // 40
require("core-js/es7/object");                                          // 41
                                                                        // 42
// We want everything from the core-js/es6/number module except         // 43
// es6.number.constructor.                                              // 44
require('core-js/modules/es6.number.epsilon');                          // 45
require('core-js/modules/es6.number.is-finite');                        // 46
require('core-js/modules/es6.number.is-integer');                       // 47
require('core-js/modules/es6.number.is-nan');                           // 48
require('core-js/modules/es6.number.is-safe-integer');                  // 49
require('core-js/modules/es6.number.max-safe-integer');                 // 50
require('core-js/modules/es6.number.min-safe-integer');                 // 51
require('core-js/modules/es6.number.parse-float');                      // 52
require('core-js/modules/es6.number.parse-int');                        // 53
                                                                        // 54
// Typed Arrays                                                         // 55
require('core-js/modules/es6.typed.uint8-array');                       // 56
require('core-js/modules/es6.typed.uint32-array');                      // 57
                                                                        // 58
//////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});
var exports = require("./node_modules/meteor/ecmascript-runtime-client/runtime.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['ecmascript-runtime-client'] = exports, {
  Symbol: Symbol,
  Map: Map,
  Set: Set
});

})();
