import React, { Component, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { Session } from "../session-store";
import ShowMoreText from "react-show-more-text";
import { Review as ReviewType } from "common";

import styles from "./css/ReviewNew.module.css";

// use review.visible for pending

type ReviewProps = {
    reviewId: string,
    review: ReviewType,
    reportHandler: (review: ReviewType) => void,
    isPreview: boolean,
    myReviewsPage: boolean,
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
    reviewId,
    review,
    reportHandler,
    isPreview,
    myReviewsPage,
}: ReviewProps) {

    const [expanded, setExpanded] = useState<boolean>(false);
    const [height, setHeight] = useState<number>(isPreview ? 206 : 196);

    const review_container_style = review.visible ? styles.reviewContainerStyle : styles.reviewContainerStylePending;

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

    function TitleAndProfessor() {

        var profString = "Professor: ";
        if (review.professors && review.professors.length > 0)
            profString += review.professors.join(", ");
        else profString += "N/A"

        if (myReviewsPage) {
            return (
                <>
                    <h5 className={styles.courseTitle}>
                        {"Course Title"}
                    </h5>
                    <p className={styles.courseCodeAndProf}>
                        {"Course Code | " + profString}
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
                    <div className={styles.ratingsContainer}>
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
                        <p className={styles.date}>
                            {getDateString()}
                        </p>
                    </div>
                </div>
            </div>
        </div >
    )

}