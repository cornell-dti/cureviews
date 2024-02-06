import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'

import axios from 'axios'
import Modal from 'react-modal'

import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { MdOutlineRateReview } from 'react-icons/md'

import { courseVisited } from './Feedback'
import Navbar from '../../Globals/Navbar'

import styles from '../Styles/Course.module.css'
import { lastOfferedSems } from 'common/CourseCard'

import Gauge from './Gauge'
import CourseReviews from './CourseReviews'
import ReviewForm, { NewReview } from './ReviewForm'

import { Class, Review } from 'common'
import { Session } from '../../../session-store'

import { useAuthOptionalLogin } from '../../../auth/auth_utils'

import ReviewModal from './ReviewModal'

enum PageStatus {
  Loading,
  Success,
  Error,
}

export const Course = () => {
  const { number, subject, input } = useParams<any>()

  const [selectedClass, setSelectedClass] = useState<Class>()
  const [courseReviews, setCourseReviews] = useState<Review[]>()
  const [pageStatus, setPageStatus] = useState<PageStatus>(PageStatus.Loading)
  const [scrolled, setScrolled] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)

  const [isLoggedIn, token, netId, signIn] = useAuthOptionalLogin()

  /**
   * Arrow functions for sorting reviews
   */
  const sortByLikes = (a: Review, b: Review) => (b.likes || 0) - (a.likes || 0)
  const sortByDate = (a: Review, b: Review) =>
    !!b.date ? (!!a.date ? b.date.getTime() - a.date.getTime() : -1) : 1

  /**
   * Update state to conditionally render sticky bottom-right review button
   */
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY >= 240)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  /**
   * Fetches current course info and reviews and updates UI state
   */
  useEffect(() => {
    async function updateCurrentClass(number: number, subject: string) {
      try {
        const response = await axios.post(`/api/getCourseByInfo`, {
          number,
          subject: subject.toLowerCase(), // TODO: fix backend to handle this
        })

        const course = response.data.result
        if (course) {
          setSelectedClass(course)

          // after getting valid course info, fetch reviews
          const reviewsResponse = await axios.post(
            '/api/getReviewsByCourseId',
            {
              courseId: course._id,
            }
          )
          const reviews = reviewsResponse.data.result
          // convert date field of Review to JavaScript Date object
          reviews.map((r: Review) => (r.date = r.date && new Date(r.date)))
          reviews.sort(sortByLikes)
          setCourseReviews(reviews)

          setPageStatus(PageStatus.Success)
        } else {
          setPageStatus(PageStatus.Error)
        }
      } catch (e) {
        setPageStatus(PageStatus.Error)
      }
    }
    updateCurrentClass(number, subject)
  }, [number, subject])

  /**
   * Checks if there is a review stored in Session (i.e. this redirected from
   * auth)
   */
  useEffect(() => {
    /**
     * Submit review and clear session storage
     */
    async function submitReview(review: NewReview, courseId: string) {
      try {
        const response = await axios.post('/api/insertReview', {
          token: token,
          review: review,
          courseId: courseId,
        })

        clearSessionReview()
        if (response.status === 200) {
          setIsReviewModalOpen(false)
          toast.success(
            'Thanks for reviewing! New reviews are updated every 24 hours.'
          )
        } else {
          toast.error('An error occurred, please try again.')
        }
      } catch (e) {
        clearSessionReview()
        toast.error('An error occurred, please try again.')
      }
    }

    const sessionReview = Session.get('review')
    const sessionCourseId = Session.get('courseId')
    if (
      sessionReview !== undefined &&
      sessionReview !== '' &&
      sessionCourseId !== undefined &&
      sessionCourseId !== '' &&
      isLoggedIn
    ) {
      submitReview(sessionReview, sessionCourseId)
    }
  }, [isLoggedIn, token])

  /**
   * Sorts reviews based on selected filter
   */
  function sortReviewsBy(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value
    const currentReviews = courseReviews && [...courseReviews]
    if (value === 'helpful') {
      currentReviews?.sort(sortByLikes)
    } else if (value === 'recent') {
      currentReviews?.sort(sortByDate)
    }
    setCourseReviews(currentReviews)
  }

  /**
   * Attempts to report review, and filters out the reported review locally
   * @param reviewId - id of review to report
   */
  async function reportReview(reviewId: string) {
    try {
      const response = await axios.post('/api/reportReview', { id: reviewId })
      if (response.status === 200) {
        setCourseReviews(
          courseReviews?.filter((element) => element._id !== reviewId)
        )
      }
    } catch (e) {
      toast.error('Failed to report review.')
    }
  }

  /**
   * Open review modal
   */
  function onLeaveReview() {
    setIsReviewModalOpen(true)
  }

  /**
   * Save review information to session storage and begin redirect to auth
   */
  function onSubmitReview(review: NewReview) {
    Session.setPersistent({
      review: review,
    })
    Session.setPersistent({
      review_major: selectedClass?.classSub.toUpperCase(),
    })
    Session.setPersistent({ review_num: selectedClass?.classNum })
    Session.setPersistent({ courseId: selectedClass?._id })

    signIn('course')
  }

  /**
   * Clear review stored in session storage
   */
  function clearSessionReview() {
    Session.setPersistent({ review: '' })
    Session.setPersistent({ review_major: '' })
    Session.setPersistent({ review_num: '' })
    Session.setPersistent({ courseId: '' })
  }

  /** Modal Open and Close Logic */
  const [open, setOpen] = useState<boolean>(false)
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
            If you think we made a mistake, please contact @cureviews.dti on
            instagram.
          </div>
        </div>
      </div>
    )
  }

  /**
   * Successful render =>
   */
  if (pageStatus === PageStatus.Success && !!selectedClass && !!courseReviews) {
    courseVisited(selectedClass?.classSub, selectedClass?.classNum)
    return (
      <div className={`${styles.page}`}>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
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
              setIsReviewModalOpen(false)
              clearSessionReview()
            }}
          >
            <span aria-hidden="true">&times;</span>
          </button>
          <div>
            <ReviewForm
              professors={selectedClass.classProfessors}
              onSubmitReview={onSubmitReview}
              actionButtonLabel="Submit Review"
            />
          </div>
        </Modal>

        <Navbar userInput={input} />

        {/* Course Name, Button + Gauges */}
        <div className={styles.overview}>
          <div className={styles.classinfo}>
            <h1
              data-cy={`course-title-${selectedClass.classSub.toLowerCase()}-${
                selectedClass.classNum
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

          <div className={styles.gauges}>
            <Gauge
              rating={selectedClass.classRating}
              label="Overall"
              isOverall={true}
            />
            <Gauge
              rating={selectedClass.classDifficulty}
              label="Difficulty"
              isOverall={false}
            />
            <Gauge
              rating={selectedClass.classWorkload}
              label="Workload"
              isOverall={false}
            />
          </div>
        </div>

        {/* Reviews Displaying */}
        <div className={styles.reviewscontainer}>
          <div className={styles.bar}>
            <h2>Past Reviews ({courseReviews?.length}) </h2>
            <div>
              <label htmlFor="sort-reviews">Sort by:</label>
              <select
                name="sort-reviews"
                id="sort-reviews"
                onChange={sortReviewsBy}
                className={styles.filtertext}
              >
                <option value="helpful">Most Helpful</option>
                <option value="recent">Recent</option>
              </select>
            </div>
          </div>
          <div className={styles.reviews}>
            <CourseReviews
              reviews={courseReviews}
              onReportReview={reportReview}
              isPreview={false}
              isProfile={false}
            />
          </div>
        </div>

        {/* Fixed Bottom-Right Review Button */}
        <button
          className={`${!scrolled && styles.hide} ${styles.fixedreviewbutton}`}
          onClick={() => setOpen(true)}
        >
          <MdOutlineRateReview size={30} />
        </button>

        <ReviewModal
          open={open}
          setOpen={setOpen}
          professorOptions={
            selectedClass.classProfessors ? selectedClass.classProfessors : []
          }
        />
      </div>
    )
  }

  // TODO: create idle state, rethink how to handle this
  return <>Loading...</>
}
