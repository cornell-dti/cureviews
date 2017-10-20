var require = meteorInstall({"client":{"template.main.js":function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// client/template.main.js                                                                                         //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
                                                                                                                   // 1
Template.body.addContent((function() {                                                                             // 2
  var view = this;                                                                                                 // 3
  return HTML.Raw('<div id="render-target"></div>');                                                               // 4
}));                                                                                                               // 5
Meteor.startup(Template.body.renderToDocument);                                                                    // 6
                                                                                                                   // 7
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"main.jsx":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// client/main.jsx                                                                                                 //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var React = void 0;                                                                                                // 1
module.watch(require("react"), {                                                                                   // 1
  "default": function (v) {                                                                                        // 1
    React = v;                                                                                                     // 1
  }                                                                                                                // 1
}, 0);                                                                                                             // 1
var Meteor = void 0;                                                                                               // 1
module.watch(require("meteor/meteor"), {                                                                           // 1
  Meteor: function (v) {                                                                                           // 1
    Meteor = v;                                                                                                    // 1
  }                                                                                                                // 1
}, 1);                                                                                                             // 1
var render = void 0;                                                                                               // 1
module.watch(require("react-dom"), {                                                                               // 1
  render: function (v) {                                                                                           // 1
    render = v;                                                                                                    // 1
  }                                                                                                                // 1
}, 2);                                                                                                             // 1
var App = void 0;                                                                                                  // 1
module.watch(require("../imports/ui/App.jsx"), {                                                                   // 1
  "default": function (v) {                                                                                        // 1
    App = v;                                                                                                       // 1
  }                                                                                                                // 1
}, 3);                                                                                                             // 1
var Update = void 0;                                                                                               // 1
module.watch(require("../imports/ui/Update.jsx"), {                                                                // 1
  "default": function (v) {                                                                                        // 1
    Update = v;                                                                                                    // 1
  }                                                                                                                // 1
}, 4);                                                                                                             // 1
Meteor.startup(function () {                                                                                       // 8
  render(React.createElement(App, {                                                                                // 9
    query: ""                                                                                                      // 9
  }), document.getElementById('render-target')); //render(<Update />, document.getElementById('render-target'));   // 9
});                                                                                                                // 11
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"imports":{"ui":{"css":{"CourseCard.css":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/css/CourseCard.css                                                                                   //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
module.exports = require("meteor/modules").addStyles(                                                              // 1
  ".cornellClassLink {\n  color: #4A4A4A;\n  text-decoration: underline;\n}\n\n.primary-text {\n  color: #4A4A4A;\n}\n\n.spacing-small{\n  line-height: 10px;\n}\n\n.spacing-medium {\n  line-height: 20px;\n}\n\n.spacing-large {\n  line-height: 40px;\n}\n"
);                                                                                                                 // 3
                                                                                                                   // 4
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"js":{"CourseCard.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/js/CourseCard.js                                                                                     //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
module.export({                                                                                                    // 1
  lastOfferedSems: function () {                                                                                   // 1
    return lastOfferedSems;                                                                                        // 1
  },                                                                                                               // 1
  semAbbriviationToWord: function () {                                                                             // 1
    return semAbbriviationToWord;                                                                                  // 1
  },                                                                                                               // 1
  lastSem: function () {                                                                                           // 1
    return lastSem;                                                                                                // 1
  }                                                                                                                // 1
});                                                                                                                // 1
                                                                                                                   //
function lastOfferedSems(theClass) {                                                                               // 1
  var semsArray = theClass.classSems;                                                                              // 2
  var lastSemester = semsArray[semsArray.length - 1];                                                              // 3
  var lastSemester2 = semsArray[semsArray.length - 2];                                                             // 4
                                                                                                                   //
  if (lastSemester2 != null) {                                                                                     // 5
    var lastTwoOffered = semAbbriviationToWord(semsArray[semsArray.length - 1]) + ", " + semAbbriviationToWord(semsArray[semsArray.length - 2]);
  } else {                                                                                                         // 7
    var lastTwoOffered = semAbbriviationToWord(semsArray[semsArray.length - 1]);                                   // 9
  }                                                                                                                // 10
                                                                                                                   //
  return lastTwoOffered;                                                                                           // 13
}                                                                                                                  // 14
                                                                                                                   //
function semAbbriviationToWord(sem) {                                                                              // 16
  var abbreviation = String(sem);                                                                                  // 17
                                                                                                                   //
  switch (abbreviation.substring(0, 2)) {                                                                          // 18
    case "SP":                                                                                                     // 19
      return "Spring \'" + abbreviation.substring(2);                                                              // 20
                                                                                                                   //
    case "FA":                                                                                                     // 21
      return "Fall \'" + abbreviation.substring(2);                                                                // 22
                                                                                                                   //
    case "SU":                                                                                                     // 23
      return "Summer \'" + abbreviation.substring(2);                                                              // 24
  }                                                                                                                // 18
}                                                                                                                  // 26
                                                                                                                   //
function lastSem(sem) {                                                                                            // 28
  var semesterList = String(sem);                                                                                  // 29
  return semesterList.substring(semesterList.length - 4);                                                          // 30
}                                                                                                                  // 31
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"App.jsx":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/App.jsx                                                                                              //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");                                            //
                                                                                                                   //
var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);                                                   //
                                                                                                                   //
var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");                      //
                                                                                                                   //
var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);                             //
                                                                                                                   //
var _inherits2 = require("babel-runtime/helpers/inherits");                                                        //
                                                                                                                   //
var _inherits3 = _interopRequireDefault(_inherits2);                                                               //
                                                                                                                   //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }                  //
                                                                                                                   //
var React = void 0,                                                                                                // 1
    Component = void 0,                                                                                            // 1
    PropTypes = void 0;                                                                                            // 1
module.watch(require("react"), {                                                                                   // 1
  "default": function (v) {                                                                                        // 1
    React = v;                                                                                                     // 1
  },                                                                                                               // 1
  Component: function (v) {                                                                                        // 1
    Component = v;                                                                                                 // 1
  },                                                                                                               // 1
  PropTypes: function (v) {                                                                                        // 1
    PropTypes = v;                                                                                                 // 1
  }                                                                                                                // 1
}, 0);                                                                                                             // 1
var createContainer = void 0;                                                                                      // 1
module.watch(require("meteor/react-meteor-data"), {                                                                // 1
  createContainer: function (v) {                                                                                  // 1
    createContainer = v;                                                                                           // 1
  }                                                                                                                // 1
}, 1);                                                                                                             // 1
var Classes = void 0;                                                                                              // 1
module.watch(require("../api/classes.js"), {                                                                       // 1
  Classes: function (v) {                                                                                          // 1
    Classes = v;                                                                                                   // 1
  }                                                                                                                // 1
}, 2);                                                                                                             // 1
var Form = void 0;                                                                                                 // 1
module.watch(require("./Form.jsx"), {                                                                              // 1
  "default": function (v) {                                                                                        // 1
    Form = v;                                                                                                      // 1
  }                                                                                                                // 1
}, 3);                                                                                                             // 1
var Course = void 0;                                                                                               // 1
module.watch(require("./Course.jsx"), {                                                                            // 1
  "default": function (v) {                                                                                        // 1
    Course = v;                                                                                                    // 1
  }                                                                                                                // 1
}, 4);                                                                                                             // 1
var CourseCard = void 0;                                                                                           // 1
module.watch(require("./CourseCard.jsx"), {                                                                        // 1
  "default": function (v) {                                                                                        // 1
    CourseCard = v;                                                                                                // 1
  }                                                                                                                // 1
}, 5);                                                                                                             // 1
var SearchBar = void 0;                                                                                            // 1
module.watch(require("./SearchBar.jsx"), {                                                                         // 1
  "default": function (v) {                                                                                        // 1
    SearchBar = v;                                                                                                 // 1
  }                                                                                                                // 1
}, 6);                                                                                                             // 1
var CourseReviews = void 0;                                                                                        // 1
module.watch(require("./CourseReviews.jsx"), {                                                                     // 1
  "default": function (v) {                                                                                        // 1
    CourseReviews = v;                                                                                             // 1
  }                                                                                                                // 1
}, 7);                                                                                                             // 1
                                                                                                                   //
// App component - represents the whole app                                                                        // 10
var App = function (_Component) {                                                                                  //
  (0, _inherits3.default)(App, _Component);                                                                        //
                                                                                                                   //
  function App(props) {                                                                                            // 12
    (0, _classCallCheck3.default)(this, App);                                                                      // 12
                                                                                                                   //
    // state of the app will change depending on class selection and current search query                          // 15
    var _this = (0, _possibleConstructorReturn3.default)(this, _Component.call(this, props));                      // 12
                                                                                                                   //
    _this.state = {                                                                                                // 16
      selectedClass: null,                                                                                         // 17
      query: "" // bind functions called in other files to this context, so that current state is still accessable
                                                                                                                   //
    };                                                                                                             // 16
    _this.handleSelectClass = _this.handleSelectClass.bind(_this);                                                 // 22
    _this.updateQuery = _this.updateQuery.bind(_this);                                                             // 23
    return _this;                                                                                                  // 12
  } //get the full class details for the clicked class. Called in Course.jsx                                       // 24
                                                                                                                   //
                                                                                                                   //
  App.prototype.handleSelectClass = function () {                                                                  //
    function handleSelectClass(classId) {                                                                          //
      var _this2 = this;                                                                                           // 27
                                                                                                                   //
      Meteor.call('getCourseById', classId, function (error, result) {                                             // 28
        if (!error) {                                                                                              // 29
          _this2.setState({                                                                                        // 30
            selectedClass: result,                                                                                 // 30
            query: ""                                                                                              // 30
          });                                                                                                      // 30
        } else {                                                                                                   // 31
          console.log(error);                                                                                      // 32
        }                                                                                                          // 33
      });                                                                                                          // 34
    }                                                                                                              // 35
                                                                                                                   //
    return handleSelectClass;                                                                                      //
  }(); //set the state variable to the current value of the input. Called in SearchBar.jsx                         //
                                                                                                                   //
                                                                                                                   //
  App.prototype.updateQuery = function () {                                                                        //
    function updateQuery(event) {                                                                                  //
      this.setState({                                                                                              // 39
        query: event.target.value                                                                                  // 39
      });                                                                                                          // 39
    }                                                                                                              // 40
                                                                                                                   //
    return updateQuery;                                                                                            //
  }(); //check if a class is selected, and show a coursecard only when one is.                                     //
                                                                                                                   //
                                                                                                                   //
  App.prototype.renderCourseCard = function () {                                                                   //
    function renderCourseCard() {                                                                                  //
      var toShow = React.createElement("div", null); //empty div                                                   // 44
                                                                                                                   //
      if (this.state.selectedClass != null) {                                                                      // 45
        toShow = React.createElement(CourseCard, {                                                                 // 46
          course: this.state.selectedClass                                                                         // 46
        });                                                                                                        // 46
      }                                                                                                            // 47
                                                                                                                   //
      return toShow;                                                                                               // 48
    }                                                                                                              // 49
                                                                                                                   //
    return renderCourseCard;                                                                                       //
  }(); //check if a class is selected, dispay an add review form only when one is                                  //
                                                                                                                   //
                                                                                                                   //
  App.prototype.renderForm = function () {                                                                         //
    function renderForm() {                                                                                        //
      var toShow = React.createElement("div", null);                                                               // 53
                                                                                                                   //
      if (this.state.selectedClass != null) {                                                                      // 54
        toShow = React.createElement(Form, {                                                                       // 55
          courseId: this.state.selectedClass._id                                                                   // 55
        });                                                                                                        // 55
      }                                                                                                            // 56
                                                                                                                   //
      return toShow;                                                                                               // 57
    }                                                                                                              // 58
                                                                                                                   //
    return renderForm;                                                                                             //
  }(); //check if a class is selected, dispay paast reviews for the class, only when one is selected               //
                                                                                                                   //
                                                                                                                   //
  App.prototype.renderPastReviews = function () {                                                                  //
    function renderPastReviews() {                                                                                 //
      var toShow = React.createElement("div", null);                                                               // 62
                                                                                                                   //
      if (this.state.selectedClass != null) {                                                                      // 63
        toShow = React.createElement(CourseReviews, {                                                              // 64
          courseId: this.state.selectedClass._id                                                                   // 64
        });                                                                                                        // 64
      }                                                                                                            // 65
                                                                                                                   //
      return toShow;                                                                                               // 66
    }                                                                                                              // 67
                                                                                                                   //
    return renderPastReviews;                                                                                      //
  }();                                                                                                             //
                                                                                                                   //
  App.prototype.render = function () {                                                                             //
    function render() {                                                                                            //
      return React.createElement(                                                                                  // 70
        "div",                                                                                                     // 71
        {                                                                                                          // 71
          className: "container"                                                                                   // 71
        },                                                                                                         // 71
        React.createElement(                                                                                       // 72
          "div",                                                                                                   // 72
          {                                                                                                        // 72
            className: "row"                                                                                       // 72
          },                                                                                                       // 72
          React.createElement(SearchBar, {                                                                         // 73
            query: this.state.query,                                                                               // 73
            queryFunc: this.updateQuery,                                                                           // 73
            clickFunc: this.handleSelectClass                                                                      // 73
          })                                                                                                       // 73
        ),                                                                                                         // 72
        React.createElement(                                                                                       // 75
          "div",                                                                                                   // 75
          {                                                                                                        // 75
            className: "row"                                                                                       // 75
          },                                                                                                       // 75
          React.createElement(                                                                                     // 76
            "div",                                                                                                 // 76
            {                                                                                                      // 76
              className: "col-md-6"                                                                                // 76
            },                                                                                                     // 76
            this.renderCourseCard()                                                                                // 77
          ),                                                                                                       // 76
          React.createElement(                                                                                     // 79
            "div",                                                                                                 // 79
            {                                                                                                      // 79
              className: "col-md-6 panel-container fix-contain"                                                    // 79
            },                                                                                                     // 79
            React.createElement(                                                                                   // 80
              "div",                                                                                               // 80
              {                                                                                                    // 80
                className: "row"                                                                                   // 80
              },                                                                                                   // 80
              this.renderForm()                                                                                    // 81
            ),                                                                                                     // 80
            React.createElement(                                                                                   // 83
              "div",                                                                                               // 83
              {                                                                                                    // 83
                className: "row"                                                                                   // 83
              },                                                                                                   // 83
              this.renderPastReviews()                                                                             // 84
            )                                                                                                      // 83
          )                                                                                                        // 79
        )                                                                                                          // 75
      );                                                                                                           // 71
    }                                                                                                              // 90
                                                                                                                   //
    return render;                                                                                                 //
  }();                                                                                                             //
                                                                                                                   //
  return App;                                                                                                      //
}(Component);                                                                                                      //
                                                                                                                   //
App.propTypes = {};                                                                                                // 93
module.exportDefault(createContainer(function (props) {                                                            // 1
  return {};                                                                                                       // 95
}, App));                                                                                                          // 95
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"Course.jsx":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/Course.jsx                                                                                           //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");                                            //
                                                                                                                   //
var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);                                                   //
                                                                                                                   //
var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");                      //
                                                                                                                   //
var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);                             //
                                                                                                                   //
var _inherits2 = require("babel-runtime/helpers/inherits");                                                        //
                                                                                                                   //
var _inherits3 = _interopRequireDefault(_inherits2);                                                               //
                                                                                                                   //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }                  //
                                                                                                                   //
module.export({                                                                                                    // 1
  "default": function () {                                                                                         // 1
    return Course;                                                                                                 // 1
  }                                                                                                                // 1
});                                                                                                                // 1
var React = void 0,                                                                                                // 1
    Component = void 0,                                                                                            // 1
    PropTypes = void 0;                                                                                            // 1
module.watch(require("react"), {                                                                                   // 1
  "default": function (v) {                                                                                        // 1
    React = v;                                                                                                     // 1
  },                                                                                                               // 1
  Component: function (v) {                                                                                        // 1
    Component = v;                                                                                                 // 1
  },                                                                                                               // 1
  PropTypes: function (v) {                                                                                        // 1
    PropTypes = v;                                                                                                 // 1
  }                                                                                                                // 1
}, 0);                                                                                                             // 1
                                                                                                                   //
var Course = function (_Component) {                                                                               //
  (0, _inherits3.default)(Course, _Component);                                                                     //
                                                                                                                   //
  function Course() {                                                                                              //
    (0, _classCallCheck3.default)(this, Course);                                                                   //
    return (0, _possibleConstructorReturn3.default)(this, _Component.apply(this, arguments));                      //
  }                                                                                                                //
                                                                                                                   //
  //props:                                                                                                         // 6
  // info, a database object containing all of this class's data.                                                  // 7
  Course.prototype.render = function () {                                                                          //
    function render() {                                                                                            //
      var _this2 = this;                                                                                           // 8
                                                                                                                   //
      var classId = this.props.info._id;                                                                           // 9
      return React.createElement(                                                                                  // 10
        "li",                                                                                                      // 11
        {                                                                                                          // 11
          id: classId,                                                                                             // 11
          onClick: function () {                                                                                   // 11
            return _this2.props.handler(classId);                                                                  // 11
          }                                                                                                        // 11
        },                                                                                                         // 11
        this.props.info.classFull                                                                                  // 11
      );                                                                                                           // 11
    }                                                                                                              // 13
                                                                                                                   //
    return render;                                                                                                 //
  }();                                                                                                             //
                                                                                                                   //
  return Course;                                                                                                   //
}(Component);                                                                                                      //
                                                                                                                   //
Course.propTypes = {                                                                                               // 16
  // This component gets the task to display through a React prop.                                                 // 17
  // We can use propTypes to indicate it is required                                                               // 18
  info: PropTypes.object.isRequired,                                                                               // 19
  handler: PropTypes.func.isRequired                                                                               // 20
};                                                                                                                 // 16
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"CourseCard.jsx":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/CourseCard.jsx                                                                                       //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");                                            //
                                                                                                                   //
var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);                                                   //
                                                                                                                   //
var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");                      //
                                                                                                                   //
var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);                             //
                                                                                                                   //
var _inherits2 = require("babel-runtime/helpers/inherits");                                                        //
                                                                                                                   //
var _inherits3 = _interopRequireDefault(_inherits2);                                                               //
                                                                                                                   //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }                  //
                                                                                                                   //
module.export({                                                                                                    // 1
  "default": function () {                                                                                         // 1
    return Form;                                                                                                   // 1
  }                                                                                                                // 1
});                                                                                                                // 1
var React = void 0,                                                                                                // 1
    Component = void 0,                                                                                            // 1
    PropTypes = void 0;                                                                                            // 1
module.watch(require("react"), {                                                                                   // 1
  "default": function (v) {                                                                                        // 1
    React = v;                                                                                                     // 1
  },                                                                                                               // 1
  Component: function (v) {                                                                                        // 1
    Component = v;                                                                                                 // 1
  },                                                                                                               // 1
  PropTypes: function (v) {                                                                                        // 1
    PropTypes = v;                                                                                                 // 1
  }                                                                                                                // 1
}, 0);                                                                                                             // 1
var ReactDOM = void 0;                                                                                             // 1
module.watch(require("react-dom"), {                                                                               // 1
  "default": function (v) {                                                                                        // 1
    ReactDOM = v;                                                                                                  // 1
  }                                                                                                                // 1
}, 1);                                                                                                             // 1
var Reviews = void 0;                                                                                              // 1
module.watch(require("../api/classes.js"), {                                                                       // 1
  Reviews: function (v) {                                                                                          // 1
    Reviews = v;                                                                                                   // 1
  }                                                                                                                // 1
}, 2);                                                                                                             // 1
module.watch(require("./css/CourseCard.css"));                                                                     // 1
var lastOfferedSems = void 0,                                                                                      // 1
    lastSem = void 0;                                                                                              // 1
module.watch(require("./js/CourseCard.js"), {                                                                      // 1
  lastOfferedSems: function (v) {                                                                                  // 1
    lastOfferedSems = v;                                                                                           // 1
  },                                                                                                               // 1
  lastSem: function (v) {                                                                                          // 1
    lastSem = v;                                                                                                   // 1
  }                                                                                                                // 1
}, 3);                                                                                                             // 1
                                                                                                                   //
var Form = function (_Component) {                                                                                 //
  (0, _inherits3.default)(Form, _Component);                                                                       //
                                                                                                                   //
  function Form(props) {                                                                                           // 14
    (0, _classCallCheck3.default)(this, Form);                                                                     // 14
    return (0, _possibleConstructorReturn3.default)(this, _Component.call(this, props));                           // 14
  }                                                                                                                // 16
                                                                                                                   //
  Form.prototype.render = function () {                                                                            //
    function render() {                                                                                            //
      var theClass = this.props.course;                                                                            // 20
      var url = "https://classes.cornell.edu/browse/roster/" + lastSem(theClass.classSems) + "/class/" + theClass.classSub.toUpperCase() + "/" + theClass.classNum;
      var offered = lastOfferedSems(theClass);                                                                     // 25
      return React.createElement(                                                                                  // 27
        "header",                                                                                                  // 28
        null,                                                                                                      // 28
        React.createElement(                                                                                       // 29
          "h1",                                                                                                    // 29
          {                                                                                                        // 29
            className: "subheader"                                                                                 // 29
          },                                                                                                       // 29
          theClass.classSub.toUpperCase() + " " + theClass.classNum + ": " + theClass.classTitle                   // 29
        ),                                                                                                         // 29
        React.createElement(                                                                                       // 30
          "a",                                                                                                     // 30
          {                                                                                                        // 30
            className: "cornellClassLink spacing-large",                                                           // 30
            href: url,                                                                                             // 30
            target: "_blank"                                                                                       // 30
          },                                                                                                       // 30
          "cornell.classes.edu"                                                                                    // 30
        ),                                                                                                         // 30
        React.createElement(                                                                                       // 33
          "p",                                                                                                     // 33
          {                                                                                                        // 33
            className: "review-text spacing-large"                                                                 // 33
          },                                                                                                       // 33
          React.createElement(                                                                                     // 33
            "strong",                                                                                              // 33
            null,                                                                                                  // 33
            "Last Offered: "                                                                                       // 33
          ),                                                                                                       // 33
          offered                                                                                                  // 33
        ),                                                                                                         // 33
        React.createElement(                                                                                       // 34
          "h2",                                                                                                    // 34
          null,                                                                                                    // 34
          "Class Data"                                                                                             // 34
        ),                                                                                                         // 34
        React.createElement(                                                                                       // 35
          "div",                                                                                                   // 35
          null,                                                                                                    // 35
          React.createElement(                                                                                     // 36
            "div",                                                                                                 // 36
            {                                                                                                      // 36
              className: "panel panel-default"                                                                     // 36
            },                                                                                                     // 36
            React.createElement(                                                                                   // 37
              "div",                                                                                               // 37
              {                                                                                                    // 37
                className: "panel-body"                                                                            // 37
              },                                                                                                   // 37
              React.createElement(                                                                                 // 38
                "section",                                                                                         // 38
                null,                                                                                              // 38
                React.createElement(                                                                               // 39
                  "div",                                                                                           // 39
                  {                                                                                                // 39
                    className: "row",                                                                              // 39
                    id: "gaugeHolder"                                                                              // 39
                  },                                                                                               // 39
                  React.createElement(                                                                             // 40
                    "div",                                                                                         // 40
                    {                                                                                              // 40
                      className: "col-sm-4"                                                                        // 40
                    },                                                                                             // 40
                    React.createElement("ng-gauge", {                                                              // 41
                      id: "gauge1",                                                                                // 41
                      "foreground-color": "{{$ctrl.qualColor($ctrl.qual)}}",                                       // 41
                      type: "arch",                                                                                // 41
                      thick: "{{$ctrl.gaugeThick}}",                                                               // 41
                      size: "{{$ctrl.gaugeWidth}}",                                                                // 41
                      cap: "butt",                                                                                 // 41
                      value: "$ctrl.qual",                                                                         // 41
                      label: "Overall Quality",                                                                    // 41
                      append: "/5"                                                                                 // 41
                    })                                                                                             // 41
                  ),                                                                                               // 40
                  React.createElement(                                                                             // 44
                    "div",                                                                                         // 44
                    {                                                                                              // 44
                      className: "col-sm-4"                                                                        // 44
                    },                                                                                             // 44
                    React.createElement("ng-gauge", {                                                              // 45
                      id: "gauge2",                                                                                // 45
                      "foreground-color": "{{$ctrl.diffColor($ctrl.diff)}}",                                       // 45
                      type: "arch",                                                                                // 45
                      thick: "{{$ctrl.gaugeThick}}",                                                               // 45
                      size: "{{$ctrl.gaugeWidth}}",                                                                // 45
                      cap: "butt",                                                                                 // 45
                      value: "$ctrl.diff",                                                                         // 45
                      label: "Level of Difficulty",                                                                // 45
                      append: "/5"                                                                                 // 45
                    })                                                                                             // 45
                  ),                                                                                               // 44
                  React.createElement(                                                                             // 48
                    "div",                                                                                         // 48
                    {                                                                                              // 48
                      className: "col-sm-4"                                                                        // 48
                    },                                                                                             // 48
                    React.createElement("ng-gauge", {                                                              // 49
                      id: "gauge3",                                                                                // 49
                      "foreground-color": "{{$ctrl.gradeColor($ctrl.grade)}}",                                     // 49
                      type: "arch",                                                                                // 49
                      thick: "{{$ctrl.gaugeThick}}",                                                               // 49
                      size: "{{$ctrl.gaugeWidth}}",                                                                // 49
                      cap: "butt",                                                                                 // 49
                      value: "$ctrl.grade",                                                                        // 49
                      label: "Median Grade"                                                                        // 49
                    })                                                                                             // 49
                  )                                                                                                // 48
                )                                                                                                  // 39
              )                                                                                                    // 38
            )                                                                                                      // 37
          )                                                                                                        // 36
        ),                                                                                                         // 35
        React.createElement(                                                                                       // 57
          "p",                                                                                                     // 57
          {                                                                                                        // 57
            className: "review-text spacing-large"                                                                 // 57
          },                                                                                                       // 57
          "Attendence Mandatory: Yes/No (Placeholder)"                                                             // 57
        )                                                                                                          // 57
      );                                                                                                           // 28
    }                                                                                                              // 61
                                                                                                                   //
    return render;                                                                                                 //
  }();                                                                                                             //
                                                                                                                   //
  return Form;                                                                                                     //
}(Component);                                                                                                      //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"CourseReviews.jsx":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/CourseReviews.jsx                                                                                    //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");                                            //
                                                                                                                   //
var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);                                                   //
                                                                                                                   //
