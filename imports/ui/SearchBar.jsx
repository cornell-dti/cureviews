import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Classes } from '../api/dbDefs.js';
import Course from './Course.jsx';
import "./css/SearchBar.css";

/*
  SearchBar Component.

  Simple Styling Component that renders a searchbar as an input element with a list of
  results that match the user's query.

  The component does not control the input element - it is instead controlled by
  this componet's parent, which saves the value of the query each time it changes.
  It takes in this query and requests a list of relevant classes from the local
  meteor database and displays them.
*/

let newSearchState= {selected:false, mouse:0, enter:0};

const initState={
  showDropdown: true,
  index: 0, //the initial state is the first element
  enter: 0, //to keep track of the initial state of enter as false
  mouse: 0, //keep track of the initial state of mouse hovering in the list cells as false
  courseSubject:"", //course subject that's been selected for pop-up review
  courseTitle:"", //course title that's been selected for pop-up review
  courseNumber:null,//course number that's been selected for pop-up review
  courseId:null, //id of course that's been selected for pop-up review
  selected:false, //whether or not user has clicked yet,
  query:"", //user's query,
  allCourses:[]
};

export default class SearchBar extends Component {

  constructor(props) {
    super(props);
    
    this.state = initState;
      this.handleChange = this.handleChange.bind(this);
      this.setCourse=this.setCourse.bind(this);
      this.updateQuery=this.updateQuery.bind(this);
  }

  // Set the local state variable 'query' to the current value of the input (given by user)
  // Passed as a prop to SearchBar component, which calls this when user changes their query.
  updateQuery = (event) => {
    // trim the query to remove trailing spaces
    this.setState({ query: event.target.value.trim() });
    //Session to be able to get info from this.state.query in withTracker
    Session.set('querySession', this.state.query);
    Meteor.call("getClassesByQuery", this.state.query, (err, classes)=>{
      this.setState({allCourses:classes})
    });
  }



  //This function is only used for the pop-up
  //search bar. It keeps track of the value inside it
  handleChange(event) {
    this.setState({textValue: event.target.value});
    if(!this.state.showDropdown){
      this.setState(newSearchState);
    }
  }

  //Handler function passed into Course component to get information on user-clicked course
  //in pop-up review.
  setCourse(id, subject, number, title, professors){
    this.setState({
      courseId:id,
      courseSubject:subject,
      courseNumber:number,
      courseTitle:title,
      textValue:subject.toUpperCase()+number+": "+title,
      selected:true
    });
    this.props.formPopupHandler(id, professors);
  }
  

  
  handleKeyPress = (e) => {
    //detect some arrow key movement (up, down, or enter)

    Meteor.call("getCoursesByKeyword", "fish", (err, res)=>{ console.log(res)});

    this.setState(newSearchState);
    if (e.key == "ArrowDown") {
      //if the down arrow was detected, increase the index value by 1 to highlight the next element
      this.setState( prevState => ({
        index: prevState.index + 1
        
      }))

    }
    else if (e.key == "ArrowUp") {
      //if the up arrow key was detected, decrease the index value by 1 to highlight the prev element
      //never index below 0 (the first element)
      this.setState( prevState => ({
        index: Math.max(prevState.index - 1, 0)
        
      }))

    }
    
    else if(e.key == "Enter"){
      //if the enter key was detected, change the state of enter to 1 (true)
      this.setState({
        enter: 1
      })
    }
    
    
    else{
      this.updateQuery(e);
    }
    
  }
  
  mouseHover = () => {
    this.setState({
      mouse: 1
    })
    
  }
  
  mouseLeave = () => {
    this.setState({
      mouse: 0
    })
    this.setState({
      index: 0 //resets the index to the first element
    })
  }
  
  
  
  
  showDropdown = () => {
    this.setState({showDropdown: true})
  }

  hideDropdown = () => {
    this.setState({showDropdown: false})
  }

