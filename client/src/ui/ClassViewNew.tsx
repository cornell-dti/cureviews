import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router";
import { courseVisited } from "./js/Feedback";
import Navbar from "./Navbar";
import styles from "./css/ClassView.module.css";
import { lastOfferedSems } from "common/CourseCard";
import Gauge from "./Gauge";
import CourseReviews from "./CourseReviews";
import Form from "./Form";

type ClassSchema = {
  _id: string; // overwritten _id field to play nice with our old db
  classSub: string; // subject, like "PHIL" or "CS"
  classNum: string; // course number, like 1110
  classTitle: string; // class title, like 'Introduction to Algorithms'
  classPrereq: string; // list of pre-req classes, a string of Classes _id.
  crossList: string; // list of classes that are crosslisted with this one, a string of Classes _id.
  classFull: string; // full class title to search by, formated as 'classSub classNum: classTitle'
  classSems: string; // list of semesters this class was offered, like ['FA17', 'FA16']
  classProfessors: string; // list of professors that have taught the course over past semesters
  classRating: number; // the average class rating from reviews
  classWorkload: number; // the average workload rating from reviews
  classDifficulty: number; // the average difficulty rating from reviews
};

enum PageStatus {
  Loading,
  Success,
  Error,
}

export default function ClassView() {
  const { number, subject, input } = useParams<any>();

  const [selectedClass, setSelectedClass] = useState<ClassSchema>();
  const [pageStatus, setPageStatus] = useState<PageStatus>(PageStatus.Loading);

  useEffect(() => {
    async function updateCurrentClass(number: number, subject: string) {
      const response = await axios.post(`/v2/getCourseByInfo`, {
        number,
        subject: subject.toLowerCase(), // TODO: fix backend to handle this
      });

      const course = response.data.result;
      if (course) {
        setSelectedClass(course);
        setPageStatus(PageStatus.Success);
      } else {
        setPageStatus(PageStatus.Error);
      }
    }
    updateCurrentClass(number, subject);
  }, [number, subject]);

  if (pageStatus === PageStatus.Error) {
    return (
      <div className={`row ${styles.errorContainer}`}>
        {/* TODO: no props on orig implementation */}
        <Navbar userInput={input} />
        <img
          className={styles.errorGauge}
          src="/error.svg"
          width="100vw"
          height="auto"
          alt="error"
        />
        <h2>Sorry, we couldn't find the class you're searching for.</h2>
        <h2>Please search for a different class.</h2>
      </div>
    );
  }

  if (pageStatus === PageStatus.Success && !!selectedClass) {
    courseVisited(selectedClass?.classSub, selectedClass?.classNum);
    return (
      <div className={`row ${styles.classView}`}>
        <Navbar userInput={input} />
        <div className={`${styles.content}`}>
          <div className={`col-lg-4 col-md-5 ${styles.courseInfoColumn}`}>
            <div>
              <h1 className={styles.courseTitle}>{selectedClass.classTitle}</h1>
              <p className={styles.courseSubtitle}>
                {selectedClass.classSub.toUpperCase() +
                  " " +
                  selectedClass.classNum +
                  ", " +
                  lastOfferedSems(selectedClass)}
              </p>
            </div>
            {/* TODO: show button for leaving a review on sm/xs screens */}
            <div
              className={`hidden-sm hidden-xs ${styles.reviewFormContainer}`}
            >
              <Form course={selectedClass} inUse={true} />
            </div>
          </div>
          <div className={`col-lg-8 col-md-7 ${styles.courseReviewColumn}`}>
            <div className={styles.gaugeContainer}>
              <div className={styles.gauge}>
                <Gauge rating={selectedClass!.classRating} label="Overall" />
              </div>
              <div className={styles.gauge}>
                <Gauge
                  rating={selectedClass.classDifficulty}
                  label="Difficulty"
                />
              </div>
              <div className={styles.gauge}>
                <Gauge rating={selectedClass.classWorkload} label="Workload" />
              </div>
            </div>
            <h2 className={styles.pastReviews}>Past Reviews</h2>
            <div className={styles.courseReviews}>
              <CourseReviews
                courseId={selectedClass._id}
                onScroll={undefined}
                transformGauges={undefined}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TODO: create idle state, rethink how to handle this
  return <>Loading...</>;
}