var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");                      //
                                                                                                                   //
var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);                             //
                                                                                                                   //
var _inherits2 = require("babel-runtime/helpers/inherits");                                                        //
                                                                                                                   //
var _inherits3 = _interopRequireDefault(_inherits2);                                                               //
                                                                                                                   //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }                  //
                                                                                                                   //
module.export({                                                                                                    // 1
  CourseReviews: function () {                                                                                     // 1
    return CourseReviews;                                                                                          // 1
  }                                                                                                                // 1
});                                                                                                                // 1
var React = void 0,                                                                                                // 1
    Component = void 0,                                                                                            // 1
    PropTypes = void 0;                                                                                            // 1
module.watch(require("react"), {                                                                                   // 1
  "default": function (v) {                                                                                        // 1
    React = v;                                                                                                     // 1
  },                                                                                                               // 1
  Component: function (v) {                                                                                        // 1
    Component = v;                                                                                                 // 1
  },                                                                                                               // 1
  PropTypes: function (v) {                                                                                        // 1
    PropTypes = v;                                                                                                 // 1
  }                                                                                                                // 1
}, 0);                                                                                                             // 1
var ReactDOM = void 0;                                                                                             // 1
module.watch(require("react-dom"), {                                                                               // 1
  "default": function (v) {                                                                                        // 1
    ReactDOM = v;                                                                                                  // 1
  }                                                                                                                // 1
}, 1);                                                                                                             // 1
var createContainer = void 0;                                                                                      // 1
module.watch(require("meteor/react-meteor-data"), {                                                                // 1
  createContainer: function (v) {                                                                                  // 1
    createContainer = v;                                                                                           // 1
  }                                                                                                                // 1
}, 2);                                                                                                             // 1
var Reviews = void 0;                                                                                              // 1
module.watch(require("../api/classes.js"), {                                                                       // 1
  Reviews: function (v) {                                                                                          // 1
    Reviews = v;                                                                                                   // 1
  }                                                                                                                // 1
}, 3);                                                                                                             // 1
var Review = void 0;                                                                                               // 1
module.watch(require("./Review.jsx"), {                                                                            // 1
  "default": function (v) {                                                                                        // 1
    Review = v;                                                                                                    // 1
  }                                                                                                                // 1
}, 4);                                                                                                             // 1
                                                                                                                   //
