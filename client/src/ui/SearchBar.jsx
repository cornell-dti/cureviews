import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Course from './Course';
import SubjectResult from './SubjectResult';
import ProfessorResult from './ProfessorResult';
import "./css/SearchBar.css";
import { Redirect } from 'react-router';
import axios from "axios";

/*
  SearchBar Component.

  Simple Styling Component that renders a searchbar as an input element with a list of
  results that match the user's query.

  The component does not control the input element - it is instead controlled by
  this componet's parent, which saves the value of the query each time it changes.
  It takes in this query and requests a list of relevant classes from the local
  meteor database and displays them.
*/

let newSearchState = { selected: false, mouse: 0, enter: 0, index: 0 };



const initState = {
  showDropdown: true,
  index: 0, //the initial state is the first element
  enter: 0, //to keep track of the initial state of enter as false
  mouse: 0, //keep track of the initial state of mouse hovering in the list cells as false
  selected: false, //whether or not user has clicked yet,
  query: "", //user's query,
  allCourses: [],
  allSubjects: [],
  allProfessors: []
};

export default class SearchBar extends Component {

  constructor(props) {
    super(props);

    this.state = initState;
    this.updateQuery = this.updateQuery.bind(this);
    this.checkForCourseMatch = this.checkForCourseMatch.bind(this);
  }

