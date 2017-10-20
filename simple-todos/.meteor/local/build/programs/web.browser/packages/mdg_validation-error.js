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
var SimpleSchema = Package['aldeed:simple-schema'].SimpleSchema;
var MongoObject = Package['aldeed:simple-schema'].MongoObject;
var meteorInstall = Package.modules.meteorInstall;
var process = Package.modules.process;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;
var Symbol = Package['ecmascript-runtime-client'].Symbol;
var Map = Package['ecmascript-runtime-client'].Map;
var Set = Package['ecmascript-runtime-client'].Set;

/* Package-scope variables */
var ValidationError;

var require = meteorInstall({"node_modules":{"meteor":{"mdg:validation-error":{"validation-error.js":function(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                         //
// packages/mdg_validation-error/validation-error.js                                                       //
//                                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                           //
var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");                                    //
                                                                                                           //
var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);                                           //
                                                                                                           //
var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");              //
                                                                                                           //
var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);                     //
                                                                                                           //
var _inherits2 = require("babel-runtime/helpers/inherits");                                                //
                                                                                                           //
var _inherits3 = _interopRequireDefault(_inherits2);                                                       //
                                                                                                           //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }          //
                                                                                                           //
/* global ValidationError:true */ /* global SimpleSchema */ // This is exactly what comes out of SS.       // 1
var errorSchema = new SimpleSchema({                                                                       // 5
  name: {                                                                                                  // 6
    type: String                                                                                           // 6
  },                                                                                                       // 6
  type: {                                                                                                  // 7
    type: String                                                                                           // 7
  },                                                                                                       // 7
  details: {                                                                                               // 8
    type: Object,                                                                                          // 8
    blackbox: true,                                                                                        // 8
    optional: true                                                                                         // 8
  }                                                                                                        // 8
});                                                                                                        // 5
var errorsSchema = new SimpleSchema({                                                                      // 11
  errors: {                                                                                                // 12
    type: Array                                                                                            // 12
  },                                                                                                       // 12
  'errors.$': {                                                                                            // 13
    type: errorSchema                                                                                      // 13
  }                                                                                                        // 13
});                                                                                                        // 11
                                                                                                           //
ValidationError = function (_Meteor$Error) {                                                               // 16
  (0, _inherits3.default)(_class, _Meteor$Error);                                                          // 16
                                                                                                           //
  function _class(errors) {                                                                                // 17
    var message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Validation Failed';
    (0, _classCallCheck3.default)(this, _class);                                                           // 17
    errorsSchema.validate({                                                                                // 18
      errors: errors                                                                                       // 18
    });                                                                                                    // 18
                                                                                                           //
    var _this = (0, _possibleConstructorReturn3.default)(this, _Meteor$Error.call(this, ValidationError.ERROR_CODE, message, errors));
                                                                                                           //
    _this.errors = errors;                                                                                 // 22
    return _this;                                                                                          // 17
  }                                                                                                        // 23
                                                                                                           //
  return _class;                                                                                           // 16
}(Meteor.Error); // If people use this to check for the error code, we can change it                       // 16
// in future versions                                                                                      // 27
                                                                                                           //
                                                                                                           //
ValidationError.ERROR_CODE = 'validation-error';                                                           // 28
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});
require("./node_modules/meteor/mdg:validation-error/validation-error.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['mdg:validation-error'] = {}, {
  ValidationError: ValidationError
});

})();
