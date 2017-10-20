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
var meteorInstall = Package.modules.meteorInstall;
var process = Package.modules.process;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;
var Symbol = Package['ecmascript-runtime-client'].Symbol;
var Map = Package['ecmascript-runtime-client'].Map;
var Set = Package['ecmascript-runtime-client'].Set;

/* Package-scope variables */
var ReactMeteorData;

var require = meteorInstall({"node_modules":{"meteor":{"react-meteor-data":{"react-meteor-data.jsx":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                         //
// packages/react-meteor-data/react-meteor-data.jsx                                                        //
//                                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                           //
module.watch(require("./createContainer.jsx"), {                                                           // 1
  "default": function (v) {                                                                                // 1
    exports.createContainer = v;                                                                           // 1
  }                                                                                                        // 1
}, 1);                                                                                                     // 1
module.watch(require("./ReactMeteorData.jsx"), {                                                           // 1
  ReactMeteorData: function (v) {                                                                          // 1
    exports.ReactMeteorData = v;                                                                           // 1
  }                                                                                                        // 1
}, 2);                                                                                                     // 1
var checkNpmVersions = void 0;                                                                             // 1
module.watch(require("meteor/tmeasday:check-npm-versions"), {                                              // 1
  checkNpmVersions: function (v) {                                                                         // 1
    checkNpmVersions = v;                                                                                  // 1
  }                                                                                                        // 1
}, 0);                                                                                                     // 1
checkNpmVersions({                                                                                         // 3
  react: '15.x'                                                                                            // 4
}, 'react-meteor-data');                                                                                   // 3
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ReactMeteorData.jsx":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                         //
// packages/react-meteor-data/ReactMeteorData.jsx                                                          //
//                                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                           //
var _extends2 = require("babel-runtime/helpers/extends");                                                  //
                                                                                                           //
var _extends3 = _interopRequireDefault(_extends2);                                                         //
                                                                                                           //
var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");              //
                                                                                                           //
var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);                     //
                                                                                                           //
var _inherits2 = require("babel-runtime/helpers/inherits");                                                //
                                                                                                           //
var _inherits3 = _interopRequireDefault(_inherits2);                                                       //
                                                                                                           //
var _typeof2 = require("babel-runtime/helpers/typeof");                                                    //
                                                                                                           //
var _typeof3 = _interopRequireDefault(_typeof2);                                                           //
                                                                                                           //
var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");                                    //
                                                                                                           //
var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);                                           //
                                                                                                           //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }          //
                                                                                                           //
module.export({                                                                                            // 1
  ReactMeteorData: function () {                                                                           // 1
    return ReactMeteorData;                                                                                // 1
  },                                                                                                       // 1
  connect: function () {                                                                                   // 1
    return connect;                                                                                        // 1
  }                                                                                                        // 1
});                                                                                                        // 1
var React = void 0;                                                                                        // 1
module.watch(require("react"), {                                                                           // 1
  "default": function (v) {                                                                                // 1
    React = v;                                                                                             // 1
  }                                                                                                        // 1
}, 0);                                                                                                     // 1
var Meteor = void 0;                                                                                       // 1
module.watch(require("meteor/meteor"), {                                                                   // 1
  Meteor: function (v) {                                                                                   // 1
    Meteor = v;                                                                                            // 1
  }                                                                                                        // 1
}, 1);                                                                                                     // 1
var Tracker = void 0;                                                                                      // 1
module.watch(require("meteor/tracker"), {                                                                  // 1
  Tracker: function (v) {                                                                                  // 1
    Tracker = v;                                                                                           // 1
  }                                                                                                        // 1
}, 2);                                                                                                     // 1
                                                                                                           //
// A class to keep the state and utility methods needed to manage                                          // 8
// the Meteor data for a component.                                                                        // 9
var MeteorDataManager = function () {                                                                      //
  function MeteorDataManager(component) {                                                                  // 11
    (0, _classCallCheck3.default)(this, MeteorDataManager);                                                // 11
    this.component = component;                                                                            // 12
    this.computation = null;                                                                               // 13
    this.oldData = null;                                                                                   // 14
  }                                                                                                        // 15
                                                                                                           //
  MeteorDataManager.prototype.dispose = function () {                                                      //
    function dispose() {                                                                                   //
      if (this.computation) {                                                                              // 18
        this.computation.stop();                                                                           // 19
        this.computation = null;                                                                           // 20
      }                                                                                                    // 21
    }                                                                                                      // 22
                                                                                                           //
    return dispose;                                                                                        //
  }();                                                                                                     //
                                                                                                           //
  MeteorDataManager.prototype.calculateData = function () {                                                //
    function calculateData() {                                                                             //
      var component = this.component;                                                                      // 25
                                                                                                           //
      if (!component.getMeteorData) {                                                                      // 27
        return null;                                                                                       // 28
      } // When rendering on the server, we don't want to use the Tracker.                                 // 29
      // We only do the first rendering on the server so we can get the data right away                    // 32
                                                                                                           //
                                                                                                           //
      if (Meteor.isServer) {                                                                               // 33
        return component.getMeteorData();                                                                  // 34
      }                                                                                                    // 35
                                                                                                           //
      if (this.computation) {                                                                              // 37
        this.computation.stop();                                                                           // 38
        this.computation = null;                                                                           // 39
      }                                                                                                    // 40
                                                                                                           //
      var data = void 0; // Use Tracker.nonreactive in case we are inside a Tracker Computation.           // 42
      // This can happen if someone calls `ReactDOM.render` inside a Computation.                          // 44
      // In that case, we want to opt out of the normal behavior of nested                                 // 45
      // Computations, where if the outer one is invalidated or stopped,                                   // 46
      // it stops the inner one.                                                                           // 47
                                                                                                           //
      this.computation = Tracker.nonreactive(function () {                                                 // 48
        return Tracker.autorun(function (c) {                                                              // 48
          if (c.firstRun) {                                                                                // 50
            var savedSetState = component.setState;                                                        // 51
                                                                                                           //
            try {                                                                                          // 52
              component.setState = function () {                                                           // 53
                throw new Error('Can\'t call `setState` inside `getMeteorData` as this could ' + 'cause an endless loop. To respond to Meteor data changing, ' + 'consider making this component a \"wrapper component\" that ' + 'only fetches data and passes it in as props to a child ' + 'component. Then you can use `componentWillReceiveProps` in ' + 'that child component.');
              };                                                                                           // 61
                                                                                                           //
              data = component.getMeteorData();                                                            // 63
            } finally {                                                                                    // 64
              component.setState = savedSetState;                                                          // 65
            }                                                                                              // 66
          } else {                                                                                         // 67
            // Stop this computation instead of using the re-run.                                          // 68
            // We use a brand-new autorun for each call to getMeteorData                                   // 69
            // to capture dependencies on any reactive data sources that                                   // 70
            // are accessed.  The reason we can't use a single autorun                                     // 71
            // for the lifetime of the component is that Tracker only                                      // 72
            // re-runs autoruns at flush time, while we need to be able to                                 // 73
            // re-call getMeteorData synchronously whenever we want, e.g.                                  // 74
            // from componentWillUpdate.                                                                   // 75
            c.stop(); // Calling forceUpdate() triggers componentWillUpdate which                          // 76
            // recalculates getMeteorData() and re-renders the component.                                  // 78
                                                                                                           //
            component.forceUpdate();                                                                       // 79
          }                                                                                                // 80
        });                                                                                                // 81
      });                                                                                                  // 48
                                                                                                           //
      if (Package.mongo && Package.mongo.Mongo) {                                                          // 84
        Object.keys(data).forEach(function (key) {                                                         // 85
          if (data[key] instanceof Package.mongo.Mongo.Cursor) {                                           // 86
            console.warn('Warning: you are returning a Mongo cursor from getMeteorData. ' + 'This value will not be reactive. You probably want to call ' + '`.fetch()` on the cursor before returning it.');
          }                                                                                                // 92
        });                                                                                                // 93
      }                                                                                                    // 94
                                                                                                           //
      return data;                                                                                         // 96
    }                                                                                                      // 97
                                                                                                           //
    return calculateData;                                                                                  //
  }();                                                                                                     //
                                                                                                           //
  MeteorDataManager.prototype.updateData = function () {                                                   //
    function updateData(newData) {                                                                         //
      var component = this.component;                                                                      // 100
      var oldData = this.oldData;                                                                          // 101
                                                                                                           //
      if (!(newData && (typeof newData === "undefined" ? "undefined" : (0, _typeof3.default)(newData)) === 'object')) {
        throw new Error('Expected object returned from getMeteorData');                                    // 104
      } // update componentData in place based on newData                                                  // 105
                                                                                                           //
                                                                                                           //
      for (var key in meteorBabelHelpers.sanitizeForInObject(newData)) {                                   // 107
        component.data[key] = newData[key];                                                                // 108
      } // if there is oldData (which is every time this method is called                                  // 109
      // except the first), delete keys in newData that aren't in                                          // 111
      // oldData.  don't interfere with other keys, in case we are                                         // 112
      // co-existing with something else that writes to a component's                                      // 113
      // this.data.                                                                                        // 114
                                                                                                           //
                                                                                                           //
      if (oldData) {                                                                                       // 115
        for (var _key in meteorBabelHelpers.sanitizeForInObject(oldData)) {                                // 116
          if (!(_key in newData)) {                                                                        // 117
            delete component.data[_key];                                                                   // 118
          }                                                                                                // 119
        }                                                                                                  // 120
      }                                                                                                    // 121
                                                                                                           //
      this.oldData = newData;                                                                              // 122
    }                                                                                                      // 123
                                                                                                           //
    return updateData;                                                                                     //
  }();                                                                                                     //
                                                                                                           //
  return MeteorDataManager;                                                                                //
}();                                                                                                       //
                                                                                                           //
var ReactMeteorData = {                                                                                    // 126
  componentWillMount: function () {                                                                        // 127
    this.data = {};                                                                                        // 128
    this._meteorDataManager = new MeteorDataManager(this);                                                 // 129
                                                                                                           //
    var newData = this._meteorDataManager.calculateData();                                                 // 130
                                                                                                           //
    this._meteorDataManager.updateData(newData);                                                           // 131
  },                                                                                                       // 132
  componentWillUpdate: function (nextProps, nextState) {                                                   // 134
    var saveProps = this.props;                                                                            // 135
    var saveState = this.state;                                                                            // 136
    var newData = void 0;                                                                                  // 137
                                                                                                           //
    try {                                                                                                  // 138
      // Temporarily assign this.state and this.props,                                                     // 139
      // so that they are seen by getMeteorData!                                                           // 140
      // This is a simulation of how the proposed Observe API                                              // 141
      // for React will work, which calls observe() after                                                  // 142
      // componentWillUpdate and after props and state are                                                 // 143
      // updated, but before render() is called.                                                           // 144
      // See https://github.com/facebook/react/issues/3398.                                                // 145
      this.props = nextProps;                                                                              // 146
      this.state = nextState;                                                                              // 147
      newData = this._meteorDataManager.calculateData();                                                   // 148
    } finally {                                                                                            // 149
      this.props = saveProps;                                                                              // 150
      this.state = saveState;                                                                              // 151
    }                                                                                                      // 152
                                                                                                           //
    this._meteorDataManager.updateData(newData);                                                           // 154
  },                                                                                                       // 155
  componentWillUnmount: function () {                                                                      // 157
    this._meteorDataManager.dispose();                                                                     // 158
  }                                                                                                        // 159
};                                                                                                         // 126
                                                                                                           //
var ReactComponent = function (_React$Component) {                                                         //
  (0, _inherits3.default)(ReactComponent, _React$Component);                                               //
                                                                                                           //
  function ReactComponent() {                                                                              //
    (0, _classCallCheck3.default)(this, ReactComponent);                                                   //
    return (0, _possibleConstructorReturn3.default)(this, _React$Component.apply(this, arguments));        //
  }                                                                                                        //
                                                                                                           //
  return ReactComponent;                                                                                   //
}(React.Component);                                                                                        //
                                                                                                           //
Object.assign(ReactComponent.prototype, ReactMeteorData);                                                  // 163
                                                                                                           //
var ReactPureComponent = function (_React$PureComponent) {                                                 //
  (0, _inherits3.default)(ReactPureComponent, _React$PureComponent);                                       //
                                                                                                           //
  function ReactPureComponent() {                                                                          //
    (0, _classCallCheck3.default)(this, ReactPureComponent);                                               //
    return (0, _possibleConstructorReturn3.default)(this, _React$PureComponent.apply(this, arguments));    //
  }                                                                                                        //
                                                                                                           //
  return ReactPureComponent;                                                                               //
}(React.PureComponent);                                                                                    //
                                                                                                           //
Object.assign(ReactPureComponent.prototype, ReactMeteorData);                                              // 165
                                                                                                           //
function connect(_ref) {                                                                                   // 167
  var _getMeteorData = _ref.getMeteorData,                                                                 // 167
      _ref$pure = _ref.pure,                                                                               // 167
      pure = _ref$pure === undefined ? true : _ref$pure;                                                   // 167
  var BaseComponent = pure ? ReactPureComponent : ReactComponent;                                          // 168
  return function (WrappedComponent) {                                                                     // 169
    return function (_BaseComponent) {                                                                     // 169
      (0, _inherits3.default)(ReactMeteorDataComponent, _BaseComponent);                                   // 169
                                                                                                           //
      function ReactMeteorDataComponent() {                                                                // 169
        (0, _classCallCheck3.default)(this, ReactMeteorDataComponent);                                     // 169
        return (0, _possibleConstructorReturn3.default)(this, _BaseComponent.apply(this, arguments));      // 169
      }                                                                                                    // 169
                                                                                                           //
      ReactMeteorDataComponent.prototype.getMeteorData = function () {                                     // 169
        function getMeteorData() {                                                                         // 169
          return _getMeteorData(this.props);                                                               // 172
        }                                                                                                  // 173
                                                                                                           //
        return getMeteorData;                                                                              // 169
      }();                                                                                                 // 169
                                                                                                           //
      ReactMeteorDataComponent.prototype.render = function () {                                            // 169
        function render() {                                                                                // 169
          return React.createElement(WrappedComponent, (0, _extends3.default)({}, this.props, this.data));
        }                                                                                                  // 176
                                                                                                           //
        return render;                                                                                     // 169
      }();                                                                                                 // 169
                                                                                                           //
      return ReactMeteorDataComponent;                                                                     // 169
    }(BaseComponent);                                                                                      // 169
  };                                                                                                       // 169
}                                                                                                          // 179
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"createContainer.jsx":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                         //
// packages/react-meteor-data/createContainer.jsx                                                          //
//                                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                           //
module.export({                                                                                            // 1
  "default": function () {                                                                                 // 1
    return createContainer;                                                                                // 1
  }                                                                                                        // 1
});                                                                                                        // 1
var React = void 0;                                                                                        // 1
module.watch(require("react"), {                                                                           // 1
  "default": function (v) {                                                                                // 1
    React = v;                                                                                             // 1
  }                                                                                                        // 1
}, 0);                                                                                                     // 1
var connect = void 0;                                                                                      // 1
module.watch(require("./ReactMeteorData.jsx"), {                                                           // 1
  connect: function (v) {                                                                                  // 1
    connect = v;                                                                                           // 1
  }                                                                                                        // 1
}, 1);                                                                                                     // 1
                                                                                                           //
function createContainer() {                                                                               // 8
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};                    // 8
  var Component = arguments[1];                                                                            // 8
  var expandedOptions = options;                                                                           // 9
                                                                                                           //
  if (typeof options === 'function') {                                                                     // 10
    expandedOptions = {                                                                                    // 11
      getMeteorData: options                                                                               // 12
    };                                                                                                     // 11
  }                                                                                                        // 14
                                                                                                           //
  return connect(expandedOptions)(Component);                                                              // 16
}                                                                                                          // 17
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json",
    ".jsx"
  ]
});
var exports = require("./node_modules/meteor/react-meteor-data/react-meteor-data.jsx");

/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['react-meteor-data'] = exports, {
  ReactMeteorData: ReactMeteorData
});

})();
