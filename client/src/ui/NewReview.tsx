import React, { Component } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { Session } from "../session-store";

import "./css/NewReview.css";


type ReviewProps = {
    info: object,
    reportHandler: Function,
    isPreview: boolean,
    isPending: boolean,
    includeTitle: boolean,
}

export default function Review({
    info,
    reportHandler,
    isPreview,
    isPending,
    includeTitle
}: ReviewProps) {

    return (

        <div className="review-container">
            {/* Flag */}
            {
                !isPreview &&
                <div className="flag-container">
                    <button
                        onClick={() => {
                            reportHandler(info);
                            alert("This post has been reported and will be reviewed.");
                        }}
                    >
                        <img src="/report-flag.svg" alt="Report Review"></img>
                    </button>
                </div>
            }

            {/* Main Section */}
            <div>
                {/* Ratings section. */}
                <div>

                </div>

                {/* Title, professor, review */}
                <div>

                </div>
            </div>
        </div>
    )

}