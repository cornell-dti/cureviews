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
import { Class, Review } from "common";

enum PageStatus {
  Loading,
  Success,
  Error,
}

export default function ClassView() {
  const { number, subject, input } = useParams<any>();

  const [selectedClass, setSelectedClass] = useState<Class>();
  const [reviews, setReviews] = useState<Review[]>();
  const [pageStatus, setPageStatus] = useState<PageStatus>(PageStatus.Loading);

  /**
   * Arrow functions for sorting reviews
   */
  const sortByLikes = (a: Review, b: Review) => (b.likes || 0) - (a.likes || 0);
  const sortByDate = (a: Review, b: Review) =>
    !!b.date ? (!!a.date ? b.date.getTime() - a.date.getTime() : -1) : 1;

  useEffect(() => {
    /**
     * Fetches current course info and reviews and updates UI state
     */
    async function updateCurrentClass(number: number, subject: string) {
      const response = await axios.post(`/v2/getCourseByInfo`, {
        number,
        subject: subject.toLowerCase(), // TODO: fix backend to handle this
      });

      const course = response.data.result;
      if (course) {
        setSelectedClass(course);

        // after getting valid course info, fetch reviews
        const reviewsResponse = await axios.post("/v2/getReviewsByCourseId", {
          courseId: course._id,
        });
        const reviews = reviewsResponse.data.result;
        // convert date field of Review to JavaScript Date object
        reviews.map((r: Review) => (r.date = r.date && new Date(r.date)));
        reviews.sort(sortByLikes);
        setReviews(reviews);

        setPageStatus(PageStatus.Success);
      } else {
        setPageStatus(PageStatus.Error);
      }
    }
    updateCurrentClass(number, subject);
  }, [number, subject]);

  /**
   * Sorts reviews based on selected filter
   */
  function sortReviewsBy(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    const currentReviews = reviews && [...reviews];
    if (value === "helpful") {
      currentReviews?.sort(sortByLikes);
    } else if (value === "recent") {
      currentReviews?.sort(sortByDate);
    }
    setReviews(currentReviews);
  }

  /**
   * Attempts to report review, and filters out the reported review locally
   * @param reviewId - id of review to report
   */
  async function reportReview(reviewId: string) {
    const response = await axios.post("/v2/reportReview", { id: reviewId });
    const responseCode = response.data.result.resCode;
    if (responseCode === 1) {
      setReviews(reviews?.filter((element) => element._id !== reviewId));
    }
  }

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

  if (pageStatus === PageStatus.Success && !!selectedClass && !!reviews) {
    courseVisited(selectedClass?.classSub, selectedClass?.classNum);
    return (
      <div className={`${styles.classView}`}>
        <div className="row">
          <Navbar userInput={input} />
        </div>
        <div className={`row ${styles.content}`}>
          <div className={`col-xl-4 col-lg-5 ${styles.courseInfoColumn}`}>
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
            <div className={`d-lg-block d-none ${styles.reviewFormContainer}`}>
              <Form course={selectedClass} inUse={true} />
            </div>
          </div>
          <div className={`col-xl-8 col-lg-7 ${styles.courseReviewColumn}`}>
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
            <div className={styles.reviewsHeader}>
              <h2 className={styles.pastReviews}>
                Past Reviews ({reviews?.length})
              </h2>
              <div>
                <label className={styles.sortByLabel} htmlFor="sort-reviews-by">
                  Sort By:
                </label>
                <select
                  onChange={sortReviewsBy}
                  className={styles.sortBySelect}
                  id="sort-reviews-by"
                >
                  <option value="helpful">Most Helpful</option>
                  <option value="recent">Recent</option>
                </select>
              </div>
            </div>
            <div className={styles.courseReviews}>
              <CourseReviews reviews={reviews} onReportReview={reportReview} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TODO: create idle state, rethink how to handle this
  return <>Loading...</>;
}
