import React, { useEffect, useState } from 'react'
import { Redirect } from 'react-router-dom'

import axios from 'axios'

import { Review } from 'common'

import { useAuthMandatoryLogin } from '../../../auth/auth_utils'

import UpdateReview from './AdminReview'
import Stats from './Stats'
import RaffleWinner from './RaffleWinner'
import Loading from '../../Globals/Loading'

/** Admin Page
 * Approve new reviews, see stats, and import new semester courses & Profs.
 */
export const Admin = () => {
  const [unapprovedReviews, setUnapprovedReviews] = useState<Review[]>([])
  const [reportedReviews, setReportedReviews] = useState<Review[]>([])
  const [disableInit, setDisableInit] = useState<boolean>(false)
  const [disableNewSem, setDisableNewSem] = useState<boolean>(false)
  const [doubleClick, setDoubleClick] = useState<boolean>(false)
  const [loadingInit, setLoadingInit] = useState<number>(0)
  const [loadingSemester, setLoadingSemester] = useState<number>(0)
  const [loadingProfs, setLoadingProfs] = useState<number>(0)
  const [resettingProfs, setResettingProfs] = useState<number>(0)
  const [addSemester, setAddSemester] = useState('')

  const {isLoggedIn, token, isAuthenticating} = useAuthMandatoryLogin('admin')
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

  // Call when user selects "Initialize Database" button. Scrapes the Cornell
  // Course API to store all classes and subjects in the local database.
  // Then, runs code to store id's of cross-listed classes against each class.
  // Should only be run ONCE when the app is initialzied.
  //
  // NOTE: requries an initialize flag to ensure the function is only run on
  // a button click without this, it will run every time this component is created.
  function addAllCourses() {
    console.log('Initializing database')

    setDisableInit(true)
    setLoadingInit(1)

    axios.post('/api/dbInit', { token: token }).then((response) => {
      if (response.status === 200) {
        setDisableInit(false)
        setLoadingInit(2)
      } else {
        console.log('Error at dbInit')
      }
    })
  }

  function updateProfessors() {
    console.log('Updating professors')
    setDisableInit(true)
    setLoadingProfs(1)

    axios.post('/api/setProfessors', { token: token }).then((response) => {
      if (response.status === 200) {
        console.log('Updated the professors')
        setDisableInit(false)
        setLoadingProfs(2)
      } else {
        console.log('Error at setProfessors')
      }
    })
  }

  function resetProfessors() {
    console.log('Setting the professors to an empty array')
    setDisableInit(true)
    setResettingProfs(1)

    axios.post('/api/resetProfessors', { token: token }).then((response) => {
      if (response.status === 200) {
        console.log('Reset all the professors to empty arrays')
        setDisableInit(false)
        setResettingProfs(2)
      } else {
        console.log('Error at resetProfessors')
      }
    })
  }

  // handle the first click to the "Initialize Database" button. Show an alert
  // and update state to remember the next click will be a double click.
  function firstClickHandler() {
    alert(
      '<div><h1>STOP AND THINK REALLY HARD</h1><p>This will delete all data in the database!!! Click again ONLY if you are initializing the database.</p></div>'
    )
    setDoubleClick(true)
  }

  // Render the "Initialize Database" button.
  // If this is the user's first click, make the button give an alert.
  // If this is the user's second click, call addAllCourses above to initiaize
  // the local database
  function renderInitButton(doubleClick: boolean) {
    // offer button to edit database
    if (doubleClick) {
      return (
        <div className="" role="group">
          <button
            disabled={disableInit}
            type="button"
            className=""
            onClick={() => addAllCourses()}
          >
            Initialize Database
          </button>
        </div>
      )
    } else {
      // offer button that gives alert and saves next click as a double click (in local state)
      return (
        <div className="" role="group">
          <button
            type="button"
            className=""
            onClick={() => firstClickHandler()}
          >
            Initialize Database
          </button>
        </div>
      )
    }
  }

  function toSelectOptions(options: string[] | undefined) {
    return options?.map((option) => ({ value: option, label: option })) || []
  }

  function renderAdmin(token: string) {
    return (
      <div className="">
        <div className="">
          <div className="">
            <div className="">
              <h2>Admin Interface</h2>
              <Stats token={token} />
              <br />

              <div className="">
                <div className="" role="group">
                  <button
                    disabled={disableNewSem}
                    type="button"
                    className=""
                    onClick={() => addNewSem(addSemester)}
                  >
                    Add New Semester
                  </button>
                  {/* <Select
                    isDisabled={disableNewSem}
                    value={{ value: addSemester, label: addSemester }}
                    onChange={(semester: any) => {
                      setAddSemester(semester.value)
                    }}
                    isSingle
                    options={toSelectOptions([
                      'SP24',
                      'FA24',
                      'SP25',
                      'FA25',
                      'SP26',
                      'FA26',
                      'SP27',
                      'FA27',
                      'SP28',
                      'FA28',
                      'SP29',
                      'FA29',
                      'SP30',
                    ])}
                    placeholder="Select Semester"
                  /> */}
                </div>

                <div className="" role="group">
                  <button
                    disabled={disableInit}
                    type="button"
                    className=""
                    onClick={() => updateProfessors()}
                  >
                    Update Professors
                  </button>
                </div>
                <div className="" role="group">
                  <button
                    disabled={disableInit}
                    type="button"
                    className=""
                    onClick={() => resetProfessors()}
                  >
                    RESET Professors
                  </button>
                </div>
                <div className="" role="group">
                  {renderInitButton(doubleClick)}
                </div>
              </div>

              <div hidden={!(loadingSemester === 1)} className="">
                <p>
                  Adding New Semester Data. This process can take up to 15
                  minutes.
                </p>
              </div>

              <div hidden={!(loadingSemester === 2)} className="">
                <p>New Semester Data import is complete!</p>
              </div>

              <div hidden={!(resettingProfs === 1)} className="">
                <p>Clearing all associated professors from Classes.</p>
                <p>This process can take up to 15 minutes.</p>
              </div>

              <div hidden={!(resettingProfs === 2)} className="">
                <p>All professor arrays in Classes reset to empty!</p>
              </div>

              <div hidden={!(loadingProfs === 1)} className="">
                <p>Updating professor data to Classes.</p>
                <p>This process can take up to 15 minutes.</p>
              </div>

              <div hidden={!(loadingProfs === 2)} className="">
                <p>Professor data import to Classes is complete!</p>
              </div>

              <div hidden={!(loadingInit === 1)} className="">
                <p>
                  Database Initializing. This process can take up to 15 minutes.
                </p>
              </div>

              <div hidden={!(loadingInit === 2)} className="">
                <p>Database initialaization is complete!</p>
              </div>

              <RaffleWinner adminToken={token} />

              <br />

              <div className="">
                <div className="">
                  <h3 className="">New Reviews</h3>
                </div>
                <div className="">
                  <ul>
                    {unapprovedReviews.map((review: Review) => {
                      if (review.reported !== 1) {
                        return (
                          <UpdateReview
                            key={review._id}
                            info={review}
                            removeHandler={removeReview}
                            approveHandler={approveReview}
                            unReportHandler={approveReview}
                          />
                        )
                      }
                      return null
                    })}
                  </ul>
                </div>
              </div>

              <br />

              <div className="">
                <div className="">
                  <h3 className="">Reported Reviews</h3>
                </div>
                <div className="">
                  <ul>
                    {reportedReviews.map((review: Review) => {
                      //create a new class "button" that will set the selected class to this class when it is clicked.
                      if (review.reported === 1) {
                        return (
                          <UpdateReview
                            key={review._id}
                            info={review}
                            removeHandler={removeReview}
                            approveHandler={approveReview}
                            unReportHandler={unReportReview}
                          />
                        )
                      }
                      return null
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function adminLogin() {
    if (loading) {
      return <Loading />
    } else if (isLoggedIn && token && isAdmin) {
      return renderAdmin(token)
    } else {
      return <Redirect to="/" />
    }
  }

  return adminLogin()
}