var CourseReviews = function (_Component) {                                                                        //
  (0, _inherits3.default)(CourseReviews, _Component);                                                              //
                                                                                                                   //
  function CourseReviews() {                                                                                       //
    (0, _classCallCheck3.default)(this, CourseReviews);                                                            //
    return (0, _possibleConstructorReturn3.default)(this, _Component.apply(this, arguments));                      //
  }                                                                                                                //
                                                                                                                   //
  //props:                                                                                                         // 10
  //courseId, the course these reviews belong to                                                                   // 11
  CourseReviews.prototype.renderReviews = function () {                                                            //
    function renderReviews() {                                                                                     //
      return this.props.reviews.map(function (review) {                                                            // 14
        return React.createElement(Review, {                                                                       // 14
          key: review._id,                                                                                         // 15
          info: review                                                                                             // 15
        });                                                                                                        // 15
      });                                                                                                          // 14
    }                                                                                                              // 17
                                                                                                                   //
    return renderReviews;                                                                                          //
  }();                                                                                                             //
                                                                                                                   //
  CourseReviews.prototype.render = function () {                                                                   //
    function render() {                                                                                            //
      return React.createElement(                                                                                  // 20
        "section",                                                                                                 // 21
        null,                                                                                                      // 21
        React.createElement(                                                                                       // 22
          "legend",                                                                                                // 22
          {                                                                                                        // 22
            className: "subheader"                                                                                 // 22
          },                                                                                                       // 22
          "Past Reviews"                                                                                           // 22
        ),                                                                                                         // 22
        React.createElement(                                                                                       // 23
          "div",                                                                                                   // 23
          {                                                                                                        // 23
            className: "panel panel-default"                                                                       // 23
          },                                                                                                       // 23
          React.createElement(                                                                                     // 24
            "div",                                                                                                 // 24
            null,                                                                                                  // 24
            React.createElement(                                                                                   // 25
              "ul",                                                                                                // 25
              null,                                                                                                // 25
              this.renderReviews()                                                                                 // 26
            )                                                                                                      // 25
          )                                                                                                        // 24
        )                                                                                                          // 23
      );                                                                                                           // 21
    }                                                                                                              // 32
                                                                                                                   //
    return render;                                                                                                 //
  }();                                                                                                             //
                                                                                                                   //
  return CourseReviews;                                                                                            //
}(Component);                                                                                                      //
                                                                                                                   //
CourseReviews.propTypes = {                                                                                        // 35
  courseId: PropTypes.string.isRequired,                                                                           // 36
  reviews: PropTypes.array.isRequired                                                                              // 37
};                                                                                                                 // 35
module.exportDefault(createContainer(function (props) {                                                            // 1
  var subscription = Meteor.subscribe('reviews', props.courseId, 1); //get only visible reviews for this course    // 41
                                                                                                                   //
  var loading = !subscription.ready();                                                                             // 42
  var reviews = Reviews.find({}).fetch();                                                                          // 43
  return {                                                                                                         // 44
    reviews: reviews,                                                                                              // 45
    loading: loading                                                                                               // 45
  };                                                                                                               // 44
}, CourseReviews));                                                                                                // 47
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"Form.jsx":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/Form.jsx                                                                                             //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");                                            //
                                                                                                                   //
var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);                                                   //
                                                                                                                   //
var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");                      //
                                                                                                                   //
var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);                             //
                                                                                                                   //
var _inherits2 = require("babel-runtime/helpers/inherits");                                                        //
                                                                                                                   //
var _inherits3 = _interopRequireDefault(_inherits2);                                                               //
                                                                                                                   //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }                  //
                                                                                                                   //
module.export({                                                                                                    // 1
  "default": function () {                                                                                         // 1
    return Form;                                                                                                   // 1
  }                                                                                                                // 1
});                                                                                                                // 1
var React = void 0,                                                                                                // 1
    Component = void 0,                                                                                            // 1
    PropTypes = void 0;                                                                                            // 1
module.watch(require("react"), {                                                                                   // 1
  "default": function (v) {                                                                                        // 1
    React = v;                                                                                                     // 1
  },                                                                                                               // 1
  Component: function (v) {                                                                                        // 1
    Component = v;                                                                                                 // 1
  },                                                                                                               // 1
  PropTypes: function (v) {                                                                                        // 1
    PropTypes = v;                                                                                                 // 1
  }                                                                                                                // 1
}, 0);                                                                                                             // 1
var ReactDOM = void 0;                                                                                             // 1
module.watch(require("react-dom"), {                                                                               // 1
  "default": function (v) {                                                                                        // 1
    ReactDOM = v;                                                                                                  // 1
  }                                                                                                                // 1
}, 1);                                                                                                             // 1
var Reviews = void 0;                                                                                              // 1
module.watch(require("../api/classes.js"), {                                                                       // 1
  Reviews: function (v) {                                                                                          // 1
    Reviews = v;                                                                                                   // 1
  }                                                                                                                // 1
}, 2);                                                                                                             // 1
                                                                                                                   //
