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
var _ = Package.underscore._;
var meteorInstall = Package.modules.meteorInstall;
var process = Package.modules.process;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;
var Symbol = Package['ecmascript-runtime-client'].Symbol;
var Map = Package['ecmascript-runtime-client'].Map;
var Set = Package['ecmascript-runtime-client'].Set;

/* Package-scope variables */
var WebApp;

var require = meteorInstall({"node_modules":{"meteor":{"webapp":{"webapp_client.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/webapp/webapp_client.js                                  //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
module.export({                                                      // 1
  WebApp: function () {                                              // 1
    return WebApp;                                                   // 1
  }                                                                  // 1
});                                                                  // 1
var WebApp = {                                                       // 1
  _isCssLoaded: function () {                                        // 2
    if (document.styleSheets.length === 0) {                         // 3
      return true;                                                   // 4
    }                                                                // 5
                                                                     //
    return _.find(document.styleSheets, function (sheet) {           // 7
      if (sheet.cssText && !sheet.cssRules) {                        // 8
        // IE8                                                       // 8
        return !sheet.cssText.match(/meteor-css-not-found-error/);   // 9
      }                                                              // 10
                                                                     //
      return !_.find(sheet.cssRules, function (rule) {               // 12
        return rule.selectorText === '.meteor-css-not-found-error';  // 14
      });                                                            // 14
    });                                                              // 16
  }                                                                  // 17
};                                                                   // 1
///////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});
var exports = require("./node_modules/meteor/webapp/webapp_client.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package.webapp = exports, {
  WebApp: WebApp
});

})();
