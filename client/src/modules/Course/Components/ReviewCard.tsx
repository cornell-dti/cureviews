import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import ShowMoreText from 'react-show-more-text'

import { Review as ReviewType } from 'common'

import Tag from './Tag'
import tag_names from '../../Globals/tag_names'
import styles from '../Styles/Review.module.css'

import { getAuthToken, useAuthOptionalLogin } from '../../../auth/auth_utils'

// use review.visible for pending

type ReviewProps = {
  review: ReviewType
  isPreview: boolean
  isProfile: boolean
}

/**
  Review Component.

  Simple styling component that renders a single review (an li element)
  to show in a ClassView. These reivews will include:
  - how long ago the review was added
  - all review content
  - report button
  - like button
*/
export default function ReviewCard({
  review,
  isPreview,
  isProfile,
}: ReviewProps): JSX.Element {
  const [isLoggedIn, token, netId, signIn, signOut] = useAuthOptionalLogin()
  const location = useLocation()

  const [_review, setReview] = useState<ReviewType>(review)
  const [expanded, setExpanded] = useState<boolean>(false)
  const [height, setHeight] = useState<number>(isPreview ? 206 : 196)
  const [liked, setLiked] = useState<boolean>(false)

  const [courseTitle, setCourseTitle] = useState<string>('')
  const [courseSub, setCourseSub] = useState<string>('')
  const [courseNum, setCourseNum] = useState<string>('')

  const review_container_style = _review.visible
    ? styles.reviewContainerStyle
    : styles.reviewContainerStylePending
  const ratings_container_color = _review.visible
    ? styles.ratingsContainerColor
    : styles.pendingRatingsContainerColor
  const rating_elem_style = _review.visible
    ? styles.ratingElem + ' ' + styles.ratingElemColor
    : styles.ratingElem

  const windowWidth: number = window.innerWidth

  function getDateString() {
    if (!_review.date) return ''

    const date = new Date(_review.date)
    let review_year = String(date.getFullYear()).substring(2)
    let review_month = date.getMonth() + 1
    let review_day = date.getDate()

    return review_month + '/' + review_day + '/' + review_year
  }

  function executeOnClick() {
    if (!expanded) {
      let newHeight =
        height + ((_review.text.length % 500) / 20) * (isPreview ? 4.25 : 10.25)
      setExpanded(!expanded)
      setHeight(newHeight)
    } else {
      setExpanded(!expanded)
      setHeight(isPreview ? 206 : 196)
    }
  }

  /**
   * Increment the likes on the review.
   */
  function increment() {
    if (!isLoggedIn) {
      signIn('path:' + location.pathname)
    }

    axios
      .post('/v2/updateLiked', {
        id: _review._id,
        token: getAuthToken(),
      })
      .then((response) => {
        setReview(response.data.result.review)
      })
  }

  /*
   * Fetch the course information.
   */
  useEffect(() => {
    async function updateCourse() {
      const response = await axios.post(`/v2/getCourseById`, {
        courseId: _review.class,
      })
      const course = response.data.result

      setCourseTitle(course.classTitle)
      setCourseSub(course.classSub)
      setCourseNum(course.classNum)
    }

    if (isProfile) updateCourse()
  }, [_review, isProfile])

  useEffect(() => {
    async function updateLiked() {
      const response = await axios.post('/v2/userHasLiked', {
        id: _review._id,
        token: getAuthToken(),
      })

      setLiked(response.data.result.hasLiked)
    }

    if (isLoggedIn) updateLiked()
  }, [_review, isLoggedIn])

  function TitleAndProfessor() {
    var profString = 'Professor: '
    if (_review.professors && _review.professors.length > 0)
      profString += _review.professors.join(', ')
    else profString += 'N/A'

    if (isProfile) {
      return (
        <>
          <h5
            className={
              _review.visible ? styles.courseTitle : styles.pendingCourseTitle
            }
          >
            {courseTitle}
          </h5>
          <p className={styles.courseCodeAndProf}>
            {courseSub?.toUpperCase() +
              ' ' +
              courseNum?.toUpperCase() +
              ' | ' +
              profString}
          </p>
        </>
      )
    } else {
      return <p className={styles.professors}>{profString}</p>
    }
  }

  return (
    <div className={styles.reviewContainer + ' ' + review_container_style}>
      {/* Flag */}
      {!isPreview && (
        <div className={styles.pencilContainer}>
          <button
            onClick={() => {
              alert('Editing is currently not available, stay tuned!')
            }}
          >
            <img src="/pencil.svg" alt="Edit Review"></img>
          </button>
        </div>
      )}

      {/* Main Section */}
      <div className="row">
        {/* Ratings section. */}
        <div className="col-md-3 col-lg-4 col-xl-3">
          <div
            className={styles.ratingsContainer + ' ' + ratings_container_color}
          >
            <div className={rating_elem_style}>
              <span>Overall{windowWidth <= 480 ? ':' : ''}</span>
              <span className={styles.ratingNum}>
                {_review.rating ? _review.rating : '-'}
              </span>
              {windowWidth <= 480 ? (
                <div
                  className={
                    review.visible
                      ? styles.divider + ' ' + styles.acceptedReviewDividerColor
                      : styles.divider
                  }
                ></div>
              ) : null}
            </div>
            <div className={rating_elem_style}>
              <span>Difficulty{windowWidth <= 480 ? ':' : ''}</span>
              <span className={styles.ratingNum}>
                {_review.difficulty ? _review.difficulty : '-'}
              </span>
              {windowWidth <= 480 ? (
                <div
                  className={
                    review.visible
                      ? styles.divider + ' ' + styles.acceptedReviewDividerColor
                      : styles.divider
                  }
                ></div>
              ) : null}
            </div>
            <div className={rating_elem_style}>
              <span>Workload{windowWidth <= 480 ? ':' : ''}</span>
              <span className={styles.ratingNum}>
                {_review.workload ? _review.workload : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Title, professor, review */}
        <div className="col-md-9 col-lg-8 col-xl-9">
          <div className={styles.contentContainer}>
            {/* Title And Professor */}
            <TitleAndProfessor></TitleAndProfessor>

            <div className={styles.gradeMajorContainer}>
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
                      {index > 0 ? ', ' : ''}
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

            <div className={styles.tagContainer}>
              {_review.tags?.map((tag) => (
                <Tag tagName={tag} />
              ))}
            </div>

            {/* Date, Like Button*/}
            <div className="row">
              <div className="col">
                <p className={styles.date}>{getDateString()}</p>
              </div>

              {/* Like Button */}
              {!isPreview && (
                <div className={styles.helpful}>
                  <button
                    className={
                      liked === true ? 'review-voted' : 'review-upvote'
                    }
                    onClick={() => {
                      increment()
                    }}
                  >
                    <img
                      src={liked ? '/handClap_liked.svg' : '/handClap.svg'}
                      alt={liked ? 'Liked' : 'Not Liked Yet'}
                      className={styles.handClap}
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
                  {' '}
                </span>
                This student's experience was affected by COVID-19
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