var Form = function (_Component) {                                                                                 //
  (0, _inherits3.default)(Form, _Component);                                                                       //
                                                                                                                   //
  function Form(props) {                                                                                           // 8
    (0, _classCallCheck3.default)(this, Form);                                                                     // 8
                                                                                                                   //
    //store the currently selected form values                                                                     // 11
    var _this = (0, _possibleConstructorReturn3.default)(this, _Component.call(this, props));                      // 8
                                                                                                                   //
    _this.state = {                                                                                                // 12
      diff: 3,                                                                                                     // 13
      //default                                                                                                    // 13
      quality: 3,                                                                                                  // 14
      //default                                                                                                    // 14
      message: null //bind the submission function to this class                                                   // 15
                                                                                                                   //
    };                                                                                                             // 12
    _this.handleSubmit = _this.handleSubmit.bind(_this);                                                           // 19
    return _this;                                                                                                  // 8
  } // handle a form submission. This will either add the review to the database                                   // 20
  // or return an error telling the user to try agian.                                                             // 23
                                                                                                                   //
                                                                                                                   //
  Form.prototype.handleSubmit = function () {                                                                      //
    function handleSubmit(event) {                                                                                 //
      var _this2 = this;                                                                                           // 24
                                                                                                                   //
      event.preventDefault(); //ensure all feilds are filled out                                                   // 25
                                                                                                                   //
      var text = ReactDOM.findDOMNode(this.refs.reviewText).value.trim();                                          // 28
      var median = ReactDOM.findDOMNode(this.refs.median).value.trim();                                            // 29
      var atten = ReactDOM.findDOMNode(this.refs.atten).value.trim();                                              // 30
                                                                                                                   //
      if (text != null && median != null && atten != null) {                                                       // 31
        console.log("got needed elements"); // create new review object                                            // 32
                                                                                                                   //
        var newReview = {                                                                                          // 35
          text: text,                                                                                              // 36
          diff: this.state.diff,                                                                                   // 37
          quality: this.state.quality,                                                                             // 38
          medGrade: median,                                                                                        // 39
          atten: atten //call the insert funtion                                                                   // 40
                                                                                                                   //
        };                                                                                                         // 35
        Meteor.call('insert', newReview, this.props.courseId, function (error, result) {                           // 44
          if (!error) {                                                                                            // 45
            // Reset form                                                                                          // 46
            ReactDOM.findDOMNode(_this2.refs.reviewText).value = '';                                               // 47
            ReactDOM.findDOMNode(_this2.refs.median).value = null;                                                 // 48
            ReactDOM.findDOMNode(_this2.refs.atten).value = null;                                                  // 49
            _this2.diff == 3;                                                                                      // 50
            _this2.quality == 3;                                                                                   // 51
                                                                                                                   //
            _this2.setState({                                                                                      // 53
              message: "Thanks! Your review is pending approval."                                                  // 53
            });                                                                                                    // 53
          } else {                                                                                                 // 54
            console.log(error);                                                                                    // 55
                                                                                                                   //
            _this2.setState({                                                                                      // 56
              message: "A error occured. Please try again."                                                        // 56
            });                                                                                                    // 56
          }                                                                                                        // 57
        });                                                                                                        // 58
      }                                                                                                            // 59
    }                                                                                                              // 60
                                                                                                                   //
    return handleSubmit;                                                                                           //
  }();                                                                                                             //
                                                                                                                   //
  Form.prototype.handleQualChange = function () {                                                                  //
    function handleQualChange(inputElement) {                                                                      //
      console.log(inputElement.value); //this.state.newReview.quality ==                                           // 63
    }                                                                                                              // 65
                                                                                                                   //
    return handleQualChange;                                                                                       //
  }();                                                                                                             //
                                                                                                                   //
  Form.prototype.render = function () {                                                                            //
    function render() {                                                                                            //
      return React.createElement(                                                                                  // 68
        "form",                                                                                                    // 69
        {                                                                                                          // 69
          className: "new-task",                                                                                   // 69
          onSubmit: this.handleSubmit.bind(this)                                                                   // 69
        },                                                                                                         // 69
        React.createElement(                                                                                       // 70
          "div",                                                                                                   // 70
          {                                                                                                        // 70
            className: "panel panel-default"                                                                       // 70
          },                                                                                                       // 70
          React.createElement(                                                                                     // 71
            "div",                                                                                                 // 71
            {                                                                                                      // 71
              className: "panel-body"                                                                              // 71
            },                                                                                                     // 71
            React.createElement("textarea", {                                                                      // 72
              type: "text",                                                                                        // 72
              ref: "reviewText",                                                                                   // 72
              placeholder: "Does your professor tell funny jokes? Leave your feedback here!"                       // 72
            })                                                                                                     // 72
          )                                                                                                        // 71
        ),                                                                                                         // 70
        React.createElement("hr", {                                                                                // 75
          className: "divider"                                                                                     // 75
        }),                                                                                                        // 75
        React.createElement(                                                                                       // 76
          "div",                                                                                                   // 76
          {                                                                                                        // 76
            className: "row"                                                                                       // 76
          },                                                                                                       // 76
          React.createElement(                                                                                     // 77
            "div",                                                                                                 // 77
            {                                                                                                      // 77
              className: "col-md-3"                                                                                // 77
            },                                                                                                     // 77
            React.createElement(                                                                                   // 78
              "h1",                                                                                                // 78
              {                                                                                                    // 78
                className: "secondary-text"                                                                        // 78
              },                                                                                                   // 78
              "Overall Quality"                                                                                    // 78
            )                                                                                                      // 78
          ),                                                                                                       // 77
          React.createElement(                                                                                     // 80
            "div",                                                                                                 // 80
            {                                                                                                      // 80
              className: "col-md-1"                                                                                // 80
            },                                                                                                     // 80
            React.createElement(                                                                                   // 81
              "div",                                                                                               // 81
              {                                                                                                    // 81
                className: "small-icon",                                                                           // 81
                id: "sm1"                                                                                          // 81
              },                                                                                                   // 81
              React.createElement(                                                                                 // 82
                "p",                                                                                               // 82
                null,                                                                                              // 82
                this.state.quality                                                                                 // 82
              )                                                                                                    // 82
            )                                                                                                      // 81
          ),                                                                                                       // 80
          React.createElement(                                                                                     // 85
            "div",                                                                                                 // 85
            {                                                                                                      // 85
              className: "col-md-8"                                                                                // 85
            },                                                                                                     // 85
            React.createElement("input", {                                                                         // 86
              type: "range",                                                                                       // 86
              id: "a2",                                                                                            // 86
              name: "qual",                                                                                        // 86
              min: "0",                                                                                            // 86
              max: "5",                                                                                            // 86
              step: "1"                                                                                            // 86
            })                                                                                                     // 86
          )                                                                                                        // 85
        ),                                                                                                         // 76
        React.createElement("div", {                                                                               // 89
          className: "sm-spacing"                                                                                  // 89
        }),                                                                                                        // 89
        React.createElement(                                                                                       // 90
          "div",                                                                                                   // 90
          {                                                                                                        // 90
            className: "row"                                                                                       // 90
          },                                                                                                       // 90
          React.createElement(                                                                                     // 91
            "div",                                                                                                 // 91
            {                                                                                                      // 91
              className: "col-md-3"                                                                                // 91
            },                                                                                                     // 91
            React.createElement(                                                                                   // 92
              "h1",                                                                                                // 92
              {                                                                                                    // 92
                className: "secondary-text"                                                                        // 92
              },                                                                                                   // 92
              "Level of Difficulty"                                                                                // 92
            )                                                                                                      // 92
          ),                                                                                                       // 91
          React.createElement(                                                                                     // 94
            "div",                                                                                                 // 94
            {                                                                                                      // 94
              className: "col-md-1"                                                                                // 94
            },                                                                                                     // 94
            React.createElement(                                                                                   // 95
              "div",                                                                                               // 95
              {                                                                                                    // 95
                className: "small-icon",                                                                           // 95
                id: "sm1"                                                                                          // 95
              },                                                                                                   // 95
              React.createElement(                                                                                 // 96
                "p",                                                                                               // 96
                null,                                                                                              // 96
                this.state.diff                                                                                    // 96
              )                                                                                                    // 96
            )                                                                                                      // 95
          ),                                                                                                       // 94
          React.createElement(                                                                                     // 99
            "div",                                                                                                 // 99
            {                                                                                                      // 99
              className: "col-md-8"                                                                                // 99
            },                                                                                                     // 99
            React.createElement("input", {                                                                         // 100
              type: "range",                                                                                       // 100
              id: "a2",                                                                                            // 100
              name: "qual",                                                                                        // 100
              min: "0",                                                                                            // 100
              max: "5",                                                                                            // 100
              step: "1"                                                                                            // 100
            })                                                                                                     // 100
          )                                                                                                        // 99
        ),                                                                                                         // 90
        React.createElement("div", {                                                                               // 103
          className: "sm-spacing"                                                                                  // 103
        }),                                                                                                        // 103
        React.createElement(                                                                                       // 105
          "div",                                                                                                   // 105
          {                                                                                                        // 105
            className: "row"                                                                                       // 105
          },                                                                                                       // 105
          React.createElement(                                                                                     // 106
            "div",                                                                                                 // 106
            {                                                                                                      // 106
              className: "col-md-4"                                                                                // 106
            },                                                                                                     // 106
            React.createElement(                                                                                   // 107
              "div",                                                                                               // 107
              {                                                                                                    // 107
                className: "secondary-text"                                                                        // 107
              },                                                                                                   // 107
              "Class Median"                                                                                       // 107
            )                                                                                                      // 107
          ),                                                                                                       // 106
          React.createElement(                                                                                     // 109
            "div",                                                                                                 // 109
            {                                                                                                      // 109
              className: "col-md-8"                                                                                // 109
            },                                                                                                     // 109
            React.createElement(                                                                                   // 110
              "select",                                                                                            // 110
              {                                                                                                    // 110
                ref: "median"                                                                                      // 110
              },                                                                                                   // 110
              React.createElement(                                                                                 // 111
                "option",                                                                                          // 111
                {                                                                                                  // 111
                  value: "9"                                                                                       // 111
                },                                                                                                 // 111
                "A+"                                                                                               // 111
              ),                                                                                                   // 111
              React.createElement(                                                                                 // 112
                "option",                                                                                          // 112
                {                                                                                                  // 112
                  value: "8"                                                                                       // 112
                },                                                                                                 // 112
                "A"                                                                                                // 112
              ),                                                                                                   // 112
              React.createElement(                                                                                 // 113
                "option",                                                                                          // 113
                {                                                                                                  // 113
                  value: "7"                                                                                       // 113
                },                                                                                                 // 113
                "A-"                                                                                               // 113
              ),                                                                                                   // 113
              React.createElement(                                                                                 // 114
                "option",                                                                                          // 114
                {                                                                                                  // 114
                  value: "6"                                                                                       // 114
                },                                                                                                 // 114
                "B+"                                                                                               // 114
              ),                                                                                                   // 114
              React.createElement(                                                                                 // 115
                "option",                                                                                          // 115
                {                                                                                                  // 115
                  value: "5"                                                                                       // 115
                },                                                                                                 // 115
                "B"                                                                                                // 115
              ),                                                                                                   // 115
              React.createElement(                                                                                 // 116
                "option",                                                                                          // 116
                {                                                                                                  // 116
                  value: "4"                                                                                       // 116
                },                                                                                                 // 116
                "B-"                                                                                               // 116
              ),                                                                                                   // 116
              React.createElement(                                                                                 // 117
                "option",                                                                                          // 117
                {                                                                                                  // 117
                  value: "3"                                                                                       // 117
                },                                                                                                 // 117
                "C+"                                                                                               // 117
              ),                                                                                                   // 117
              React.createElement(                                                                                 // 118
                "option",                                                                                          // 118
                {                                                                                                  // 118
                  value: "2"                                                                                       // 118
                },                                                                                                 // 118
                "C"                                                                                                // 118
              ),                                                                                                   // 118
              React.createElement(                                                                                 // 119
                "option",                                                                                          // 119
                {                                                                                                  // 119
                  value: "1"                                                                                       // 119
                },                                                                                                 // 119
                "C-"                                                                                               // 119
              )                                                                                                    // 119
            )                                                                                                      // 110
          )                                                                                                        // 109
        ),                                                                                                         // 105
        React.createElement("div", {                                                                               // 124
          className: "sm-spacing"                                                                                  // 124
        }),                                                                                                        // 124
        React.createElement(                                                                                       // 126
          "div",                                                                                                   // 126
          {                                                                                                        // 126
            className: "row"                                                                                       // 126
          },                                                                                                       // 126
          React.createElement(                                                                                     // 127
            "div",                                                                                                 // 127
            {                                                                                                      // 127
              className: "col-md-4"                                                                                // 127
            },                                                                                                     // 127
            React.createElement(                                                                                   // 128
              "div",                                                                                               // 128
              {                                                                                                    // 128
                className: "secondary-text"                                                                        // 128
              },                                                                                                   // 128
              "Attendence"                                                                                         // 128
            )                                                                                                      // 128
          ),                                                                                                       // 127
          React.createElement(                                                                                     // 130
            "div",                                                                                                 // 130
            {                                                                                                      // 130
              className: "col-md-8"                                                                                // 130
            },                                                                                                     // 130
            React.createElement(                                                                                   // 131
              "select",                                                                                            // 131
              {                                                                                                    // 131
                ref: "atten"                                                                                       // 131
              },                                                                                                   // 131
              React.createElement(                                                                                 // 132
                "option",                                                                                          // 132
                {                                                                                                  // 132
                  value: "1"                                                                                       // 132
                },                                                                                                 // 132
                "Not Mandatory"                                                                                    // 132
              ),                                                                                                   // 132
              React.createElement(                                                                                 // 133
                "option",                                                                                          // 133
                {                                                                                                  // 133
                  value: "0"                                                                                       // 133
                },                                                                                                 // 133
                "Mandatory"                                                                                        // 133
              )                                                                                                    // 133
            )                                                                                                      // 131
          )                                                                                                        // 130
        ),                                                                                                         // 126
        React.createElement(                                                                                       // 138
          "div",                                                                                                   // 138
          {                                                                                                        // 138
            className: "row"                                                                                       // 138
          },                                                                                                       // 138
          React.createElement(                                                                                     // 139
            "div",                                                                                                 // 139
            {                                                                                                      // 139
              className: "col-md-10"                                                                               // 139
            },                                                                                                     // 139
            React.createElement(                                                                                   // 140
              "h2",                                                                                                // 140
              {                                                                                                    // 140
                className: "secondary-text"                                                                        // 140
              },                                                                                                   // 140
              "All posts are completely anonymous to ensure constructive, honest feedback. You must have previously been enrolled in the className to give feedback"
            )                                                                                                      // 140
          ),                                                                                                       // 139
          React.createElement(                                                                                     // 142
            "div",                                                                                                 // 142
            {                                                                                                      // 142
              className: "col-md-2"                                                                                // 142
            },                                                                                                     // 142
            React.createElement("input", {                                                                         // 143
              type: "submit",                                                                                      // 143
              value: "Post"                                                                                        // 143
            })                                                                                                     // 143
          )                                                                                                        // 142
        ),                                                                                                         // 138
        React.createElement(                                                                                       // 146
          "div",                                                                                                   // 146
          {                                                                                                        // 146
            className: "row"                                                                                       // 146
          },                                                                                                       // 146
          React.createElement(                                                                                     // 147
            "div",                                                                                                 // 147
            {                                                                                                      // 147
              className: "col-sm-12"                                                                               // 147
            },                                                                                                     // 147
            React.createElement(                                                                                   // 148
              "h2",                                                                                                // 148
              {                                                                                                    // 148
                className: "secondary-text"                                                                        // 148
              },                                                                                                   // 148
              this.state.message                                                                                   // 148
            )                                                                                                      // 148
          )                                                                                                        // 147
        )                                                                                                          // 146
      );                                                                                                           // 69
    }                                                                                                              // 153
                                                                                                                   //
    return render;                                                                                                 //
  }();                                                                                                             //
                                                                                                                   //
  return Form;                                                                                                     //
}(Component);                                                                                                      //
                                                                                                                   //
