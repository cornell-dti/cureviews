import React, { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'

import { Review as ReviewType } from 'common'

import styles from '../Styles/Review.module.css'

import { getAuthToken, useAuthOptionalLogin } from '../../../auth/auth_utils'

// use review.visible for pending

type ReviewProps = {
  review: ReviewType
  reportHandler: (review: ReviewType) => void
  isPreview: boolean
  isProfile: boolean
}

/**
  Review Component.

  Simple styling component that renders a single review (an li element)
  to show in a ClassView. These reivews will include:
  - how long ago the reivew was added
  - all review content
  - report button
  - like button
*/
export default function ReviewCard({
  review,
  reportHandler,
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
    : ''

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
  function likeReview() {
    if (!isLoggedIn) {
      signIn('path:' + location.pathname)
    }

    setLiked((liked) => !liked)

    axios
      .post('/api/updateLiked', {
        id: _review._id,
        token: getAuthToken(),
      })
      .then((response) => {
        setReview(response.data.review)
      })
  }

  /*
   * Fetch the course information.
   */
  useEffect(() => {
    async function updateCourse() {
      const response = await axios.post(`/api/getCourseById`, {
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
      const response = await axios.post('/api/userHasLiked', {
        id: _review._id,
        token: getAuthToken(),
      })

      setLiked(response.data.hasLiked)
    }

    if (isLoggedIn) updateLiked()
  }, [_review, isLoggedIn])

  /** Shows course name as well if on profile page */
  function TitleAndProfessor() {
    // list of professors (name1, name2, ..)
    var professornames = 'Professor: '
    if (_review.professors && _review.professors.length > 0)
      professornames += _review.professors.join(', ')
    else professornames += 'N/A'

    if (isProfile) {
      return (
        <>
          <h5 className={styles.courseTitle}>{courseTitle}</h5>
          <p className={styles.courseCodeAndProf}>
            {courseSub?.toUpperCase() +
              ' ' +
              courseNum?.toUpperCase() +
              ' | ' +
              professornames}
          </p>
        </>
      )
    } else {
      return <div>{professornames}</div>
    }
  }

  const [expand, setExpand] = useState(false)
  const [seeMoreButton, setSeeMoreButton] = useState(false)

  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handleResize() {
      if (ref.current) {
        setSeeMoreButton(ref.current.scrollHeight !== ref.current.clientHeight)
      }
    }
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className={styles.card}>
      <div className={styles.metrics}>
        <div>
          <span className={styles.metrictext}>Overall</span>
          <span className={styles.bold}>
            {_review.rating ? _review.rating : '-'}
          </span>
        </div>
        <div>
          <span className={styles.metrictext}>Difficulty</span>
          <span className={styles.bold}>
            {_review.difficulty ? _review.difficulty : '-'}
          </span>
        </div>
        <div>
          <span className={styles.metrictext}>Workload</span>
          <span className={styles.bold}>
            {_review.workload ? _review.workload : '-'}
          </span>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.bold}> {TitleAndProfessor()} </div>
        <div className={styles.grademajor}>
          <div>
            Grade{' '}
            <span className={styles.bold}>
              {_review.grade && /^([^0-9]*)$/.test(_review.grade)
                ? _review.grade
                : 'N/A'}
            </span>
          </div>
          <div>
            Major{' '}
            <span className={styles.bold}>
              {_review.major && _review.major.length !== 0
                ? _review.major.map((major, index) => (
                    <>
                      {index > 0 && ', '} {major}
                    </>
                  ))
                : 'N/A'}
            </span>
          </div>
        </div>
        <div
          className={`${styles.reviewtext} ${!expand && styles.collapsedtext}`}
          ref={ref}
        >
          {_review.text}
        </div>
        {seeMoreButton && (
          <button
            className={styles.seemorebutton}
            onClick={() => setExpand(!expand)}
          >
            {expand ? 'See less' : '...See more'}
          </button>
        )}
        <div className={styles.datehelpful}>
          <div> {getDateString()} </div>
          {!isPreview && (
            <div
              className={`${styles.helpful} ${liked && styles.likedhelpful}`}
              onClick={likeReview}
            >
              <img
                src={liked ? '/handClap_liked.svg' : '/handClap.svg'}
                alt={liked ? 'Liked' : 'Not Liked Yet'}
              />
              {liked ? 'Liked!' : 'Helpful?'} (
              {_review.likes ? _review.likes : 0}){' '}
            </div>
          )}
        </div>
        {_review.isCovid && (
          <div className={styles.covid}>
            <span role="img" aria-label="alert"></span>
            My experience was affected by COVID-19.
          </div>
        )}
      </div>
    </div>
  )

  // return (
  //   <div className={styles.reviewContainer + ' ' + review_container_style}>
  //     {/* Flag */}
  //     {!isPreview && (
  //       <div className={styles.buttonContainer}>
  //         <div className={styles.flagContainer}>
  //           <button
  //             onClick={() => {
  //               reportHandler(_review)
  //               alert('This post has been reported and will be reviewed.')
  //             }}
  //           >
  //             <img src="/report-flag.svg" alt="report review button"></img>
  //           </button>
  //         </div>
  //         <div className={styles.pencilContainer}>
  //           <button
  //             onClick={() => {
  //               alert('Editing is currently not available, stay tuned!')
  //             }}
  //           >
  //             <img src="/pencil.svg" alt="edit review button"></img>
  //           </button>
  //         </div>
  //       </div>
  //     )}

  //     {/* Main Section */}
  //     <div className={`${styles.reviewMainSectionContainer}`}>
  //       {/* Ratings section. */}
  //       <div className={styles.ratingsSection}>
  //         <div
  //           className={styles.ratingsContainer + ' ' + ratings_container_color}
  //         >
  //           <div className={styles.ratingElem}>
  //             <span>Overall</span>
  //             <span className={styles.ratingNum}>
  //               {_review.rating ? _review.rating : '-'}
  //             </span>
  //           </div>
  //           <div className={styles.ratingElem}>
  //             <span>Difficulty</span>
  //             <span className={styles.ratingNum}>
  //               {_review.difficulty ? _review.difficulty : '-'}
  //             </span>
  //           </div>
  //           <div className={styles.ratingElem}>
  //             <span>Workload</span>
  //             <span className={styles.ratingNum}>
  //               {_review.workload ? _review.workload : '-'}
  //             </span>
  //           </div>
  //         </div>
  //       </div>

  //       {/* Title, professor, review */}
  //       <div className="">
  //         <div className={styles.contentContainer}>
  //           {/* Title And Professor */}
  //           <TitleAndProfessor></TitleAndProfessor>

  //           <div className={styles.gradeMajorContainer}>
  //             <div>
  //               <span>Grade: </span>
  //               {_review.grade &&
  //               _review.grade.length !== 0 &&
  //               /^([^0-9]*)$/.test(_review.grade) ? (
  //                 <span className={styles.gradeMajorText}>{_review.grade}</span>
  //               ) : (
  //                 <span className={styles.gradeMajorText}>N/A</span>
  //               )}
  //             </div>
  //             <div>
  //               <span>Major(s): </span>
  //               {_review.major && _review.major.length !== 0 ? (
  //                 _review.major.map((major, index) => (
  //                   <span className={styles.gradeMajorText} key={index}>
  //                     {index > 0 ? ', ' : ''}
  //                     {major}
  //                   </span>
  //                 ))
  //               ) : (
  //                 <span className={styles.gradeMajorText}>N/A</span>
  //               )}
  //             </div>
  //           </div>

  //           {/* Review Text */}
  //           <p className={styles.reviewText}>
  //             <ShowMoreText
  //               lines={3}
  //               more="Show more"
  //               less="Show less"
  //               anchorClass="showMoreText"
  //               onClick={executeOnClick}
  //               expanded={expanded}
  //             >
  //               {_review.text}
  //             </ShowMoreText>
  //           </p>

  //           {/* Date, Like Button*/}
  //           <div className="">
  //             <p className={styles.date}>{getDateString()}</p>

  //             {/* Like Button */}
  //             {!isPreview && (
  //               <div>
  //                 <button
  //                   className={
  //                     liked === true ? 'review-voted' : 'review-upvote'
  //                   }
  //                   onClick={() => {
  //                     increment()
  //                   }}
  //                 >
  //                   <img
  //                     src={liked ? '/handClap_liked.svg' : '/handClap.svg'}
  //                     alt={liked ? 'Liked' : 'Not Liked Yet'}
  //                   />

  //                   <p className={styles.upvoteText}>
  //                     Helpful ({_review.likes ? _review.likes : 0})
  //                   </p>
  //                 </button>
  //               </div>
  //             )}
  //           </div>

  //           {_review.isCovid && (
  //             <div className={styles.covidTag}>
  //               <span role="img" aria-label="alert"></span>
  //               This student's experience was affected by COVID-19
  //             </div>
  //           )}
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // )
}
