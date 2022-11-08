import axios from "axios";
import React, { useState } from "react";
import { Review as ReviewType } from "common";
import { useAuthMandatoryLogin } from "../auth/auth_utils";
import { Redirect } from "react-router";
import Navbar from "./Navbar";
import styles from "./css/ProfileMobile.module.css";




export default function ProfileMobile(imgSrc: any) {
    const [hide, setHide] = useState(false);
    const [reviews, setReviews] = useState<ReviewType[]>([]);
    const [pendingReviews, setPendingReviews] = useState<ReviewType[]>([]);
    const [pastReviews, setPastReviews] = useState<ReviewType[]>([]);

    const [reviewsTotal, setReviewsTotal] = useState("");
    const [reviewsHelpful, setReviewsHelpful] = useState("");
    const [verifiedEmail, setVerifiedEmail] = useState("");

    const [netId, setNetId] = useState("");

    const [isLoggedIn, token, isAuthenticating, signOut] =
        useAuthMandatoryLogin("profile");

    async function getVerifiedEmail() {
        await axios
            .post("/v2/getStudentEmailByToken", {
                token: token,
            })
            .then((response) => {
                const res = response.data.result;
                if (res.code === 200) {
                    console.log(res.message);
                    setVerifiedEmail(res.message);
                }

                setNetId(verifiedEmail.substring(0, verifiedEmail.lastIndexOf("@")));
            })
            .catch((e) => console.log(e.response));
    }
    async function getReviewsTotal() {
        const response = await axios.post(
            "/v2/countReviewsByStudentId",
            {
                netId,
            },
        );

        const res = response.data.result;
        if (res.code === 200) {
            setReviewsTotal(res.message);
        }
    }

    async function getReviewsHelpful() {
        const response = await axios.post(
            "/v2/getTotalLikesByStudentId",
            {
                netId,
            },
        );

        const res = response.data.result;
        if (res.code === 200) {
            setReviewsHelpful(res.message);
        }
    }

    if (isLoggedIn) {
        return (
            <div className={`row ${styles.fullScreen}`}>
                <Navbar userInput="" />
            </div>
        );
    } else if (isAuthenticating) {
        return <>Loading...</>;
    } else {
        return <Redirect to="/" />;
    }


}