Form.propTypes = {                                                                                                 // 156
  // This component gets the task to display through a React prop.                                                 // 157
  // We can use propTypes to indicate it is required                                                               // 158
  courseId: PropTypes.string.isRequired                                                                            // 159
}; // export default createContainer(() => {                                                                       // 156
//   Meteor.subscribe('reviews');                                                                                  // 163
//   return {                                                                                                      // 164
//     tasks: Reviews.find({}, { sort: { createdAt: -1 } }).fetch(),                                               // 165
//   };                                                                                                            // 166
// }, App);                                                                                                        // 167
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"Review.jsx":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/Review.jsx                                                                                           //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");                                            //
                                                                                                                   //
var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);                                                   //
                                                                                                                   //
var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");                      //
                                                                                                                   //
var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);                             //
                                                                                                                   //
var _inherits2 = require("babel-runtime/helpers/inherits");                                                        //
                                                                                                                   //
var _inherits3 = _interopRequireDefault(_inherits2);                                                               //
                                                                                                                   //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }                  //
                                                                                                                   //
module.export({                                                                                                    // 1
		"default": function () {                                                                                         // 1
				return Review;                                                                                                 // 1
		}                                                                                                                // 1
});                                                                                                                // 1
var React = void 0,                                                                                                // 1
    Component = void 0,                                                                                            // 1
    PropTypes = void 0;                                                                                            // 1
module.watch(require("react"), {                                                                                   // 1
		"default": function (v) {                                                                                        // 1
				React = v;                                                                                                     // 1
		},                                                                                                               // 1
		Component: function (v) {                                                                                        // 1
				Component = v;                                                                                                 // 1
		},                                                                                                               // 1
		PropTypes: function (v) {                                                                                        // 1
				PropTypes = v;                                                                                                 // 1
		}                                                                                                                // 1
}, 0);                                                                                                             // 1
                                                                                                                   //
var Review = function (_Component) {                                                                               //
		(0, _inherits3.default)(Review, _Component);                                                                     //
                                                                                                                   //
		function Review() {                                                                                              //
				(0, _classCallCheck3.default)(this, Review);                                                                   //
				return (0, _possibleConstructorReturn3.default)(this, _Component.apply(this, arguments));                      //
		}                                                                                                                //
                                                                                                                   //
		//props:                                                                                                         // 5
		// info, a database object containing all of this review entry's data.                                           // 6
		// render() {                                                                                                    // 7
		//   var review = this.props.info;                                                                               // 8
		//   return (                                                                                                    // 9
		// 	<li>                                                                                                         // 10
		// 		<div className = "panel panel-default">                                                                     // 11
		// 			<div className= "panel-heading" id="past">Name?</div>                                                      // 12
		// 			<div className = "panel-body">                                                                             // 13
		// 			    <div className = "row">                                                                                // 14
		// 			    	<div className = "col-sm-2">                                                                          // 15
		// 			      		<div className = "panel panel-default">                                                            // 16
		//                     <div className = "panel-body">{review.quality}</div>                                      // 17
		// 			      		</div>                                                                                             // 18
		// 			      	</div>                                                                                              // 19
		// 			      	<div className = "col-sm-2">                                                                        // 20
		// 			      		<p>Overall Quality</p>                                                                             // 21
		// 			      	</div>                                                                                              // 22
		// 			    	<div className = "col-sm-2">                                                                          // 23
		// 			      	<div className = "panel panel-default">                                                             // 24
		// 			      		<div className = "panel-body">{review.difficulty}</div>                                            // 25
		// 			      	</div>                                                                                              // 26
		// 			    	</div>                                                                                                // 27
		// 			      	<div className = "col-sm-2">                                                                        // 28
		// 			      		<p>Difficulty</p>                                                                                  // 29
		// 			      	</div>                                                                                              // 30
		// 			    </div>                                                                                                 // 31
		// 			    <div className="row">                                                                                  // 32
		// 			   		<div className = "review-text">{review.text}</div>                                                    // 33
		// 			   	</div>                                                                                                 // 34
		// 			</div>                                                                                                     // 35
		// 		</div>                                                                                                      // 36
		// 	</li>                                                                                                        // 37
		//   );                                                                                                          // 38
		// }                                                                                                             // 39
		Review.prototype.render = function () {                                                                          //
				function render() {                                                                                            //
						var review = this.props.info;                                                                                // 42
						return React.createElement(                                                                                  // 43
								"li",                                                                                                      // 44
								null,                                                                                                      // 44
								React.createElement(                                                                                       // 45
										"div",                                                                                                   // 45
										{                                                                                                        // 45
												className: "panel panel-default"                                                                       // 45
										},                                                                                                       // 45
										React.createElement(                                                                                     // 46
												"div",                                                                                                 // 46
												{                                                                                                      // 46
														className: "panel-body"                                                                              // 46
												},                                                                                                     // 46
												React.createElement(                                                                                   // 47
														"div",                                                                                               // 47
														{                                                                                                    // 47
																className: "row"                                                                                   // 47
														},                                                                                                   // 47
														React.createElement(                                                                                 // 48
																"div",                                                                                             // 48
																{                                                                                                  // 48
																		className: "col-sm-2"                                                                            // 48
																},                                                                                                 // 48
																React.createElement(                                                                               // 49
																		"div",                                                                                           // 49
																		{                                                                                                // 49
																				className: "panel panel-default"                                                               // 49
																		},                                                                                               // 49
																		React.createElement(                                                                             // 50
																				"div",                                                                                         // 50
																				{                                                                                              // 50
																						className: "panel-body"                                                                      // 50
																				},                                                                                             // 50
																				review.quality                                                                                 // 50
																		)                                                                                                // 50
																)                                                                                                  // 49
														),                                                                                                   // 48
														React.createElement(                                                                                 // 53
																"div",                                                                                             // 53
																{                                                                                                  // 53
																		className: "col-sm-2"                                                                            // 53
																},                                                                                                 // 53
																React.createElement(                                                                               // 54
																		"p",                                                                                             // 54
																		null,                                                                                            // 54
																		"Overall Quality"                                                                                // 54
																)                                                                                                  // 54
														),                                                                                                   // 53
														React.createElement(                                                                                 // 56
																"div",                                                                                             // 56
																{                                                                                                  // 56
																		className: "col-sm-2"                                                                            // 56
																},                                                                                                 // 56
																React.createElement(                                                                               // 57
																		"div",                                                                                           // 57
																		{                                                                                                // 57
																				className: "panel panel-default"                                                               // 57
																		},                                                                                               // 57
																		React.createElement(                                                                             // 58
																				"div",                                                                                         // 58
																				{                                                                                              // 58
																						className: "panel-body"                                                                      // 58
																				},                                                                                             // 58
																				review.difficulty                                                                              // 58
																		)                                                                                                // 58
																)                                                                                                  // 57
														),                                                                                                   // 56
														React.createElement(                                                                                 // 61
																"div",                                                                                             // 61
																{                                                                                                  // 61
																		className: "col-sm-2"                                                                            // 61
																},                                                                                                 // 61
																React.createElement(                                                                               // 62
																		"p",                                                                                             // 62
																		null,                                                                                            // 62
																		"Difficulty"                                                                                     // 62
																)                                                                                                  // 62
														)                                                                                                    // 61
												),                                                                                                     // 47
												React.createElement(                                                                                   // 65
														"div",                                                                                               // 65
														{                                                                                                    // 65
																className: "row"                                                                                   // 65
														},                                                                                                   // 65
														React.createElement(                                                                                 // 66
																"div",                                                                                             // 66
																{                                                                                                  // 66
																		className: "review-text"                                                                         // 66
																},                                                                                                 // 66
																review.text                                                                                        // 66
														)                                                                                                    // 66
												)                                                                                                      // 65
										)                                                                                                        // 46
								)                                                                                                          // 45
						);                                                                                                           // 44
				}                                                                                                              // 72
                                                                                                                   //
				return render;                                                                                                 //
		}();                                                                                                             //
                                                                                                                   //
		return Review;                                                                                                   //
}(Component);                                                                                                      //
                                                                                                                   //
Review.propTypes = {                                                                                               // 75
		// This component gets the task to display through a React prop.                                                 // 76
		// We can use propTypes to indicate it is required                                                               // 77
		info: PropTypes.object.isRequired                                                                                // 78
};                                                                                                                 // 75
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"SearchBar.jsx":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/SearchBar.jsx                                                                                        //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");                                            //
                                                                                                                   //
var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);                                                   //
                                                                                                                   //
var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");                      //
                                                                                                                   //
var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);                             //
                                                                                                                   //
var _inherits2 = require("babel-runtime/helpers/inherits");                                                        //
                                                                                                                   //
var _inherits3 = _interopRequireDefault(_inherits2);                                                               //
                                                                                                                   //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }                  //
                                                                                                                   //
module.export({                                                                                                    // 1
  SearchBar: function () {                                                                                         // 1
    return SearchBar;                                                                                              // 1
  }                                                                                                                // 1
});                                                                                                                // 1
var React = void 0,                                                                                                // 1
    Component = void 0,                                                                                            // 1
    PropTypes = void 0;                                                                                            // 1
module.watch(require("react"), {                                                                                   // 1
  "default": function (v) {                                                                                        // 1
    React = v;                                                                                                     // 1
  },                                                                                                               // 1
  Component: function (v) {                                                                                        // 1
    Component = v;                                                                                                 // 1
  },                                                                                                               // 1
  PropTypes: function (v) {                                                                                        // 1
    PropTypes = v;                                                                                                 // 1
  }                                                                                                                // 1
}, 0);                                                                                                             // 1
var ReactDOM = void 0;                                                                                             // 1
module.watch(require("react-dom"), {                                                                               // 1
  "default": function (v) {                                                                                        // 1
    ReactDOM = v;                                                                                                  // 1
  }                                                                                                                // 1
}, 1);                                                                                                             // 1
var createContainer = void 0;                                                                                      // 1
module.watch(require("meteor/react-meteor-data"), {                                                                // 1
  createContainer: function (v) {                                                                                  // 1
    createContainer = v;                                                                                           // 1
  }                                                                                                                // 1
}, 2);                                                                                                             // 1
var Classes = void 0;                                                                                              // 1
module.watch(require("../api/classes.js"), {                                                                       // 1
  Classes: function (v) {                                                                                          // 1
    Classes = v;                                                                                                   // 1
  }                                                                                                                // 1
}, 3);                                                                                                             // 1
var Course = void 0;                                                                                               // 1
module.watch(require("./Course.jsx"), {                                                                            // 1
  "default": function (v) {                                                                                        // 1
    Course = v;                                                                                                    // 1
  }                                                                                                                // 1
}, 4);                                                                                                             // 1
                                                                                                                   //
