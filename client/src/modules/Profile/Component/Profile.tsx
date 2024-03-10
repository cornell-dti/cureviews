import React, { useEffect, useState } from 'react'
import { Redirect } from 'react-router-dom'

import axios from 'axios'

import { Review as ReviewType } from 'common'

import Navbar from '../../Globals/Navbar'
import Loading from '../../Globals/Loading'

import { UserInfo } from './UserInfo'
import { NoReviews } from './NoReviews'
import { PendingReviews } from './PendingReviews'

import { useAuthMandatoryLogin } from '../../../auth/auth_utils'
import { randomPicture } from '../../Globals/profile_picture'

import styles from '../Styles/Profile.module.css'
import { PastReviews } from './PastReviews'

const Profile = () => {
  const [loading, setLoading] = useState(true)
  const [hide, setHide] = useState(false)
  const [reviews, setReviews] = useState<ReviewType[]>([])
  const [pendingReviews, setPendingReviews] = useState<ReviewType[]>([])
  const [pastReviews, setPastReviews] = useState<ReviewType[]>([])

  const [reviewsTotal, setReviewsTotal] = useState('0')
  const [reviewsHelpful, setReviewsHelpful] = useState('0')

  const [isLoggedIn, token, netId, isAuthenticating, signOut] =
    useAuthMandatoryLogin('profile')

  const profilePicture: string = randomPicture(netId)

  /**
   * Retrieves the total reviews that a student has made
   */
  async function getReviewsTotal() {
    const response = await axios.post('/api/countReviewsByStudentId', {
      netId,
    })

    const res = response.data
    if (response.status === 200) {
      setReviewsTotal(res.result)
    }
  }

  /**
   * Retrieves the number of reviews that the student has made that have been upvoted
   */
  async function getReviewsHelpful() {
    const response = await axios.post('/api/getTotalLikesByStudentId', {
      netId,
    })

    const res = response.data
    if (response.status === 200) {
      setReviewsHelpful(res.result)
    }
  }

  /**
   * Arrow functions for sorting reviews
   */
  const sortByLikes = (a: ReviewType, b: ReviewType) =>
    (b.likes || 0) - (a.likes || 0)
  const sortByDate = (a: ReviewType, b: ReviewType) =>
    b.date instanceof Date && a.date instanceof Date
      ? b.date.getTime() - a.date.getTime()
      : -1

  useEffect(() => {
    if (token) {
      axios.post('/api/insertUser', { token })
    }
  }, [token])

  useEffect(() => {
    axios.post(`/api/getReviewsByStudentId`, { netId }).then((response) => {
      const reviews = response.data.result
      const pendingReviews = reviews.filter(function (review: ReviewType) {
        return review.visible === 0
      })
      const pastReviews = reviews.filter(function (review: ReviewType) {
        return review.visible === 1
      })

      reviews?.sort(sortByLikes)
      setReviews(reviews)
      setPendingReviews(pendingReviews)
      setPastReviews(pastReviews)
      setLoading(false)
    })
  }, [netId])

  useEffect(() => {
    const pendingReviews = reviews.filter(function (review: ReviewType) {
      return review.visible === 0
    })
    const pastReviews = reviews.filter(function (review: ReviewType) {
      return review.visible === 1
    })
    setReviews(reviews)
    setPendingReviews(pendingReviews)
    setPastReviews(pastReviews)
    setLoading(false)
  }, [reviews])

  function sortReviewsBy(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value
    const currentReviews = reviews && [...reviews]
    if (value === 'helpful') {
      currentReviews?.sort(sortByLikes)
    } else if (value === 'recent') {
      currentReviews?.sort(sortByDate)
    }
    setReviews(currentReviews)
  }

  getReviewsTotal()
  getReviewsHelpful()

  if (!loading && isLoggedIn) {
    return (
      <div className={styles.page}>
        <Navbar userInput="" />
        <div className={styles.container}>
          <div className={styles.usersection}>
            <UserInfo
              profilePicture={profilePicture}
              reviewsHelpful={reviewsHelpful}
              reviewsTotal={reviewsTotal}
              netId={netId}
              signOut={signOut}
            />
          </div>

          <div className={styles.reviewsection}>
            <div className={styles.bar}>
              <h2>My Reviews ({reviews?.length})</h2>
              <div>
                <label htmlFor="sort-reviews-by">Sort By:</label>
                <select
                  onChange={sortReviewsBy}
                  className={styles.filtertext}
                  id="sort-reviews-by"
                >
                  <option value="helpful">Most Helpful</option>
                  <option value="recent">Recent</option>
                </select>
              </div>
            </div>
            {reviews.length === 0 && <NoReviews />}
            {reviews.length > 0 && pendingReviews.length > 0 && (
              <>
                <PendingReviews
                  hide={hide}
                  setHide={setHide}
                  pendingReviews={pendingReviews}
                />
                <PastReviews pastReviews={pastReviews} />
              </>
            )}
            {reviews.length > 0 && pendingReviews.length === 0 && (
              <PastReviews pastReviews={pastReviews} />
            )}
          </div>
        </div>
      </div>
    )
  } else if (!loading && !token && !isAuthenticating) {
    return <Redirect to="/" />
  }

  return <Loading />
}

export { Profile }
