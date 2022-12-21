import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router";
import Modal from "react-modal";
import { courseVisited } from "./js/Feedback";
import Navbar from "./Navbar";
import styles from "./css/ClassView.module.css";
import { lastOfferedSems } from "common/CourseCard";
import Gauge from "./Gauge";
import CourseReviews from "./CourseReviews";
import ReviewForm, { NewReview } from "./ReviewForm";
import { Class, Review } from "common";
import { Session } from "../session-store";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthOptionalLogin } from "../auth/auth_utils";

enum PageStatus {
  Loading,
  Success,
  Error,
}

export default function ClassView() {
  const { number, subject, input } = useParams<any>();

  const [selectedClass, setSelectedClass] = useState<Class>();
  const [courseReviews, setCourseReviews] = useState<Review[]>();
  const [pageStatus, setPageStatus] = useState<PageStatus>(PageStatus.Loading);
  const [isPastScrollThreshold, setIsPastScrollThreshold] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const [isLoggedIn, token, netId, signIn] = useAuthOptionalLogin();

  /**
   * Arrow functions for sorting reviews
   */
  const sortByLikes = (a: Review, b: Review) => (b.likes || 0) - (a.likes || 0);
  const sortByDate = (a: Review, b: Review) =>
    !!b.date ? (!!a.date ? b.date.getTime() - a.date.getTime() : -1) : 1;

  /**
   * Fetches current course info and reviews and updates UI state
   */
  useEffect(() => {
    const handleScroll = () => setIsPastScrollThreshold(window.scrollY >= 28);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /**
   * Fetches current course info and reviews and updates UI state
   */
  useEffect(() => {
    async function updateCurrentClass(number: number, subject: string) {
      try {
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
          setCourseReviews(reviews);

          setPageStatus(PageStatus.Success);
        } else {
          setPageStatus(PageStatus.Error);
        }
      } catch (e) {
        setPageStatus(PageStatus.Error);
      }
    }
    updateCurrentClass(number, subject);
  }, [number, subject]);

  /**
   * Checks if there is a review stored in Session (i.e. this redirected from
   * auth)
   */
  useEffect(() => {
    /**
     * Submit review and clear session storage
     */
    async function submitReview(review: NewReview, classId: string) {
      try {
        const response = await axios.post("/v2/insertReview", {
          token: token,
          review: review,
          classId: classId,
        });

        clearSessionReview();
        if (response.data.result.resCode === 1) {
          setIsReviewModalOpen(false);
          toast.success(
            "Thanks for reviewing! New reviews are updated every 24 hours.",
          );
        } else {
          toast.error("An error occurred, please try again.");
        }
      } catch (e) {
        clearSessionReview();
        toast.error("An error occurred, please try again.");
      }
    }

    const sessionReview = Session.get("review");
    const sessionCourseId = Session.get("courseId");
    if (
      sessionReview !== undefined &&
      sessionReview !== "" &&
      sessionCourseId !== undefined &&
      sessionCourseId !== "" &&
      isLoggedIn
    ) {
      submitReview(sessionReview, sessionCourseId);
    }
  }, [isLoggedIn, token]);

  /**
   * Sorts reviews based on selected filter
   */
  function sortReviewsBy(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    const currentReviews = courseReviews && [...courseReviews];
    if (value === "helpful") {
      currentReviews?.sort(sortByLikes);
    } else if (value === "recent") {
      currentReviews?.sort(sortByDate);
    }
    setCourseReviews(currentReviews);
  }

  /**
   * Attempts to report review, and filters out the reported review locally
   * @param reviewId - id of review to report
   */
  async function reportReview(reviewId: string) {
    try {
      const response = await axios.post("reportReview", { id: reviewId });
      const responseCode = response.data.result.resCode;
      if (responseCode === 1) {
        setCourseReviews(
          courseReviews?.filter((element) => element._id !== reviewId),
        );
      }
    } catch (e) {
      toast.error("Failed to report review.");
    }
  }

  /**
   * Open review modal
   */
  function onLeaveReview() {
    setIsReviewModalOpen(true);
  }

  /**
   * Save review information to session storage and begin redirect to auth
   */
  function onSubmitReview(review: NewReview) {
    Session.setPersistent({
      review: review,
    });
    Session.setPersistent({
      review_major: selectedClass?.classSub.toUpperCase(),
    });
    Session.setPersistent({ review_num: selectedClass?.classNum });
    Session.setPersistent({ courseId: selectedClass?._id });

    signIn("course");
  }

  /**
   * Clear review stored in session storage
   */
  function clearSessionReview() {
    Session.setPersistent({ review: "" });
    Session.setPersistent({ review_major: "" });
    Session.setPersistent({ review_num: "" });
    Session.setPersistent({ courseId: "" });
  }

  /**
   * Error page
   */
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

  /**
   * Successful render
   */
  if (pageStatus === PageStatus.Success && !!selectedClass && !!courseReviews) {
    courseVisited(selectedClass?.classSub, selectedClass?.classNum);
    return (
      <div className={`${styles.classView}`}>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />

        {/* review modal for mobile reviews */}
        <Modal
          isOpen={isReviewModalOpen}
          className={styles.reviewModal}
          overlayClassName={styles.modalOverlay}
        >
          <button
            type="button"
            className="close pull-left"
            aria-label="Close"
            onClick={() => {
              setIsReviewModalOpen(false);
              clearSessionReview();
            }}
          >
            <span aria-hidden="true">&times;</span>
          </button>
          <div className={styles.reviewModalForm}>
            <ReviewForm
              professors={selectedClass.classProfessors}
              onSubmitReview={onSubmitReview}
              actionButtonLabel="Submit review"
            />
          </div>
        </Modal>

        <div className="row d-none d-lg-block">
          <Navbar userInput={input} />
        </div>

        <div className={`row ${styles.content}`}>
          <div
            className={`col-xl-4 col-lg-5 col-12 ${styles.courseInfoColumn} ${
              isPastScrollThreshold && styles.courseInfoColumnShadow
            }`}
          >
            <h1 className={styles.courseTitle}>{selectedClass.classTitle}</h1>
            <p className={styles.courseSubtitle}>
              {selectedClass.classSub.toUpperCase() +
                " " +
                selectedClass.classNum +
                ", " +
                lastOfferedSems(selectedClass)}
            </p>
            <div
              className={`d-lg-none ${!isPastScrollThreshold && "d-none"} ${
                styles.ratingMobileBox
              }`}
            >
              <div>Overall {selectedClass!.classRating?.toFixed(1)}</div>
              <div>Difficulty {selectedClass!.classDifficulty?.toFixed(1)}</div>
              <div>Workload {selectedClass!.classWorkload?.toFixed(1)}</div>
            </div>
            {/* review form, only shown on larger screens */}
            <div className={`d-lg-block d-none ${styles.reviewFormContainer}`}>
              <ReviewForm
                professors={selectedClass.classProfessors}
                onSubmitReview={onSubmitReview}
                actionButtonLabel="Submit a review"
              />
            </div>
          </div>
          <div className={`col ${styles.courseReviewColumn}`}>
            <div
              className={`${isPastScrollThreshold && "d-none"} d-lg-flex ${
                styles.gaugeContainer
              }`}
            >
              <div className={styles.gauge}>
                <Gauge
                  rating={selectedClass!.classRating}
                  label="Overall"
                  isOverall={true}
                />
              </div>
              <div className={styles.gauge}>
                <Gauge
                  rating={selectedClass.classDifficulty}
                  label="Difficulty"
                  isOverall={false}
                />
              </div>
              <div className={styles.gauge}>
                <Gauge
                  rating={selectedClass.classWorkload}
                  label="Workload"
                  isOverall={false}
                />
              </div>
            </div>
            {/* leave a review button, only shown on smaller screens */}
            <button
              className={`btn d-lg-none ${isPastScrollThreshold && "d-none"} ${
                styles.startReviewButton
              }`}
              onClick={() => onLeaveReview()}
            >
              Leave a review
            </button>
            <div className={styles.reviewsHeader}>
              <h2 className={styles.pastReviews}>
                Past Reviews ({courseReviews?.length})
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
              <CourseReviews
                reviews={courseReviews}
                onReportReview={reportReview}
                isPreview={false}
                isProfile={false}
              />
              <div
                className={`d-lg-none ${!isPastScrollThreshold && "d-none"} ${
                  styles.fixedButtonContainer
                }`}
              >
                <button
                  className={`btn ${styles.startReviewButton}`}
                  onClick={() => onLeaveReview()}
                >
                  Leave a review
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TODO: create idle state, rethink how to handle this
  return <>Loading...</>;
}