var SearchBar = function (_Component) {                                                                            //
  (0, _inherits3.default)(SearchBar, _Component);                                                                  //
                                                                                                                   //
  function SearchBar(props) {                                                                                      // 9
    (0, _classCallCheck3.default)(this, SearchBar);                                                                // 9
    return (0, _possibleConstructorReturn3.default)(this, _Component.call(this, props));                           // 9
  }                                                                                                                // 11
                                                                                                                   //
  SearchBar.prototype.renderCourses = function () {                                                                //
    function renderCourses() {                                                                                     //
      var _this2 = this;                                                                                           // 13
                                                                                                                   //
      if (this.props.query != "") {                                                                                // 14
        return this.props.allCourses.slice(0, 10).map(function (course) {                                          // 15
          return (//create a new class "button" that will set the selected class to this class when it is clicked.
            React.createElement(Course, {                                                                          // 17
              key: course._id,                                                                                     // 17
              info: course,                                                                                        // 17
              handler: _this2.props.clickFunc                                                                      // 17
            })                                                                                                     // 17
          );                                                                                                       // 15
        });                                                                                                        // 15
      } else {                                                                                                     // 19
        return React.createElement("div", null);                                                                   // 20
      }                                                                                                            // 21
    }                                                                                                              // 22
                                                                                                                   //
    return renderCourses;                                                                                          //
  }();                                                                                                             //
                                                                                                                   //
  SearchBar.prototype.render = function () {                                                                       //
    function render() {                                                                                            //
      return React.createElement(                                                                                  // 25
        "div",                                                                                                     // 26
        null,                                                                                                      // 26
        React.createElement("input", {                                                                             // 27
          onChange: this.props.queryFunc,                                                                          // 27
          placeholder: "CS 2110, Intro to Creative Writing"                                                        // 27
        }),                                                                                                        // 27
        React.createElement(                                                                                       // 28
          "ul",                                                                                                    // 28
          null,                                                                                                    // 28
          this.renderCourses()                                                                                     // 29
        )                                                                                                          // 28
      );                                                                                                           // 26
    }                                                                                                              // 33
                                                                                                                   //
    return render;                                                                                                 //
  }();                                                                                                             //
                                                                                                                   //
  return SearchBar;                                                                                                //
}(Component);                                                                                                      //
                                                                                                                   //
SearchBar.propTypes = {                                                                                            // 36
  allCourses: PropTypes.array.isRequired,                                                                          // 37
  loading: React.PropTypes.bool,                                                                                   // 38
  query: PropTypes.string.isRequired,                                                                              // 39
  queryFunc: PropTypes.func.isRequired,                                                                            // 40
  clickFunc: PropTypes.func.isRequired                                                                             // 41
};                                                                                                                 // 36
module.exportDefault(createContainer(function (props) {                                                            // 1
  var subscription = Meteor.subscribe('classes', props.query);                                                     // 45
  var loading = !subscription.ready();                                                                             // 46
  var allCourses = Classes.find({}).fetch();                                                                       // 47
  return {                                                                                                         // 48
    allCourses: allCourses,                                                                                        // 49
    loading: loading                                                                                               // 49
  };                                                                                                               // 48
}, SearchBar));                                                                                                    // 51
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"Update.jsx":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/Update.jsx                                                                                           //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");                                            //
                                                                                                                   //
var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);                                                   //
                                                                                                                   //
var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");                      //
                                                                                                                   //
var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);                             //
                                                                                                                   //
var _inherits2 = require("babel-runtime/helpers/inherits");                                                        //
                                                                                                                   //
var _inherits3 = _interopRequireDefault(_inherits2);                                                               //
                                                                                                                   //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }                  //
                                                                                                                   //
module.export({                                                                                                    // 1
  Update: function () {                                                                                            // 1
    return Update;                                                                                                 // 1
  }                                                                                                                // 1
});                                                                                                                // 1
var React = void 0,                                                                                                // 1
    Component = void 0,                                                                                            // 1
    PropTypes = void 0;                                                                                            // 1
module.watch(require("react"), {                                                                                   // 1
  "default": function (v) {                                                                                        // 1
    React = v;                                                                                                     // 1
  },                                                                                                               // 1
  Component: function (v) {                                                                                        // 1
    Component = v;                                                                                                 // 1
  },                                                                                                               // 1
  PropTypes: function (v) {                                                                                        // 1
    PropTypes = v;                                                                                                 // 1
  }                                                                                                                // 1
}, 0);                                                                                                             // 1
var ReactDOM = void 0;                                                                                             // 1
module.watch(require("react-dom"), {                                                                               // 1
  "default": function (v) {                                                                                        // 1
    ReactDOM = v;                                                                                                  // 1
  }                                                                                                                // 1
}, 1);                                                                                                             // 1
var createContainer = void 0;                                                                                      // 1
module.watch(require("meteor/react-meteor-data"), {                                                                // 1
  createContainer: function (v) {                                                                                  // 1
    createContainer = v;                                                                                           // 1
  }                                                                                                                // 1
}, 2);                                                                                                             // 1
var Reviews = void 0;                                                                                              // 1
module.watch(require("../api/classes.js"), {                                                                       // 1
  Reviews: function (v) {                                                                                          // 1
    Reviews = v;                                                                                                   // 1
  }                                                                                                                // 1
}, 3);                                                                                                             // 1
var UpdateReview = void 0;                                                                                         // 1
module.watch(require("./UpdateReview.jsx"), {                                                                      // 1
  "default": function (v) {                                                                                        // 1
    UpdateReview = v;                                                                                              // 1
  }                                                                                                                // 1
}, 4);                                                                                                             // 1
                                                                                                                   //
var Update = function (_Component) {                                                                               //
  (0, _inherits3.default)(Update, _Component);                                                                     //
                                                                                                                   //
  function Update(props) {                                                                                         // 10
    (0, _classCallCheck3.default)(this, Update);                                                                   // 10
    return (0, _possibleConstructorReturn3.default)(this, _Component.call(this, props));                           // 10
  } //approve a review                                                                                             // 12
                                                                                                                   //
                                                                                                                   //
  Update.prototype.approveReview = function () {                                                                   //
    function approveReview(review) {                                                                               //
      Meteor.call('makeVisible', review, function (error, result) {                                                // 16
        if (!error && result == 1) {//console.log("approved review " + review._id);                                // 17
        } else {                                                                                                   // 19
          console.log(error);                                                                                      // 20
        }                                                                                                          // 21
      });                                                                                                          // 22
    }                                                                                                              // 23
                                                                                                                   //
    return approveReview;                                                                                          //
  }(); //remove a review                                                                                           //
                                                                                                                   //
                                                                                                                   //
  Update.prototype.removeReview = function () {                                                                    //
    function removeReview(review) {                                                                                //
      Meteor.call('removeReview', review, function (error, result) {                                               // 27
        if (!error && result == 1) {//console.log("removed review " + review._id);                                 // 28
        } else {                                                                                                   // 30
          console.log(error);                                                                                      // 31
        }                                                                                                          // 32
      });                                                                                                          // 33
    }                                                                                                              // 34
                                                                                                                   //
    return removeReview;                                                                                           //
  }(); //show all reviews that have not been approved                                                              //
                                                                                                                   //
                                                                                                                   //
  Update.prototype.renderReviews = function () {                                                                   //
    function renderReviews() {                                                                                     //
      var _this2 = this;                                                                                           // 37
                                                                                                                   //
      return this.props.reviewsToApprove.map(function (review) {                                                   // 38
        return (//create a new class "button" that will set the selected class to this class when it is clicked.   // 38
          React.createElement(UpdateReview, {                                                                      // 40
            key: review._id,                                                                                       // 40
            info: review,                                                                                          // 40
            removeHandler: _this2.removeReview,                                                                    // 40
            approveHandler: _this2.approveReview                                                                   // 40
          })                                                                                                       // 40
        );                                                                                                         // 38
      });                                                                                                          // 38
    }                                                                                                              // 42
                                                                                                                   //
    return renderReviews;                                                                                          //
  }();                                                                                                             //
                                                                                                                   //
  Update.prototype.render = function () {                                                                          //
    function render() {                                                                                            //
      return React.createElement(                                                                                  // 45
        "div",                                                                                                     // 46
        null,                                                                                                      // 46
        React.createElement(                                                                                       // 47
          "ul",                                                                                                    // 47
          null,                                                                                                    // 47
          this.renderReviews()                                                                                     // 48
        )                                                                                                          // 47
      );                                                                                                           // 46
    }                                                                                                              // 52
                                                                                                                   //
    return render;                                                                                                 //
  }();                                                                                                             //
                                                                                                                   //
  return Update;                                                                                                   //
}(Component);                                                                                                      //
                                                                                                                   //
Update.propTypes = {                                                                                               // 55
  reviewsToApprove: PropTypes.array.isRequired,                                                                    // 56
  loading: React.PropTypes.bool                                                                                    // 57
};                                                                                                                 // 55
module.exportDefault(createContainer(function (props) {                                                            // 1
  var subscription = Meteor.subscribe('reviews', null, 0); //get unapproved reviews                                // 61
                                                                                                                   //
  var loading = !subscription.ready();                                                                             // 62
  var reviewsToApprove = Reviews.find({}).fetch();                                                                 // 63
  return {                                                                                                         // 64
    reviewsToApprove: reviewsToApprove,                                                                            // 65
    loading: loading                                                                                               // 65
  };                                                                                                               // 64
}, Update));                                                                                                       // 67
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"UpdateReview.jsx":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/UpdateReview.jsx                                                                                     //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");                                            //
                                                                                                                   //
var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);                                                   //
                                                                                                                   //
var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");                      //
                                                                                                                   //
var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);                             //
                                                                                                                   //
var _inherits2 = require("babel-runtime/helpers/inherits");                                                        //
                                                                                                                   //
var _inherits3 = _interopRequireDefault(_inherits2);                                                               //
                                                                                                                   //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }                  //
                                                                                                                   //
module.export({                                                                                                    // 1
  "default": function () {                                                                                         // 1
    return UpdateReview;                                                                                           // 1
  }                                                                                                                // 1
});                                                                                                                // 1
var React = void 0,                                                                                                // 1
    Component = void 0,                                                                                            // 1
    PropTypes = void 0;                                                                                            // 1
module.watch(require("react"), {                                                                                   // 1
  "default": function (v) {                                                                                        // 1
    React = v;                                                                                                     // 1
  },                                                                                                               // 1
  Component: function (v) {                                                                                        // 1
    Component = v;                                                                                                 // 1
  },                                                                                                               // 1
  PropTypes: function (v) {                                                                                        // 1
    PropTypes = v;                                                                                                 // 1
  }                                                                                                                // 1
}, 0);                                                                                                             // 1
                                                                                                                   //