  // Convert the class objects that satisfy this query into a styled list of search results.
  // Each one will act as a button, such that clicking a course will take the user
  // to that class's ClassView. The name of the class will have underline and bold
  // where it matches the query.
  renderCourses() {
    //Used to start the timer "popup_timer" to display a popup after 30 seconds post-search
    //See ClassView.jsx: decidePopup function
    if(Session.get("seen_popup") == undefined || Session.get("seen_popup") == ""){
      Session.setPersistent({"popup_timer": new Date().getTime()});
    }
    
    if (this.state.query !== "" && !this.state.selected && this.props.isPopup ) {
      return this.state.allCourses.slice(0,3).map((course, i) => (
        //create a new class "button" that will set the selected class to this class when it is clicked.
        <Course key={course._id} info={course} query={this.state.query} useRedirect={false} handler={this.setCourse}
          active={this.state.index == i} cursor={this.state.enter} 
          mouse = {this.state.mouse}/>
        //the prop "active" will pass through a bool indicating if the index affected through arrow movement is equal to
        //the index matching with the course
        //the prop "cursor" will pass through the value of the enter state
        //the prop "mouse" will pass through the value of the mouse state
      ));
      
    }
    else if (this.state.query !== "" && !this.state.selected){
      return this.state.allCourses.slice(0,100).map((course, i) => (
        //create a new class "button" that will set the selected class to this class when it is clicked.
        <Course key={course._id} info={course} query={this.state.query} useRedirect={true} handler={this.setCourse}
          active={this.state.index == i} cursor={this.state.enter} 
          mouse = {this.state.mouse}/>
        //the prop "active" will pass through a bool indicating if the index affected through arrow movement is equal to
        //the index matching with the course
        //the prop "cursor" will pass through the value of the enter state
        //the prop "mouse" will pass through the value of the mouse state
      ));
    }
    else {
      return <div />;
    }
  }

  render() {
    if(this.props.isPopup) return (
      <div className="search-bar text-left" id="searchbar-popup" >
        <input className={"search-text-popup " + (this.state.selected ? "search-text-popup-selected" : "")} value={this.state.textValue} onChange={this.handleChange} id="search" onKeyUp={this.handleKeyPress} placeholder="Search for a class" autoComplete="off"/>
        <ul id="output-popup" style={this.state.showDropdown ? {} : { display: 'none' }} onKeyPress={this.handleKeyPress} onMouseEnter={this.mouseHover} onMouseLeave={this.mouseLeave}>
          {this.renderCourses()}
        </ul>
      </div>
    );
    else return (
      <div className="search-bar text-left" id="searchbar" >
      <input className="search-text" id="search" onKeyUp={this.handleKeyPress} placeholder="Search for classes (e.g. CS 2110, Introduction to Creative Writing)" autoComplete="off"/>
      <ul id="output" style={this.state.showDropdown ? {} : { display: 'none' }} onKeyPress={this.handleKeyPress} onMouseEnter={this.mouseHover} onMouseLeave={this.mouseLeave}>
        {this.renderCourses()}
      </ul>
    </div>
    );
  }
}

// SearchBar requires the user's query from the parent component, a function
// to call when the query changes so the parent can update its copy of the query,
// and a list of all courses that satisfy the query.
SearchBar.propTypes = {
  loading: PropTypes.bool, // optional
  isPopup: PropTypes.bool, // true if rendered in pop-up
  formPopupHandler: PropTypes.func //handler to set state for form if in popup
};

// wrap in a container class that allows the component to dynamically grab courses
// that contain this query anywhere in their full name. The component will automatically
//  re-render when new classes are added to the database.
// export default withTracker(props => {
//   const subscription = Meteor.subscribe('classes', props.query);
//   const loading = !subscription.ready();
//   const allCourses = Classes.find({}).fetch();
//   return {
//     allCourses, loading,
//   };
// }) (SearchBar);
