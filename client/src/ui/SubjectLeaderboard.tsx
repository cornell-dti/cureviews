import React, { Component } from 'react';
import axios from 'axios';
import { Session } from '../session-store';

type State = { readonly topSubjects: readonly any[] };

/*
  Subject Leaderboard Component.

  Simple styling component that renders a list of the top 15 subjects with the
  most total reviews. The subjects are not clickable.

  The course is rendered as repeating ol elements.
*/

export default class SubjectLeaderboard extends Component<{}, State> {
  state: State = { topSubjects: [] };

  componentDidMount() {
    // get the top subjects by number of reviews, using a Meteor function
    // defined in imports/api/classes
    axios.post(`/v2/topSubjects`, { token: Session.get("token") }).then((res) => {
      let data = res.data.result;
      this.setState({ topSubjects: data });
    }).catch((err) => {
      console.log("error retrieving top subjects ", err);
    });
  }

  // convert the list of class topics into numbered leaderboard of most reviewed topics.
  renderCourses() {
    if (this.state.topSubjects !== []) {
      return this.state.topSubjects.map((course, index) => (
        <ol className="no-hover classbutton" key={index}>
          <h3 className="text-style-2" >
            {/* Displays subject and number it ranks (per total reivews) */}
            {(index + 1).toString()}. {course[0]}
            {/* Displays the number of total reviews next to subject */}
            <span className="float-right">{course[1]}</span>
          </h3>
        </ol>
      ));
    } else {
      return <div />;
    }
  }

  render() {
    return (
      <section>
        <legend className="subheader">Most Reviews by Subject</legend>
        {/* Note that the id:"reviewpanel" and "reviewul" still refer to this component as a 
        component.  I did not change the name to keep the styling consistent*/}
        <div className="card card-default" id="reviewpanel">
          <div>
            <ul id="reviewul">
              {this.renderCourses()}
            </ul>
          </div>
        </div>
      </section>
    );
  }
}
