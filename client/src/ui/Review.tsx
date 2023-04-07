import React, { useState, useEffect } from "react";
import axios from "axios";
import ShowMoreText from "react-show-more-text";
import { Review as ReviewType } from "common";

import styles from "./css/Review.module.css";
import { getAuthToken, useAuthOptionalLogin } from "../auth/auth_utils";
import { useLocation } from "react-router-dom";

// use review.visible for pending

type ReviewProps = {
  review: ReviewType;
  reportHandler: (review: ReviewType) => void;
  isPreview: boolean;
  isProfile: boolean;
};

/*
  Review Component.

  Simple styling component that renders a single review (an li element)
  to show in a ClassView. These reivews will include:
   - how long ago the reivew was added
   - all review content
   - report button
   - like button
*/
export default function Review({
  review,
  reportHandler,
  isPreview,
  isProfile,
}: ReviewProps) {
  const [isLoggedIn, token, netId, signIn, signOut] = useAuthOptionalLogin();
  const location = useLocation();

  const [_review, setReview] = useState<ReviewType>(review);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [height, setHeight] = useState<number>(isPreview ? 206 : 196);
  const [liked, setLiked] = useState<boolean>(false);

  const [courseTitle, setCourseTitle] = useState<string>("");
  const [courseSub, setCourseSub] = useState<string>("");
  const [courseNum, setCourseNum] = useState<string>("");

  const review_container_style = _review.visible
    ? styles.reviewContainerStyle
    : styles.reviewContainerStylePending;
  const ratings_container_color = _review.visible
    ? styles.ratingsContainerColor
    : "";

  function getDateString() {
    if (!_review.date) return "";

    const date = new Date(_review.date);
    let review_year = String(date.getFullYear()).substring(2);
    let review_month = date.getMonth() + 1;
    let review_day = date.getDate();

    return review_month + "/" + review_day + "/" + review_year;
  }

  function executeOnClick() {
    if (!expanded) {
      let newHeight =
        height +
        ((_review.text.length % 500) / 20) * (isPreview ? 4.25 : 10.25);
      setExpanded(!expanded);
      setHeight(newHeight);
    } else {
      setExpanded(!expanded);
      setHeight(isPreview ? 206 : 196);
    }
  }

  /**
   * Increment the likes on the review.
   */
  function increment() {
    if (!isLoggedIn) {
      signIn("path:" + location.pathname);
    }

    axios
      .post("/v2/updateLiked", {
        id: _review._id,
        token: getAuthToken(),
      })
      .then((response) => {
        setReview(response.data.result.review);
      });
  }

  /*
   * Fetch the course information.
   */
  useEffect(() => {
    async function updateCourse() {
      const response = await axios.post(`/v2/getCourseById`, {
        courseId: _review.class,
      });
      const course = response.data.result;

      setCourseTitle(course.classTitle);
      setCourseSub(course.classSub);
      setCourseNum(course.classNum);
    }

    if (isProfile) updateCourse();
  }, [_review, isProfile]);

  useEffect(() => {
    async function updateLiked() {
      const response = await axios.post("/v2/userHasLiked", {
        id: _review._id,
        token: getAuthToken(),
      });

      setLiked(response.data.result.hasLiked);
    }

    if (isLoggedIn) updateLiked();
  }, [_review]);

  function TitleAndProfessor() {
    var profString = "Professor: ";
    if (_review.professors && _review.professors.length > 0)
      profString += _review.professors.join(", ");
    else profString += "N/A";

    if (isProfile) {
      return (
        <>
          <h5 className={styles.courseTitle}>{courseTitle}</h5>
          <p className={styles.courseCodeAndProf}>
            {courseSub?.toUpperCase() +
              " " +
              courseNum?.toUpperCase() +
              " | " +
              profString}
          </p>
        </>
      );
    } else {
      return <p className={styles.professors}>{profString}</p>;
    }
  }

  return (
    <div className={styles.reviewContainer + " " + review_container_style}>
      {/* Flag */}
      {!isPreview && (
        <div className={styles.flagContainer}>
          <button
            onClick={() => {
              reportHandler(_review);
              alert("This post has been reported and will be reviewed.");
            }}
          >
            <img src="/report-flag.svg" alt="Report Review"></img>
          </button>
        </div>
      )}

      {/* Main Section */}
      <div className="row">
        {/* Ratings section. */}
        <div className="col-md-3 col-lg-4 col-xl-3">
          <div
            className={styles.ratingsContainer + " " + ratings_container_color}
          >
            <div className={styles.ratingElem}>
              <span>Overall</span>
              <span className={styles.ratingNum}>
                {_review.rating ? _review.rating : "-"}
              </span>
            </div>
            <div className={styles.ratingElem}>
              <span>Difficulty</span>
              <span className={styles.ratingNum}>
                {_review.difficulty ? _review.difficulty : "-"}
              </span>
            </div>
            <div className={styles.ratingElem}>
              <span>Workload</span>
              <span className={styles.ratingNum}>
                {_review.workload ? _review.workload : "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Title, professor, review */}
        <div className="col-md-9 col-lg-8 col-xl-9">
          <div className={styles.contentContainer}>
            {/* Title And Professor */}
            <TitleAndProfessor></TitleAndProfessor>

            <div className="grade-major-container">
              <div>
                <span className="grade-major-label">Grade: </span>
                {_review.grade &&
                _review.grade.length !== 0 &&
                /^([^0-9]*)$/.test(_review.grade) ? (
                  <span className="grade-major-text">{_review.grade}</span>
                ) : (
                  <span className="grade-major-text">N/A</span>
                )}
              </div>
              <div>
                <span className="grade-major-label">Major(s): </span>
                {_review.major && _review.major.length !== 0 ? (
                  _review.major.map((major, index) => (
                    <span className="grade-major-text" key={index}>
                      {index > 0 ? ", " : ""}
                      {major}
                    </span>
                  ))
                ) : (
                  <span className="grade-major-text">N/A</span>
                )}
              </div>
            </div>

            {/* Review Text */}
            <p className={styles.reviewText}>
              <ShowMoreText
                lines={3}
                more="Show more"
                less="Show less"
                anchorClass="showMoreText"
                onClick={executeOnClick}
                expanded={expanded}
              >
                {_review.text}
              </ShowMoreText>
            </p>

            {/* Date, Like Button*/}
            <div className="row">
              <div className="col">
                <p className={styles.date}>{getDateString()}</p>
              </div>

              {/* Like Button */}
              {!isPreview && (
                <div className="col">
                  <button
                    className={
                      liked === true ? "review-voted" : "review-upvote"
                    }
                    onClick={() => {
                      increment();
                    }}
                  >
                    <img
                      src={liked ? "/handClap_liked.svg" : "/handClap.svg"}
                      alt={liked ? "Liked" : "Not Liked Yet"}
                    />
                    <p className={styles.upvoteText}>
                      Helpful ({_review.likes ? _review.likes : 0})
                    </p>
                  </button>
                </div>
              )}
            </div>

            {_review.isCovid && (
              <div className={`${styles.covidTag} row`}>
                <span role="img" aria-label="alert">
                  {" "}
                </span>
                This student's experience was affected by COVID-19
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
