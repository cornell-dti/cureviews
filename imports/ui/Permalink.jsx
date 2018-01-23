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
            selectedClass: null
        };
    }

    componentWillMount () {
        Meteor.call("getCourseByInfo", this.state.number, this.state.subject, (err, selectedClass) => {
            if (!err && selectedClass) {
                this.setState({
                    selectedClass: selectedClass
                });
            }
            else {
                console.log("no");
                // 404
            }
        });
    }

    render () {
        if (this.state.selectedClass) {
            return (
                <App selectedClass={ this.state.selectedClass } />
            );
        }
        else {
            return (
                <CourseCard course={ {waiting: true} } />
            )
        }
    }
}
