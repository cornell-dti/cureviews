import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import axios from 'axios';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WriteReviewIcon from '../../../assets/icons/write.svg';

import { courseVisited } from './Feedback';
import Navbar from '../../Globals/Navbar';
import Loading from '../../Globals/Loading';

import styles from '../Styles/Course.module.css';
import { lastOfferedSems } from 'common/CourseCard';

import Gauges from './Gauges';
import CornelliansSay from './CornelliansSay';
import CourseReviews from './CourseReviews';
import SimilarCoursesSection from './SimilarCourses';

import type { NewReview } from '../../../types';

import { Class, Recommendation, Review } from 'common';
import { Session } from '../../../session-store';

import { useAuthOptionalLogin } from '../../../auth/auth_utils';

import ReviewModal from './ReviewModal';

enum PageStatus {
  Loading,
  Success,
  Error
}

export const Course = () => {
  const { number, subject, input } = useParams<any>();

  const [selectedClass, setSelectedClass] = useState<Class>();
  const [courseReviews, setCourseReviews] = useState<Review[]>();
  const [similarCourses, setSimilarCourses] = useState<Recommendation[]>();
  const [pageStatus, setPageStatus] = useState<PageStatus>(PageStatus.Loading);
  const [scrolled, setScrolled] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  const { token } = useAuthOptionalLogin();

  /**
   * Sorts reviews based on descending likes.
   */
  const sortByLikes = (a: Review, b: Review) =>
    (b.likes || 0) - (a.likes || 0);

  /**
   * Sorts reviews based on descending date.
   */
  const sortByDate = (a: Review, b: Review) =>
    b.date instanceof Date && a.date instanceof Date
      ? b.date.getTime() - a.date.getTime()
      : -1;

  /**
   * Sorts reviews based on ascending alphabetical order of professor name.
   */
  const sortByProf = (a: Review, b: Review) => {
    let valA = 'Not Listed';
    let valB = 'Not Listed';

    if (a.professors) {
      const profsA = a.professors.filter((prof: String) =>
        prof && prof !== 'Not Listed');
      valA = profsA.length > 0
        ? profsA.sort()[0]
        : 'Not Listed';
    } else {
      return 1;
    }
    if (b.professors) {
      const profsB = b.professors.filter((prof: String) =>
        prof && prof !== 'Not Listed');
      valB = profsB.length > 0
        ? profsB.sort()[0]
        : 'Not Listed';
    } else {
      return 1;
    }

    if (valA === 'Not Listed') {
      return 1;
    } else if (valB === 'Not Listed') {
      return -1;
    }

    if (valA < valB) {
      return -1;
    } else if (valB < valA) {
      return 1;
    }

    return 0;
  }

  /**
   * Update state to conditionally render sticky bottom-right review button
   */
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY >= 240);
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * Update screen width to conditionally render left/right panels
   */
  useEffect(() => {
    function handleResize() {
      setScreenWidth(window.innerWidth);
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  })

  /**
   * Fetches current course info and reviews and updates UI state
   */
  useEffect(() => {
    async function updateCurrentClass() {
      try {
        const response = await axios.post(`/api/courses/get-by-info`, {
          number,
          subject: subject
        });

        const course = response.data.result;
        if (course) {
          setSelectedClass(course);

          // After getting valid course info, fetch reviews
          const reviewsResponse = await axios.post('/api/courses/get-reviews', {
            courseId: course._id
          });
          const reviews = reviewsResponse.data.result;
          // Convert date field of Review to JavaScript Date object
          reviews.map((r: Review) => (r.date = r.date && new Date(r.date)));
          reviews.sort(sortByLikes);
          setCourseReviews(reviews);

          const recommendations = course.recommendations;
          setSimilarCourses(recommendations);

          setPageStatus(PageStatus.Success);
        } else {
          setPageStatus(PageStatus.Error);
        }
      } catch (e) {
        setPageStatus(PageStatus.Error);
      }
    }
    updateCurrentClass();
  }, [number, subject]);

  /**
   * Sorts reviews based on selected filter
   */
  function sortReviewsBy(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    if (value === 'helpful') {
      setCourseReviews([...courseReviews].sort(sortByLikes));
    } else if (value === 'recent') {
      setCourseReviews([...courseReviews].sort(sortByDate));
    } else if (value === 'professor') {
      setCourseReviews([...courseReviews].sort(sortByProf));
    }
  }

  /**
   * Save review information to session storage and begin redirect to auth
   */
  function onSubmitReview(review: NewReview) {
    Session.setPersistent({
      review: review
    });
    Session.setPersistent({
      review_major: selectedClass?.classSub.toUpperCase()
    });
    Session.setPersistent({ review_num: selectedClass?.classNum });
    Session.setPersistent({ courseId: selectedClass?._id });
  }

  /** Modal Open and Close Logic */
  const [open, setOpen] = useState<boolean>(false);
  /**
   * Error page
   */
  if (pageStatus === PageStatus.Error) {
    return (
      <div>
        <Navbar userInput={input} />
        <div className={styles.error}>
          <img className={styles.errorgauge} src="/error.svg" alt="error" />
          <h1> Uh oh. </h1>
          <h2> Sorry, looks like this course does not exist. </h2>
          <h2> Try searching for another course! </h2>
          <div>
            If you think we made a mistake, please contact @cureviews on
            instagram.
          </div>
        </div>
      </div>
    );
  }

  /**
   * Successful render =>
   */
  if (pageStatus === PageStatus.Success && !!selectedClass && !!courseReviews) {
    courseVisited(selectedClass?.classSub, selectedClass?.classNum);
    return (
      <div className={styles.page}>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />

        <Navbar userInput={input} />
        <div className={styles.courseContent}>
          {/* Course Name, Button + Gauges */}
          <div className={styles.leftPanel}>
            <div className={styles.classinfo}>
              <h1
                data-cy={`course-title-${selectedClass.classSub.toLowerCase()}-${selectedClass.classNum
                  }`}
              >
                {selectedClass.classTitle}
              </h1>
              <div className={styles.subtitle}>
                {selectedClass.classSub.toUpperCase() +
                  ' ' +
                  selectedClass.classNum +
                  ', ' +
                  lastOfferedSems(selectedClass)}
              </div>
              <button
                data-cy="leave-review-button"
                className={styles.reviewbutton}
                onClick={() => setOpen(true)}
              >
                Leave a review
              </button>
            </div>
            < Gauges
              overall={selectedClass.classRating}
              difficulty={selectedClass.classDifficulty}
              workload={selectedClass.classWorkload}
            />
            {/* Check if course has a classSummary */}
            {selectedClass?.classSummary && selectedClass?.summaryTags && (
              <CornelliansSay
                classSummary={selectedClass.classSummary}
                summaryTags={
                  selectedClass.summaryTags instanceof Map
                    ? selectedClass.summaryTags
                    : new Map(Object.entries(selectedClass.summaryTags))
                }
              />
            )}
            <SimilarCoursesSection
              similarCourses={similarCourses}
              isVisible={screenWidth > 768}
            />
            {/* <div>
              
            </div> */}
          </div>
          <div className={styles.rightPanel}>
            {/* Reviews Displaying */}
            <div className={styles.reviewscontainer}>
              <div className={styles.bar}>
                <h2 className={styles.title}>Past Reviews ({courseReviews?.length}) </h2>
                <div>
                  <label htmlFor="sort-reviews">Sort by: </label>
                  <select
                    name="sort-reviews"
                    id="sort-reviews"
                    onChange={sortReviewsBy}
                    className={styles.filtertext}
                  >
                    <option value="helpful">Most Helpful</option>
                    <option value="recent">Recent</option>
                    <option value="professor">Professor</option>
                  </select>
                </div>
              </div>
              <div className={styles.reviews}>
                <CourseReviews
                  reviews={courseReviews}
                  isPreview={false}
                  isProfile={false}
                  token={token}
                />
              </div>
            </div >
            <SimilarCoursesSection
              similarCourses={similarCourses}
              isVisible={screenWidth <= 768}
            />
          </div >
        </div >

        {/* Fixed Bottom-Right Review Button */}
        < button
          className={`${!scrolled && styles.hide} ${styles.fixedreviewbutton} `}
          onClick={() => setOpen(true)}
        >
          <img src={WriteReviewIcon} alt="write-new-review" />
        </button >

        <ReviewModal
          open={open}
          setReviewOpen={setOpen}
          submitReview={onSubmitReview}
          professorOptions={
            selectedClass.classProfessors ? selectedClass.classProfessors : []
          }
          semsOffered={
            selectedClass.classSems ? selectedClass.classSems : []
          }
        />
      </div >
    );
  }

  return <Loading />;
};