  // Set the local state variable 'query' to the current value of the input (given by user)
  // Passed as a prop to SearchBar component, which calls this when user changes their query.
  updateQuery = (event) => {
    // Reset index, enter, mouse, and selected
    this.setState(newSearchState);
    // trim the query to remove trailing spaces
    let query = event.target.value.trim();

    // This is used to make "cs2110" and "cs 2110" equivalent
    if (query && query.split(" ").length === 1) {
      query = query.match(/[a-z]+|[^a-z]+/gi).join(" ");
    }

    if (this.checkForCourseMatch(query)) {
      // If query is exact match to a class,
      //  highlight this class by setting index to index of this class
      //  in search results dropdown
      this.setState({ index: this.state.allSubjects.length + 1 });
    }
    this.setState({ query: query });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.query.toLowerCase() !== prevState.query.toLowerCase() || this.props !== prevProps) {
      axios.post(`/v2/getClassesByQuery`, { query: this.state.query }).then(response => {
        const queryCourseList = response.data.result;
        if (queryCourseList.length !== 0) {
          // Save the Class object that matches the request
          this.setState({
            allCourses: queryCourseList
          });
        }
        else {
          this.setState({
            allCourses: []
          });
        }
      }
      )
        .catch(e => console.log("Getting courses failed!"));

      axios.post(`/v2/getSubjectsByQuery`, { query: this.state.query }).then(response => {
        const subjectList = response.data.result;
        if (subjectList && subjectList.length !== 0) {
          // Save the list of Subject objects that matches the request
          this.setState({
            allSubjects: subjectList
          });
        }
        else {
          this.setState({
            allSubjects: []
          });
        }
      }).catch(e => console.log("Getting subjects failed!"));

      axios.post(`/v2/getProfessorsByQuery`, { query: this.state.query }).then(response => {
        const professorList = response.data.result;
        if (professorList && professorList.length !== 0) {
          // Save the list of Subject objects that matches the request
          this.setState({
            allProfessors: professorList
          });
        }
        else {
          this.setState({
            allProfessors: []
          });
        }
      }).catch(e => console.log("Getting subjects failed!"));

    }
  }

  handleKeyPress = (e) => {
    //detect some arrow key movement (up, down, or enter)
    if (e.key === "ArrowDown") {
      //if the down arrow was detected, increase the index value by 1 to highlight the next element
      this.setState(prevState => ({
        index: prevState.index + 1
      }))

    }
    else if (e.key === "ArrowUp") {
      //if the up arrow key was detected, decrease the index value by 1 to highlight the prev element
      //never index below 0 (the first element)
      this.setState(prevState => ({
        index: Math.max(prevState.index - 1, 0)

      }))

    }

    else if (e.key === "Enter") {
      //if the enter key was detected, change the state of enter to 1 (true)
      this.setState({
        enter: 1
      })
    }

    else {
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
    this.setState({ showDropdown: true })
  }

  hideDropdown = () => {
    this.setState({ showDropdown: false })
  }

  checkForCourseMatch(query) {
    let isMatch = false;
    let querySplit = query.toLowerCase().split(" ");
    let queryNum = "";
    let querySub = "";
    if (querySplit.length === 2) {
      querySub = querySplit[0];
      queryNum = querySplit[1];
    }
    this.state.allCourses.forEach(course => {
      let classNum = course.classNum.toLowerCase();
      let classSub = course.classSub.toLowerCase();
      if (classNum === queryNum && classSub === querySub) {
        isMatch = true;
      }
    });

    return isMatch;
  }

  // Convert the class amd major objects that satisfy this query into a styled list of search results.
  // Each one will act as a button, such that clicking a course will take the user
  // to that class's ClassView. The name of the class will have underline and bold
  // where it matches the query.
  // Clicking a major will take the user to the results page for that major's Classes
  renderResults() {
    if (this.state.query !== "" && !this.state.selected) {
      let results = [];

      // Used for "enter" key on 'Search: "query" ' button for exact search
      // Sends user to /results/keyword/query+query
      if (this.state.index === 0 && this.state.enter === 1) {
        this.setState(initState);
        return <Redirect push to={`/results/keyword/${this.state.query.split(" ").join("+")}`}></Redirect>
      }

      let exact_search = (
        <a key={"search"}
          className={this.state.index === 0 && this.state.mouse !== 1 ? 'active-class resultbutton top-resultbutton' : 'resultbutton top-resultbutton'}
          href={`/results/keyword/${this.state.query.split(" ").join("+")}`}>
          <p className="result-text">{"Search: \"" + this.state.query + "\""}</p>
        </a>
      )

      results.push(exact_search);

      let subjectList = this.state.allSubjects.slice(0, 3).map((subject, i) => (
        //create a new class "button" that will set the selected class to this class when it is clicked.
        <SubjectResult key={subject._id} info={subject} query={this.state.query}
          active={this.state.index === (i + 1 /* plus 1 because of exact search */)}
          enter={this.state.enter} mouse={this.state.mouse} />
        //the prop "active" will pass through a bool indicating if the index affected through arrow movement is equal to
        //the index matching with the course
        //the prop "enter" will pass through the value of the enter state
        //the prop "mouse" will pass through the value of the mouse state
      ));

      // Resets searchbar if user hit "enter" on a major in dropdown
      if (this.state.enter === 1) {
        this.setState(initState);
      }

      results.push(subjectList)

      // Generate list of matching professors and add to results list
      let professorList = this.state.allProfessors.slice(0, 3).map((professor, i) => (
        //create a new class "button" that will set the selected class to this class when it is clicked.
        <ProfessorResult key={professor._id} professor={professor} query={this.state.query}
          active={this.state.index === (i + subjectList.length + 1 /* plus 1 because of exact search */)}
          enter={this.state.enter} mouse={this.state.mouse} />
        //the prop "active" will pass through a bool indicating if the index affected through arrow movement is equal to
        //the index matching with the course
        //the prop "enter" will pass through the value of the enter state
        //the prop "mouse" will pass through the value of the mouse state
      ));

      results.push(professorList)

      results.push(this.state.allCourses.slice(0, 5).map((course, i) => (
        //create a new class "button" that will set the selected class to this class when it is clicked.
        <Course key={course._id} info={course} query={this.state.query} handler={this.setCourse}
          active={this.state.index === (i + subjectList.length + professorList.length + 1 /* plus because of exact search, professors, subjects */)}
          enter={this.state.enter}
          mouse={this.state.mouse} />
        //the prop "active" will pass through a bool indicating if the index affected through arrow movement is equal to
        //the index matching with the course
        //the prop "enter" will pass through the value of the enter state
        //the prop "mouse" will pass through the value of the mouse state
      )));

      return results;
    }
    else {
      return <div />;
    }
  }

  render() {
    const text = window.innerWidth >= 840 ? "Search by any keyword e.g. “FWS”, “ECON” or “CS 2110”" : "Search any keyword"
    return (
      <div className={"row " + (this.props.contrastingResultsBackground ? "contrasting-result-background" : "")}>
        <div className={"col-lg-12 col-md-12 col-sm-12 col-xs-12 searchbar " + (this.props.isInNavbar ? "searchbar-in-navbar" : "")}>
          <input className="search-text" onKeyUp={this.handleKeyPress} defaultValue={this.props.isInNavbar ? (this.props.userInput ? this.props.userInput : "") : ""} placeholder={this.props.isInNavbar ? "" : text} autoComplete="off" />

          <ul className="output" style={this.state.query !== "" ? {} : { display: 'none' }} onKeyPress={this.handleKeyPress} onMouseEnter={this.mouseHover} onMouseLeave={this.mouseLeave}>
            {this.renderResults()}
          </ul>
        </div>
      </div>
    );
  }
}

// SearchBar requires the user's query from the parent component, a function
// to call when the query changes so the parent can update its copy of the query,
// and a list of all courses that satisfy the query.
SearchBar.propTypes = {
  isInNavbar: PropTypes.bool, // true if input should not have a placeholder
  loading: PropTypes.bool, // optional
  contrastingResultsBackground: PropTypes.bool, // Used to display contrasting background for search results
  userInput: PropTypes.string // optional previously entered search term
};
