import React, { Component, PropTypes } from 'react';
import { Meteor } from "meteor/meteor";
import App from './App.jsx';
import CourseCard from './CourseCard.jsx';

// Permalink component - Component to render a CourseCard after searching for it in the database
export default class Permalink extends Component {
    constructor (props) {
        super(props);
        const number  = this.props.match.params.number;
        const subject = this.props.match.params.subject.toLowerCase();

        this.state = {
            number: number,
            subject: subject,
            selectedClass: null,
            classDoesntExist: false,
        };
    }

    componentWillMount () {
        Meteor.call("getCourseByInfo", this.state.number, this.state.subject, (err, selectedClass) => {
            console.log("requesting", selectedClass);
            if (!err && selectedClass) {
                this.setState({
                    selectedClass: selectedClass
                });
            }
            else {
                // 404
                console.log("no");
                this.setState({
                    classDoesntExist: true
                });
            }
        });
    }

    render () {
        if (this.state.selectedClass) {
            //courseCard
            return (
                <App selectedClass={ this.state.selectedClass } />
            );
        } else if (this.state.classDoesntExist) {
          //TODO: 404 error graphic
          return (
              <div id="coursedetails">
                404: Class not found
              </div>
          );
        } else {
          //TODO: loading screen graphic
          return (
              <div id="coursedetails">
                Loading...
              </div>
          );
        }
    }
}
