import React, { useEffect, useState } from 'react'
import { Redirect } from 'react-router-dom'

import axios from 'axios'

import { Review } from 'common'

import { useAuthMandatoryLogin } from '../../../auth/auth_utils'

import UpdateReview from '../../Admin/Components/AdminReview'
import Stats from '../../Admin/Components/Stats'
import RaffleWinner from '../../Admin/Components/RaffleWinner'

/** Admin Page
 * Approve new reviews, see stats, and import new semester courses & Profs.
 */
export const AdminCosting = () => {
  const [minimumReviews, setMinimumReviews] = useState<number>(0)
  const [cost, setCost] = useState<number>(0)
  const [totalTokens, setTotalTokens] = useState<number>(0)
  const [unapprovedReviews, setUnapprovedReviews] = useState<Review[]>([])
  const [reportedReviews, setReportedReviews] = useState<Review[]>([])
  const [disableInit, setDisableInit] = useState<boolean>(false)
  const [disableNewSem, setDisableNewSem] = useState<boolean>(false)
  const [loadingInit, setLoadingInit] = useState<number>(0)
  const [loadingSemester, setLoadingSemester] = useState<number>(0)
  const [loadingProfs, setLoadingProfs] = useState<number>(0)
  const [resettingProfs, setResettingProfs] = useState<number>(0)
  const [addSemester, setAddSemester] = useState('')

  const { isLoggedIn, token, isAuthenticating } = useAuthMandatoryLogin('admin')
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function confirmAdmin() {
      const res = await axios.post(`/api/tokenIsAdmin`, {
        token: token,
      })

      if (res.data.result) {
        setIsAdmin(true)
      } else {
        setIsAdmin(false)
      }
      setLoading(false)
    }

    if (isLoggedIn) {
      confirmAdmin()
    }
  }, [isLoggedIn, token, isAuthenticating])

  useEffect(() => {
    axios
      .post('/api/fetchPendingReviews', { token: token })
      .then((response) => {
        const result = response.data.result
        if (response.status === 200) {
          setUnapprovedReviews(
            result.filter((review: Review) => review.reported === 0)
          )
          setReportedReviews(
            result.filter((review: Review) => review.reported === 1)
          )
        } else {
          console.log('Error at fetchPendingReviews')
        }
      })
  }, [token, isAuthenticating])

  // Helper function to remove a review from a list of reviews and
  // return the updated list
  function removeReviewFromList(reviewToRemove: Review, reviews: Review[]) {
    reviews = reviews.filter((review: Review) => {
      return review && review._id !== reviewToRemove._id
    })
    return reviews
  }

  // Call when user asks to approve a review. Accesses the Reviews database
  // and changes the review with this id to visible.
  function approveReview(review: Review) {
    axios
      .post('/api/makeReviewVisible', {
        review: review,
        token: token,
      })
      .then((response) => {
        if (response.status === 200) {
          const updatedUnapprovedReviews = removeReviewFromList(
            review,
            unapprovedReviews
          )
          setUnapprovedReviews(updatedUnapprovedReviews)
        }
      })
  }

  // Call when user asks to remove a review. Accesses the Reviews database
  // and deletes the review with this id.
  function removeReview(review: Review, isUnapproved: boolean) {
    axios
      .post('/api/removeReview', {
        review: review,
        token: token,
      })
      .then((response) => {
        if (response.status === 200) {
          console.log('Review removed')
          if (isUnapproved) {
            const updatedUnapprovedReviews = removeReviewFromList(
              review,
              unapprovedReviews
            )
            setUnapprovedReviews(updatedUnapprovedReviews)
          } else {
            const updatedReportedReviews = removeReviewFromList(
              review,
              reportedReviews
            )

            setReportedReviews(updatedReportedReviews)
          }
        }
      })
      .catch((e) => console.log(`Unable to remove review ${e}`))
  }

  // Call when user asks to un-report a reported review. Accesses the Reviews database
  // and changes the reported flag for this review to false.
  function unReportReview(review: Review) {
    axios
      .post('/api/undoReportReview', {
        review: review,
        token: token,
      })
      .then((response) => {
        if (response.status === 200) {
          console.log('Review unreported')
          const updatedReportedReviews = removeReviewFromList(
            review,
            reportedReviews
          )
          setReportedReviews(updatedReportedReviews)
        } else {
          console.log('Unable to undo report review!')
        }
      })
  }

  // Call when user selects "Add New Semester" button. Runs code to check the
  // course API for new classes and updates classes existing in the database.
  // sShould run once a semester, when new classes are added to the roster.
  function addNewSem(semester: string) {
    console.log('Adding new semester...')
    setDisableNewSem(true)
    setDisableInit(true)
    setLoadingSemester(1)

    axios
      .post('/api/addNewSemester', {
        semester,
        token: token,
      })
      .then((response) => {
        const result = response.data.result
        if (result === true) {
          console.log('New Semester Added')
          setDisableNewSem(false)
          setDisableInit(false)
          setLoadingSemester(2)
        } else {
          console.log('Unable to add new semester!')
        }
      })
  }

  function getCostingData(min: Number) {
    console.log('loading costing data...')

    axios
      .post('/ai/costing', {
        min: minimumReviews
      })
      .then((response) => {
        const result = response.data.result
        console.log('New Semester Added')
        setTotalTokens(result.tokens)
      })
  }

  function renderAdmin(token: string) {
    return (
      <div>
        <h1>GPT Costing Page</h1>
        <select
          value={minimumReviews}
          onChange={(e) => {
            const value = Number(e.target.value);
            setMinimumReviews(value);
            getCostingData(value);
          }}
        >
          <option value="">x</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="3">6</option>
          <option value="4">7</option>
          <option value="5">8</option>
          <option value="3">9</option>
          <option value="4">10</option>
        </select>
        <h1>Total tokens: {totalTokens}</h1>
      </div>
    )
  }

  function adminLogin() {
    if (loading) {
      return <div>Loading...</div>
    } else if (isLoggedIn && token && isAdmin) {
      return renderAdmin(token)
    } else {
      return <Redirect to="/" />
    }
  }

  return adminLogin()
}
