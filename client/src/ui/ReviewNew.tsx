import React, { Component } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { Session } from "../session-store";
import { Review as ReviewType } from "common";

import styles from "./css/ReviewNew.module.css";


type ReviewProps = {
    reviewId: string,
    review: ReviewType,
    reportHandler: (review: ReviewType) => void,
    isPreview: boolean,
    myReviewsPage: boolean,
    isPending: boolean,
}

export default function Review({
    review,
    reportHandler,
    isPreview,
    myReviewsPage,
    isPending,
}: ReviewProps) {

    function TitleAndProfessor() {

        var profString = "Professor: ";
        if (review.professors && review.professors.length > 0)
            profString += review.professors.join(", ");
        else profString += "N/A"

        if (!myReviewsPage) {
            return (
                <>
                    <p>
                    </p>
                    <p>

                    </p>
                </>
            )
        }
        else {
            return (
                <p>{profString}</p>
            )
        }
    }

    return (

        <div className={`${styles.reviewContainer}`}>
            {/* Flag */}
            {
                !isPreview &&
                <div className={`${styles.flagContainer}`}>
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
                <div className="col-md-4 col-lg-4 col-xl-3">
                    <div className={`${styles.ratingsContainer}`}>
                        <p className={`${styles.ratingElem}`}>
                            <span>Overall</span>
                            <span>{review.rating ? review.rating : "-"}</span>
                        </p>
                        <p className={`${styles.ratingElem}`}>
                            <span>Difficulty</span>
                            <span>{review.difficulty ? review.difficulty : "-"}</span>
                        </p>
                        <p className={`${styles.ratingElem}`}>
                            <span>Workload</span>
                            <span>{review.workload ? review.workload : "-"}</span>
                        </p>
                    </div>
                </div>

                {/* Title, professor, review */}
                <div className="col-md-8 col-lg-8 col-xl-9">
                    <div className={`${styles.contentContainer}`}>

                        {/* Title And Professor */}
                        <TitleAndProfessor></TitleAndProfessor>

                        {/* Review Text */}
                        <p>{review.text}</p>
                    </div>
                </div>
            </div>
        </div >
    )

}