var UpdateReview = function (_Component) {                                                                         //
  (0, _inherits3.default)(UpdateReview, _Component);                                                               //
                                                                                                                   //
  function UpdateReview() {                                                                                        //
    (0, _classCallCheck3.default)(this, UpdateReview);                                                             //
    return (0, _possibleConstructorReturn3.default)(this, _Component.apply(this, arguments));                      //
  }                                                                                                                //
                                                                                                                   //
  //props:                                                                                                         // 5
  // info, a database object containing all of this review entry's data.                                           // 6
  UpdateReview.prototype.render = function () {                                                                    //
    function render() {                                                                                            //
      var _this2 = this;                                                                                           // 7
                                                                                                                   //
      var review = this.props.info;                                                                                // 8
      return React.createElement(                                                                                  // 9
        "li",                                                                                                      // 10
        {                                                                                                          // 10
          id: review._id                                                                                           // 10
        },                                                                                                         // 10
        React.createElement(                                                                                       // 11
          "div",                                                                                                   // 11
          {                                                                                                        // 11
            className: "panel panel-default"                                                                       // 11
          },                                                                                                       // 11
          React.createElement("div", {                                                                             // 12
            className: "panel-heading",                                                                            // 12
            id: "past"                                                                                             // 12
          }),                                                                                                      // 12
          React.createElement(                                                                                     // 13
            "div",                                                                                                 // 13
            {                                                                                                      // 13
              className: "panel-body"                                                                              // 13
            },                                                                                                     // 13
            React.createElement(                                                                                   // 14
              "div",                                                                                               // 14
              {                                                                                                    // 14
                className: "row"                                                                                   // 14
              },                                                                                                   // 14
              React.createElement(                                                                                 // 15
                "div",                                                                                             // 15
                {                                                                                                  // 15
                  className: "col-sm-2"                                                                            // 15
                },                                                                                                 // 15
                React.createElement(                                                                               // 16
                  "div",                                                                                           // 16
                  {                                                                                                // 16
                    className: "panel panel-default"                                                               // 16
                  },                                                                                               // 16
                  React.createElement(                                                                             // 17
                    "div",                                                                                         // 17
                    {                                                                                              // 17
                      className: "panel-body"                                                                      // 17
                    },                                                                                             // 17
                    review.quality                                                                                 // 17
                  )                                                                                                // 17
                ),                                                                                                 // 16
                React.createElement(                                                                               // 19
                  "div",                                                                                           // 19
                  {                                                                                                // 19
                    className: "panel panel-default"                                                               // 19
                  },                                                                                               // 19
                  React.createElement(                                                                             // 20
                    "div",                                                                                         // 20
                    {                                                                                              // 20
                      className: "panel-body"                                                                      // 20
                    },                                                                                             // 20
                    review.difficulty                                                                              // 20
                  )                                                                                                // 20
                )                                                                                                  // 19
              ),                                                                                                   // 15
              React.createElement(                                                                                 // 23
                "div",                                                                                             // 23
                {                                                                                                  // 23
                  className: "col-sm-2"                                                                            // 23
                },                                                                                                 // 23
                React.createElement(                                                                               // 24
                  "div",                                                                                           // 24
                  {                                                                                                // 24
                    className: "panel-body"                                                                        // 24
                  },                                                                                               // 24
                  " Overall Quality"                                                                               // 24
                ),                                                                                                 // 24
                React.createElement(                                                                               // 25
                  "div",                                                                                           // 25
                  {                                                                                                // 25
                    className: "panel-body"                                                                        // 25
                  },                                                                                               // 25
                  " Level of difficulty"                                                                           // 25
                )                                                                                                  // 25
              ),                                                                                                   // 23
              React.createElement(                                                                                 // 27
                "div",                                                                                             // 27
                {                                                                                                  // 27
                  className: "col-sm-8"                                                                            // 27
                },                                                                                                 // 27
                review.text                                                                                        // 27
              ),                                                                                                   // 27
              React.createElement(                                                                                 // 28
                "button",                                                                                          // 28
                {                                                                                                  // 28
                  onClick: function () {                                                                           // 28
                    return _this2.props.approveHandler(review);                                                    // 28
                  }                                                                                                // 28
                },                                                                                                 // 28
                " Confirm Review"                                                                                  // 28
              ),                                                                                                   // 28
              React.createElement(                                                                                 // 29
                "button",                                                                                          // 29
                {                                                                                                  // 29
                  onClick: function () {                                                                           // 29
                    return _this2.props.removeHandler(review);                                                     // 29
                  }                                                                                                // 29
                },                                                                                                 // 29
                " Remove Review"                                                                                   // 29
              )                                                                                                    // 29
            )                                                                                                      // 14
          )                                                                                                        // 13
        )                                                                                                          // 11
      );                                                                                                           // 10
    }                                                                                                              // 35
                                                                                                                   //
    return render;                                                                                                 //
  }();                                                                                                             //
                                                                                                                   //
  return UpdateReview;                                                                                             //
}(Component);                                                                                                      //
                                                                                                                   //
