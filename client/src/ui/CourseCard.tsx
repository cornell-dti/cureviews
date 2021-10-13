import React, { Component, useState, useEffect } from 'react';
import axios from "axios";
import './css/CourseCard.css';
import { Class, Review } from 'common';
import { lastOfferedSems } from 'common/CourseCard';

type Props = {
  course: Class;
  reviews: readonly Review[];
};

type State = {
  rating: string;
  ratingColor: string;
  diff: string;
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
    this.updateState(nextProps.course);
  }

  // Recalculate gauge values and other metrics to update the local state
  updateState(selectedClass: any) {
    if (selectedClass !== null && selectedClass !== undefined) {
      // gather data on the reviews and set mandatory flags.
      // set the new state to metrics stored in DB for this class
      this.setState({
        rating: selectedClass.classRating,
        workload: selectedClass.classWorkload,
        diff: selectedClass.classDifficulty
      });
    }
    else {
      this.setState(this.defaultGaugeState); //default gauge values
    }
  }

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
      </div>
    );
  }
}

// wrap in a container class that allows the component to dynamically grab reviews.
// The component will automatically re-render if the reviews change.
export default ({ course }: { readonly course: any }) => {
  const [reviews, setReviews] = useState<readonly Review[]>([]);

  useEffect(() => {
    axios.post(`/v2/getReviewsByCourseId`, { courseId: course._id }).then(response => {
      const reviews = response.data.result
      if (reviews) {
        setReviews(reviews);
      } else {
        // eslint-disable-next-line no-console
        console.log(`Unable to find reviews by course by id = ${course._id}`);
      }
    });
  }, [course]);

  return <CourseCard course={course} reviews={reviews} />
};
