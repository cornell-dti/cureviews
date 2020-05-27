import React, { Component, useState, useEffect } from 'react';
import { Meteor } from "../meteor-shim";
import Form from './Form.jsx';
import './css/CourseCard.css';
import { lastOfferedSems, getGaugeValues } from 'common/CourseCard';

type Props = {
  course: any;
  reviews: any[];
};

type State ={
  rating: string;
  ratingColor: string;
  diff:string;
  diffColor: string;
  workload: string;
  workloadColor: string;
  lastTyped?: number;
};

/*
  Course Card Component.

  Container Component that returns a paenl of aggregated information about a class:
  Displays:
    - course title
    - link to course roster
    - gauges for quality, difficulty, workload
    - semsters last offered
    - attendance requirement
*/

export class CourseCard extends Component<Props, State> {
  defaultGaugeState: State;
  
  constructor(props: Props) {
    super(props);
    // default gauge values
     this.defaultGaugeState = {
      rating: "-",
      ratingColor: "#E64458",
      diff: "-",
      diffColor: "#E64458",
      workload: "-",
      workloadColor: "#E64458",
    };

    // initialize state as default gauge values
    this.state = this.defaultGaugeState;
  }

  // Whenever the incoming props change (i.e, the database of reviews for a class
  // is updated) trigger a re-render by updating the gauge values in the local state.
  componentWillReceiveProps(nextProps: Props) {
    this.updateState(nextProps.course, nextProps.reviews);
  }

  // Recalculate gauge values and other metrics to update the local state
  updateState(selectedClass: any, allReviews: any) {
    if (selectedClass !== null && selectedClass !== undefined) {
      // gather data on the reviews and set mandatory flags.
      if (allReviews.length !== 0) {
        // set the new state to the collected values. Calls getGaugeValues function in CourseCard.js
        this.setState(getGaugeValues(allReviews));
      } else {
        this.setState(this.defaultGaugeState); //default gauge values
      }
    }
    else {
      this.setState(this.defaultGaugeState); //default gauge values
    }
  }

  // Updates the last time user typed in the form textbox
  // Used so that the popup doesn't show while user is typing where
  onFormChange = () => this.setState({lastTyped:new Date().getTime()});

  render() {
    const theClass = this.props.course;

    // Calls function in CourseCard.js that returns a clean version of the last semster class was offered
    const offered = lastOfferedSems(theClass);

    return (
      <div className="coursecard-container">
        <h1 className="coursecard-class-title">
          {theClass.classTitle}
        </h1>
        <p className="coursecard-class-info">
          {theClass.classSub.toUpperCase() + " " + theClass.classNum + ", " + offered}
        </p>
        <Form onChange={this.onFormChange} course={theClass} inUse={true}/>
      </div>
    );
  }
}

// wrap in a container class that allows the component to dynamically grab reviews.
// The component will automatically re-render if the reviews change.
export default ({ course }: { readonly course: any }) => {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    Meteor.subscribe('reviews', course._id, 1, 0, (_: any, reviews: any[]) => {
      setReviews(reviews);
    });
  }, [course]);

  return <CourseCard course={course} reviews={reviews} />
};
