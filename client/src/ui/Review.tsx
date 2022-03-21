import React, { useState, useEffect } from "react";
import axios from "axios";
import { Session } from "../session-store";
import ShowMoreText from "react-show-more-text";
import { Review as ReviewType } from "common";

import styles from "./css/Review.module.css";

// use review.visible for pending

type ReviewProps = {
    key: string,
    review: ReviewType,
    reportHandler: (review: ReviewType) => void,
    isPreview: boolean,
    isProfile: boolean,
}

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
    key,
    review,
    reportHandler,
    isPreview,
    isProfile
}: ReviewProps) {

    const [expanded, setExpanded] = useState<boolean>(false);
    const [height, setHeight] = useState<number>(isPreview ? 206 : 196);
    const [liked, setLiked] = useState<boolean>(false);

    const [courseTitle, setCourseTitle] = useState<string>("");
    const [courseSub, setCourseSub] = useState<string>("");
    const [courseNum, setCourseNum] = useState<string>("");

    const review_container_style = review.visible ? styles.reviewContainerStyle : styles.reviewContainerStylePending;
    const ratings_container_color = review.visible ? styles.ratingsContainerColor : "";

    function getDateString() {
        if (!review.date) return "";

        review.date = new Date(review.date);
        let review_year = String(review.date.getFullYear()).substring(2);
        let review_month = review.date.getMonth() + 1;
        let review_day = review.date.getDate();

        return review_month + "/" + review_day + "/" + review_year;
    }

    function executeOnClick() {
        if (!expanded) {
            let newHeight =
                height +
                ((review.text.length % 500) / 20) *
                (isPreview ? 4.25 : 10.25);
            setExpanded(!expanded);
            setHeight(newHeight);
        } else {
            setExpanded(!expanded)
            setHeight(isPreview ? 206 : 196);
        }
    }

    // for liking the review
    function increment() {
        if (liked) {
            axios.post("/v2/decrementLike", {
                id: review._id,
                token: Session.get("token")
            }).then((response) => {
                const res = response.data.result;
                if (res.resCode === 1) {
                    setLiked(false);
                    review.likes = review.likes ? review.likes - 1 : 0;
                } else {
                    console.log("Error while decrementing likes: " + res.error);
                }
            })
        }
        else {
            axios.post("/v2/incrementLike", {
                id: review._id,
                token: Session.get("token"),
            })
                .then((response) => {
                    const res = response.data.result;
                    if (res.resCode === 1) {
                        setLiked(true);
                        review.likes = review.likes ? review.likes + 1 : 1;
                    } else {
                        console.log("Error while incrementing likes: " + res.error);
                    }
                })
        }
    }

    /*
     * Fetch the course information.
     */
    useEffect(() => {
        async function updateCourse() {
            const response = await axios.post(`/v2/getCourseById`, { courseId: review.class });
            const course = response.data.result;

            setCourseTitle(course.classTitle);
            setCourseSub(course.classSub);
            setCourseNum(course.classNum);
        }

        if (isProfile) updateCourse();
    }, [review, isProfile]);

    function TitleAndProfessor() {
        var profString = "Professor: ";
        if (review.professors && review.professors.length > 0)
            profString += review.professors.join(", ");
        else profString += "N/A"

        if (isProfile) {
            return (
                <>
                    <h5 className={styles.courseTitle}>
                        {courseTitle}
                    </h5>
                    <p className={styles.courseCodeAndProf}>
                        {courseSub?.toUpperCase() + " " + courseNum?.toUpperCase() + " | " + profString}
                    </p>
                </>
            )
        }
        else {
            return (
                <p className={styles.professors}>{profString}</p>
            )
        }
    }

    return (
        <div className={styles.reviewContainer + " " + review_container_style}>
            {/* Flag */}
            {
                !isPreview &&
                <div className={styles.flagContainer}>
                    <button
                        onClick={() => {
                            reportHandler(review);
                            alert("This post has been reported and will be reviewed.");
                        }}
                    >
                        <img src="/report-flag.svg" alt="Report Review"></img>
                    </button>
                </div>
            }

            {/* Main Section */}
            <div className="row">

                {/* Ratings section. */}
                <div className="col-md-3 col-lg-4 col-xl-3">
                    <div className={styles.ratingsContainer + " " + ratings_container_color}>
                        <div className={styles.ratingElem}>
                            <span>Overall</span>
                            <span className={styles.ratingNum}>{review.rating ? review.rating : "-"}</span>
                        </div>
                        <div className={styles.ratingElem}>
                            <span>Difficulty</span>
                            <span className={styles.ratingNum}>{review.difficulty ? review.difficulty : "-"}</span>
                        </div>
                        <div className={styles.ratingElem}>
                            <span>Workload</span>
                            <span className={styles.ratingNum}>{review.workload ? review.workload : "-"}</span>
                        </div>
                    </div>
                </div>

                {/* Title, professor, review */}
                <div className="col-md-9 col-lg-8 col-xl-9">
                    <div className={styles.contentContainer}>
                        {/* Title And Professor */}
                        <TitleAndProfessor></TitleAndProfessor>

                    <div className = "grade-major-container">
                        <div>
                            <span className="grade-major-label">Grade: </span>
                                {review.selectedGrade && review.selectedGrade.length !== 0 ? (
                                <span className="grade-major-text">{review.selectedGrade}
                                </span>
                                ) : (
                                <span className="grade-major-text">N/A</span>
                                )}
                        </div>
                        <div>
                            <span className="grade-major-label">Major(s): </span>
                            {review.selectedMajors && review.selectedMajors.length !== 0 ? (
                            review.selectedMajors.map((major, index) => (
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
                                {review.text}
                            </ShowMoreText>
                        </p>

                        {/* Date, Like Button*/}
                        <div className="row">
                            <div className="col">
                                <p className={styles.date}>
                                    {getDateString()}
                                </p>
                            </div>

                            {/* Like Button */}
                            {!isPreview && (
                                <div className="col">
                                    <button
                                        className={liked === true ? "review-voted" : "review-upvote"}
                                        onClick={() => { increment(); }}
                                    >
                                        <img
                                            src={liked ? "/handClap_liked.svg" : "/handClap.svg"}
                                            alt={liked ? "Liked" : "Not Liked Yet"}
                                        />
                                        <p className={styles.upvoteText}>
                                            Helpful ({review.likes ? review.likes : 0})
                                        </p>
                                    </button >
                                </div>
                            )}
                        </div>

                        {review.isCovid && (
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
        </div >
    )

}