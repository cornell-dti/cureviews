import React, { Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
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

export class SearchBar extends Component {

  constructor(props) {
    super(props);
    

    this.state = {
      showDropdown: true,
      result: [],
      index: 0,
      
    }
    
  
  }
  
  
  handleKeyPress = (e) => {
    //detect some arrow key movement (up or down)
    //const {result, index, enter} = this.state
    if (e.key == "ArrowDown") {
      //find the first element of the dropdown
      //hilight it -> focus
      console.log("arrow")
      this.setState( prevState => ({
        index: prevState.index + 1
      }))
 
    }
    else if (e.key == "ArrowUp") {
      
      this.setState( prevState => ({
        index: prevState.index - 1
      }))
    }
    
    /*else if(e.key == "Enter"){
      console.log("enter")
      //console.log(ReactDOM.findDOMNode(this.refs.enter).value);
      //ReactDOM.findDOMNode(this.refs.enter).value
      console.log("finish")
    }*/
    
    
    else{
      this.props.queryFunc(e);
    }
    
  }
  
  handleEnter=(e) => {
    if(e.key == "Enter"){
      refs.triggerClick()
    }
  }
  
  onEnter = () => {
    console.log(this.refs)
    this.refs.triggerClick()
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
    if (this.props.query !== "") {
      /*return this.props.allCourses.slice(0,100).map((course) => (
        //create a new class "button" that will set the selected class to this class when it is clicked.
        <Course key={course._id} info={course} query={this.props.query}/>
      ));*/
      result = this.props.allCourses.slice(0,100);
      return result.map((course, i) => {
        
        return <Course key={course._id} info={course} query={this.props.query} active={this.state.index == i} cursor={this.handleEnter} onRef={ref => (this.child = ref)}/>
      });
    }
    else {
      return <div />;
    }
  }

  

  render() {
    const {index} = this.state
    
    return (
      <div className="search-bar text-left" id="searchbar" >
        <input className="search-text" id="search" onKeyUp={this.handleKeyPress} placeholder="Search for classes (e.g. CS 2110, Introduction to Creative Writing)"/>
        <ul id="output" style={this.state.showDropdown ? {} : { display: 'none' }} onKeyPress={this.handleKeyPress}>
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
  allCourses: PropTypes.array.isRequired,
  loading: PropTypes.bool, // optional
  query: PropTypes.string.isRequired,
  queryFunc: PropTypes.func.isRequired
};

// wrap in a container class that allows the component to dynamically grab courses
// that contain this query anywhere in their full name. The component will automatically
//  re-render when new classes are added to the database.
export default withTracker(props => {
  const subscription = Meteor.subscribe('classes', props.query);
  const loading = !subscription.ready();
  const allCourses = Classes.find({}).fetch();
  return {
    allCourses, loading,
  };
}) (SearchBar);