UpdateReview.propTypes = {                                                                                         // 38
  // This component gets the task to display through a React prop.                                                 // 39
  // We can use propTypes to indicate it is required                                                               // 40
  info: PropTypes.object.isRequired,                                                                               // 41
  approveHandler: PropTypes.func.isRequired,                                                                       // 42
  removeHandler: PropTypes.func.isRequired                                                                         // 43
};                                                                                                                 // 38
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"api":{"classes.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/api/classes.js                                                                                          //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
module.export({                                                                                                    // 1
	Classes: function () {                                                                                            // 1
		return Classes;                                                                                                  // 1
	},                                                                                                                // 1
	Subjects: function () {                                                                                           // 1
		return Subjects;                                                                                                 // 1
	},                                                                                                                // 1
	Reviews: function () {                                                                                            // 1
		return Reviews;                                                                                                  // 1
	}                                                                                                                 // 1
});                                                                                                                // 1
var Mongo = void 0;                                                                                                // 1
module.watch(require("meteor/mongo"), {                                                                            // 1
	Mongo: function (v) {                                                                                             // 1
		Mongo = v;                                                                                                       // 1
	}                                                                                                                 // 1
}, 0);                                                                                                             // 1
var HTTP = void 0;                                                                                                 // 1
module.watch(require("meteor/http"), {                                                                             // 1
	HTTP: function (v) {                                                                                              // 1
		HTTP = v;                                                                                                        // 1
	}                                                                                                                 // 1
}, 1);                                                                                                             // 1
var check = void 0;                                                                                                // 1
module.watch(require("meteor/check"), {                                                                            // 1
	check: function (v) {                                                                                             // 1
		check = v;                                                                                                       // 1
	}                                                                                                                 // 1
}, 2);                                                                                                             // 1
var Classes = new Mongo.Collection('classes');                                                                     // 5
Classes.schema = new SimpleSchema({                                                                                // 6
	_id: {                                                                                                            // 7
		type: String                                                                                                     // 7
	},                                                                                                                // 7
	classSub: {                                                                                                       // 8
		type: String                                                                                                     // 8
	},                                                                                                                // 8
	classNum: {                                                                                                       // 9
		type: Number                                                                                                     // 9
	},                                                                                                                // 9
	classTitle: {                                                                                                     // 10
		type: String                                                                                                     // 10
	},                                                                                                                // 10
	classAtten: {                                                                                                     // 11
		type: Number                                                                                                     // 11
	},                                                                                                                // 11
	classPrereq: {                                                                                                    // 12
		type: [String],                                                                                                  // 12
		optional: true                                                                                                   // 12
	},                                                                                                                // 12
	classFull: {                                                                                                      // 13
		type: String                                                                                                     // 13
	},                                                                                                                // 13
	classSems: {                                                                                                      // 14
		type: [String]                                                                                                   // 14
	}                                                                                                                 // 14
});                                                                                                                // 6
var Subjects = new Mongo.Collection('subjects');                                                                   // 17
Subjects.schema = new SimpleSchema({                                                                               // 18
	_id: {                                                                                                            // 19
		type: String                                                                                                     // 19
	},                                                                                                                // 19
	subShort: {                                                                                                       // 20
		type: String                                                                                                     // 20
	},                                                                                                                // 20
	subFull: {                                                                                                        // 21
		type: String                                                                                                     // 21
	}                                                                                                                 // 21
});                                                                                                                // 18
var Reviews = new Mongo.Collection('reviews');                                                                     // 24
Reviews.schema = new SimpleSchema({                                                                                // 25
	_id: {                                                                                                            // 26
		type: String                                                                                                     // 26
	},                                                                                                                // 26
	user: {                                                                                                           // 27
		type: String                                                                                                     // 27
	},                                                                                                                // 27
	text: {                                                                                                           // 28
		type: String,                                                                                                    // 28
		optional: true                                                                                                   // 28
	},                                                                                                                // 28
	difficulty: {                                                                                                     // 29
		type: Number                                                                                                     // 29
	},                                                                                                                // 29
	quality: {                                                                                                        // 30
		type: Number                                                                                                     // 30
	},                                                                                                                // 30
	"class": {                                                                                                        // 31
		type: String                                                                                                     // 31
	},                                                                                                                // 31
	//ref to classId                                                                                                  // 31
	grade: {                                                                                                          // 32
		type: Number                                                                                                     // 32
	},                                                                                                                // 32
	date: {                                                                                                           // 33
		type: Date                                                                                                       // 33
	},                                                                                                                // 33
	visible: {                                                                                                        // 34
		type: Number                                                                                                     // 34
	}                                                                                                                 // 34
}); // defines all methods that will be editing the database so that database changes occur only on the server     // 25
                                                                                                                   //
Meteor.methods({                                                                                                   // 38
	//insert a new review into the reviews database                                                                   // 39
	insert: function (review, classId) {                                                                              // 40
		//only insert if all necessary feilds are filled in                                                              // 41
		if (review.text != null && review.diff != null && review.quality != null && review.medGrade != null && classId != undefined && classId != null) {
			//ensure there are no illegal characters                                                                        // 43
			var regex = new RegExp(/^(?=.*[A-Z0-9])[\w:;.,!()"'\/$ ]+$/i);                                                  // 44
                                                                                                                   //
			if (regex.test(review.text)) {                                                                                  // 45
				Reviews.insert({                                                                                               // 46
					text: review.text,                                                                                            // 47
					difficulty: review.diff,                                                                                      // 48
					quality: review.quality,                                                                                      // 49
					"class": classId,                                                                                             // 50
					grade: review.medGrade,                                                                                       // 51
					date: new Date(),                                                                                             // 52
					visible: 0                                                                                                    // 53
				});                                                                                                            // 46
				return 1; //success                                                                                            // 55
			} else {                                                                                                        // 56
					return 0; //fail                                                                                              // 57
				}                                                                                                              // 58
		} else {                                                                                                         // 59
				return 0; //fail                                                                                               // 60
			}                                                                                                               // 61
	},                                                                                                                // 62
	//make the reveiw with this id visible, checking to make sure it has a real id                                    // 63
	makeVisible: function (review) {                                                                                  // 64
		var regex = new RegExp(/^(?=.*[A-Z0-9])/i);                                                                      // 65
                                                                                                                   //
		if (regex.test(review._id)) {                                                                                    // 66
			Reviews.update(review._id, {                                                                                    // 67
				$set: {                                                                                                        // 67
					visible: 1                                                                                                    // 67
				}                                                                                                              // 67
			});                                                                                                             // 67
			return 1;                                                                                                       // 68
		} else {                                                                                                         // 69
			return 0;                                                                                                       // 70
		}                                                                                                                // 71
	},                                                                                                                // 72
	//remove the review with this id, checking to make sure the id is a real id                                       // 73
	removeReview: function (review) {                                                                                 // 74
		var regex = new RegExp(/^(?=.*[A-Z0-9])/i);                                                                      // 75
                                                                                                                   //
		if (regex.test(review._id)) {                                                                                    // 76
			Reviews.remove({                                                                                                // 77
				_id: review._id                                                                                                // 77
			});                                                                                                             // 77
			return 1;                                                                                                       // 78
		} else {                                                                                                         // 79
			return 0;                                                                                                       // 80
		}                                                                                                                // 81
	},                                                                                                                // 82
	//update the database to add any new classes in the current semester if they don't already exist. To be called from the admin page once a semester.
	addNewSemester: function (initiate) {                                                                             // 84
		if (initiate && Meteor.isServer) {                                                                               // 85
			//return addAllCourses(findCurrSemester());                                                                     // 86
			return addAllCourses(['FA15']);                                                                                 // 87
		}                                                                                                                // 88
	},                                                                                                                // 89
	//get the course (as an object) with this id, checking to make sure the id is real                                // 90
	getCourseById: function (courseId) {                                                                              // 91
		//console.log(courseId);                                                                                         // 92
		var regex = new RegExp(/^(?=.*[A-Z0-9])/i);                                                                      // 93
                                                                                                                   //
		if (regex.test(courseId)) {                                                                                      // 95
			var c = Classes.find({                                                                                          // 96
				_id: courseId                                                                                                  // 96
			}).fetch()[0]; //console.log(c);                                                                                // 96
                                                                                                                   //
			return c;                                                                                                       // 98
		}                                                                                                                // 99
                                                                                                                   //
		return null;                                                                                                     // 100
	}                                                                                                                 // 101
}); //Code that runs only on the server                                                                            // 38
                                                                                                                   //
if (Meteor.isServer) {                                                                                             // 105
	Meteor.startup(function () {                                                                                      // 106
		// code to run on server at startup                                                                              // 106
		//add indexes to collections for faster search                                                                   // 107
		Classes._ensureIndex({                                                                                           // 108
			'classSub': 1                                                                                                   // 109
		}, {                                                                                                             // 109
			'classNum': 1                                                                                                   // 110
		}, {                                                                                                             // 110
			'classTitle': 1                                                                                                 // 111
		}, {                                                                                                             // 111
			'_id': 1                                                                                                        // 112
		});                                                                                                              // 112
                                                                                                                   //
		Subjects._ensureIndex({                                                                                          // 114
			'subShort': 1                                                                                                   // 115
		}, {                                                                                                             // 115
			'subFull': 1                                                                                                    // 116
		});                                                                                                              // 116
                                                                                                                   //
		Reviews._ensureIndex({                                                                                           // 118
			'class': 1                                                                                                      // 119
		}, {                                                                                                             // 119
			'difficulty': 1                                                                                                 // 120
		}, {                                                                                                             // 120
			'quality': 1                                                                                                    // 121
		}, {                                                                                                             // 121
			'grade': 1                                                                                                      // 122
		}, {                                                                                                             // 122
			'user': 1                                                                                                       // 123
		}, {                                                                                                             // 123
			'visible': 1                                                                                                    // 124
		});                                                                                                              // 124
	}); //code that runs whenever needed                                                                              // 126
	//"publish" classes based on search query. Only published classes are visible to the client                       // 129
                                                                                                                   //
	Meteor.publish('classes', function () {                                                                           // 130
		function validClasses(searchString) {                                                                            // 130
			if (searchString != undefined && searchString != "") {                                                          // 131
				console.log("query entered:", searchString);                                                                   // 132
				return Classes.find({                                                                                          // 133
					'$or': [{                                                                                                     // 133
						'classSub': {                                                                                                // 134
							'$regex': ".*" + searchString + ".*",                                                                       // 134
							'$options': '-i'                                                                                            // 134
						}                                                                                                            // 134
					}, {                                                                                                          // 134
						'classNum': {                                                                                                // 135
							'$regex': ".*" + searchString + ".*",                                                                       // 135
							'$options': '-i'                                                                                            // 135
						}                                                                                                            // 135
					}, {                                                                                                          // 135
						'classTitle': {                                                                                              // 136
							'$regex': ".*" + searchString + ".*",                                                                       // 136
							'$options': '-i'                                                                                            // 136
						}                                                                                                            // 136
					}, {                                                                                                          // 136
						'classFull': {                                                                                               // 137
							'$regex': ".*" + searchString + ".*",                                                                       // 137
							'$options': '-i'                                                                                            // 137
						}                                                                                                            // 137
					}]                                                                                                            // 137
				}, {                                                                                                           // 133
					limit: 200                                                                                                    // 140
				});                                                                                                            // 140
			} else {                                                                                                        // 141
				console.log("no search");                                                                                      // 143
				return Classes.find({}, {                                                                                      // 144
					limit: 200                                                                                                    // 145
				});                                                                                                            // 145
			}                                                                                                               // 146
		}                                                                                                                // 147
                                                                                                                   //
		return validClasses;                                                                                             // 130
	}()); //"publish" reviews based on selected course and visibility requirements. Only published reviews are visible to the client
                                                                                                                   //
	Meteor.publish('reviews', function () {                                                                           // 150
		function validReviews(courseId, visiblity) {                                                                     // 150
			var ret = null; //show valid reviews for this course                                                            // 151
                                                                                                                   //
			console.log('getting reviews');                                                                                 // 153
                                                                                                                   //
			if (courseId != undefined && courseId != "" && visiblity == 1) {                                                // 154
				console.log('in 1');                                                                                           // 155
				ret = Reviews.find({                                                                                           // 156
					"class": courseId,                                                                                            // 156
					visible: 1                                                                                                    // 156
				}, {                                                                                                           // 156
					limit: 700                                                                                                    // 156
				});                                                                                                            // 156
			} else if (courseId != undefined && courseId != "" && visiblity == 0) {                                         // 157
				//invalidated reviews for a class                                                                              // 157
				console.log('in 2');                                                                                           // 158
				ret = Reviews.find({                                                                                           // 159
					"class": courseId,                                                                                            // 159
					visible: 0                                                                                                    // 159
				}, {                                                                                                           // 159
					limit: 700                                                                                                    // 160
				});                                                                                                            // 160
			} else if (visiblity == 0) {                                                                                    // 161
				//all invalidated reviews                                                                                      // 161
				ret = Reviews.find({                                                                                           // 162
					visible: 0                                                                                                    // 162
				}, {                                                                                                           // 162
					limit: 700                                                                                                    // 162
				});                                                                                                            // 162
			} else {                                                                                                        // 163
				//no reviews                                                                                                   // 163
				//will always be empty because visible is 0 or 1. allows meteor to still send the ready flag when a new publication is sent
				ret = Reviews.find({                                                                                           // 165
					visible: 10                                                                                                   // 165
				});                                                                                                            // 165
			}                                                                                                               // 166
                                                                                                                   //
			return ret;                                                                                                     // 167
		}                                                                                                                // 168
                                                                                                                   //
		return validReviews;                                                                                             // 150
	}()); // COMMENT THESE OUT AFTER THE FIRST METEOR BUILD!!                                                         // 150
	//Classes.remove({});                                                                                             // 171
	//Subjects.remove({});                                                                                            // 172
	//addAllCourses(findAllSemesters());                                                                              // 173
} //Other helper functions used above                                                                              // 174
// Adds all classes and subjects from Cornell's API between the selected semesters to the database.                // 178
// Called when updating for a new semester and when initializing the database                                      // 179
                                                                                                                   //
                                                                                                                   //
function addAllCourses(semesters) {                                                                                // 180
	// var semesters = ["SP17", "SP16", "SP15","FA17", "FA16", "FA15"];                                               // 181
	for (semester in meteorBabelHelpers.sanitizeForInObject(semesters)) {                                             // 182
		//get all classes in this semester                                                                               // 183
		var result = HTTP.call("GET", "https://classes.cornell.edu/api/2.0/config/subjects.json?roster=" + semesters[semester], {
			timeout: 30000                                                                                                  // 184
		});                                                                                                              // 184
                                                                                                                   //
		if (result.statusCode != 200) {                                                                                  // 185
			console.log("error");                                                                                           // 186
		} else {                                                                                                         // 187
			response = JSON.parse(result.content); //console.log(response);                                                 // 188
                                                                                                                   //
			var sub = response.data.subjects;                                                                               // 190
                                                                                                                   //
			for (course in meteorBabelHelpers.sanitizeForInObject(sub)) {                                                   // 191
				parent = sub[course]; //if subject doesn't exist add to Subjects collection                                    // 192
                                                                                                                   //
				checkSub = Subjects.find({                                                                                     // 194
					'subShort': parent.value.toLowerCase()                                                                        // 194
				}).fetch();                                                                                                    // 194
                                                                                                                   //
				if (checkSub.length == 0) {                                                                                    // 195
					console.log("new subject: " + parent.value);                                                                  // 196
					Subjects.insert({                                                                                             // 197
						subShort: parent.value.toLowerCase(),                                                                        // 198
						subFull: parent.descr                                                                                        // 199
					});                                                                                                           // 197
				} //for each subject, get all classes in that subject for this semester                                        // 201
                                                                                                                   //
                                                                                                                   //
				var result2 = HTTP.call("GET", "https://classes.cornell.edu/api/2.0/search/classes.json?roster=" + semesters[semester] + "&subject=" + parent.value, {
					timeout: 30000                                                                                                // 204
				});                                                                                                            // 204
                                                                                                                   //
				if (result2.statusCode != 200) {                                                                               // 205
					console.log("error2");                                                                                        // 206
				} else {                                                                                                       // 207
					response2 = JSON.parse(result2.content);                                                                      // 208
					courses = response2.data.classes; //add each class to the Classes collection if it doesnt exist already       // 209
                                                                                                                   //
					for (course in meteorBabelHelpers.sanitizeForInObject(courses)) {                                             // 212
						try {                                                                                                        // 213
							var check = Classes.find({                                                                                  // 214
								'classSub': courses[course].subject.toLowerCase(),                                                         // 214
								'classNum': courses[course].catalogNbr                                                                     // 214
							}).fetch();                                                                                                 // 214
                                                                                                                   //
							if (check.length == 0) {                                                                                    // 215
								console.log("new class: " + courses[course].subject + " " + courses[course].catalogNbr + "," + semesters[semester]); //insert new class with empty prereqs and reviews
                                                                                                                   //
								Classes.insert({                                                                                           // 218
									classSub: courses[course].subject.toLowerCase(),                                                          // 219
									classNum: courses[course].catalogNbr,                                                                     // 220
									classTitle: courses[course].titleLong,                                                                    // 221
									classPrereq: [],                                                                                          // 222
									classFull: courses[course].subject.toLowerCase() + " " + courses[course].catalogNbr + " " + courses[course].titleLong.toLowerCase(),
									classSems: [semesters[semester]]                                                                          // 224
								});                                                                                                        // 218
							} else {                                                                                                    // 226
								var matchedCourse = check[0]; //only 1 should exist                                                        // 227
                                                                                                                   //
								var oldSems = matchedCourse.classSems;                                                                     // 228
                                                                                                                   //
								if (oldSems.indexOf(semesters[semester]) == -1) {                                                          // 229
									console.log("update class " + courses[course].subject + " " + courses[course].catalogNbr + "," + semesters[semester]);
									oldSems.push(semesters[semester]); //add this semester to the list                                        // 231
                                                                                                                   //
									Classes.update({                                                                                          // 232
										_id: matchedCourse._id                                                                                   // 232
									}, {                                                                                                      // 232
										$set: {                                                                                                  // 232
											classSems: oldSems                                                                                      // 232
										}                                                                                                        // 232
									});                                                                                                       // 232
								}                                                                                                          // 233
							}                                                                                                           // 234
						} catch (error) {                                                                                            // 235
							console.log(course);                                                                                        // 236
						}                                                                                                            // 237
					}                                                                                                             // 238
				}                                                                                                              // 239
			}                                                                                                               // 240
		}                                                                                                                // 241
	}                                                                                                                 // 242
} //returns an array of the current semester, to be given to the addAllCourses function                            // 243
                                                                                                                   //
                                                                                                                   //
function findCurrSemester() {                                                                                      // 246
	var response = HTTP.call("GET", "https://classes.cornell.edu/api/2.0/config/rosters.json", {                      // 247
		timeout: 30000                                                                                                   // 247
	});                                                                                                               // 247
                                                                                                                   //
	if (response.statusCode != 200) {                                                                                 // 248
		console.log("error");                                                                                            // 249
	} else {                                                                                                          // 250
		response = JSON.parse(response.content);                                                                         // 251
		allSemesters = response.data.rosters;                                                                            // 252
		thisSem = allSemesters[allSemesters.length - 1].slug;                                                            // 253
		return [thisSem];                                                                                                // 254
	}                                                                                                                 // 255
} //returns an array of all current semesters, to be given to the addAllCourses function                           // 256
                                                                                                                   //
                                                                                                                   //
function findAllSemesters() {                                                                                      // 259
	var response = HTTP.call("GET", "https://classes.cornell.edu/api/2.0/config/rosters.json", {                      // 260
		timeout: 30000                                                                                                   // 260
	});                                                                                                               // 260
                                                                                                                   //
	if (response.statusCode != 200) {                                                                                 // 261
		console.log("error");                                                                                            // 262
	} else {                                                                                                          // 263
		response = JSON.parse(response.content);                                                                         // 264
		allSemesters = response.data.rosters;                                                                            // 265
		var allSemestersArray = allSemesters.map(function (semesterObject) {                                             // 266
			return semesterObject.slug;                                                                                     // 267
		});                                                                                                              // 268
		console.log(allSemestersArray);                                                                                  // 269
		return allSemestersArray;                                                                                        // 270
	}                                                                                                                 // 271
}                                                                                                                  // 272
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}},{
  "extensions": [
    ".js",
    ".json",
    ".html",
    ".css",
    ".jsx"
  ]
});
require("./client/template.main.js");
require("./client/main.jsx");