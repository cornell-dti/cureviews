import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';

import axios from 'axios';

import { Review } from 'common';

import { useAuthMandatoryLogin } from '../../../auth/auth_utils';

import UpdateReview from './AdminReview.js';
import Stats from './Stats';
import ManageAdminModal from './ManageAdminModal';

import styles from '../Styles/Admin.module.css';
import Loading from '../../Globals/Loading';

/** Admin Page
 * Approve new reviews, see stats, and import new semester courses & Profs.
 */
export const Admin = () => {
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [reportedReviews, setReportedReviews] = useState<Review[]>([]);
  const [doubleClick, setDoubleClick] = useState<boolean>(false);

  const [updating, setUpdating] = useState<boolean>(false);
  type updatedStates =
    | 'empty'
    | 'semester'
    | 'profsReset'
    | 'profsUpdate'
    | 'subjects'
    | 'database'
    | 'description'
    | 'summarize'
    | 'failure';
  const [updated, setUpdated] = useState<updatedStates>('empty');
  const messages = {
    empty: '',
    semester: 'New semester data successfully added',
    profsReset: 'Professor data successfully reset to empty',
    profsUpdate: 'Professor data successfully updated',
    subjects: 'Subject full name data successfully updated',
    database: 'Database successfully initialized',
    description: 'Course description data successfully added',
    summarize: 'All courses successfully summarized',
    failure: 'API failed'
  };
  const [updatingField, setUpdatingField] = useState<string>('');

  const [addSemester] = useState(['FA24', 'SP25']);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  const { isLoggedIn, token, isAuthenticating } =
    useAuthMandatoryLogin('admin');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function confirmAdmin() {
      const response = await axios.post(`/api/admin/token/validate`, {
        token: token
      });
      const userIsAdmin = response.data.result;
      setIsAdmin(userIsAdmin);
      setLoading(false);
    }

    if (isLoggedIn) {
      confirmAdmin();
    }
  }, [isLoggedIn, token, isAuthenticating]);

  /**
   * Accesses the database and fetches all reviews. Called when admin page loads, and
   * splits the reviews into three categories: approved (visible on the website),
   * pending (awaiting approval), and reported (hidden and awaiting approval)
   */
  useEffect(() => {
    async function loadReviews() {
      const pending = await axios.post('/api/admin/reviews/get-pending', {
        token: token
      });
      if (pending.status === 200) {
        setPendingReviews(pending.data.result);
      }
      const reported = await axios.post('/api/admin/reviews/get-reported', {
        token: token
      });
      if (reported.status === 200) {
        setReportedReviews(reported.data.result);
      }
    }
    loadReviews();
  }, [token, isAuthenticating]);

  /**
   * Helper function to remove a review from a list of reviews and
   * return the updated list
   */
  function removeReviewFromList(reviewToRemove: Review, reviews: Review[]) {
    reviews = reviews.filter((review: Review) => {
      return review && review._id !== reviewToRemove._id;
    });
    return reviews;
  }

  /**
   * Call when user asks to approve a review. Accesses the Reviews database
   * and changes the review with this id to visible.
   */
  async function approveReview(review: Review) {
    const response = await axios.post('/api/admin/reviews/approve', {
      review: review,
      token: token
    });

    if (response.status === 200) {
      const updatedPendingReviews = removeReviewFromList(
        review,
        pendingReviews
      );
      setPendingReviews(updatedPendingReviews);
    }
  }

  /**
   * Call when user asks to remove a review. Accesses the Reviews database
   * and deletes the review with this id.
   */
  async function removeReview(review: Review, isUnapproved: boolean) {
    try {
      const response = await axios.post('/api/admin/reviews/remove', {
        review: review,
        token: token
      });
      if (response.status === 200) {
        if (isUnapproved) {
          const updatedUnapprovedReviews = removeReviewFromList(
            review,
            pendingReviews
          );
          setPendingReviews(updatedUnapprovedReviews);
        } else {
          const updatedReportedReviews = removeReviewFromList(
            review,
            reportedReviews
          );
          setReportedReviews(updatedReportedReviews);
        }
      }
    } catch (e) {
      alert(`Unable to remove review ${e}`);
    }
  }

  /**
   * Call when admin would like to mass-approve all of the currently pending reviews.
   */
  async function approveAllReviews(reviews: Review[]) {
    const response = await axios.post('/api/admin/reviews/approve/all', {
      token: token
    });
    if (response.status === 200) {
      setPendingReviews([]);
    } else {
      alert('Could not approve all reviews');
    }
  }

  // Call when user selects "Sumarize Reviews" button. Calls endpoint to generate 
  // summaries and tags using AI for all courses with a freshness above a certain
  // threshold, then updates those courses to include these new summaries and tags.
  async function summarizeReviews() {
    console.log('Updating all courses with AI');
    setUpdating(true);
    setUpdatingField('summarizing');
    const response = await axios.post('/api/ai/summarize-courses');
    if (response.status == 200) {
      setUpdated('summarize');
    }
    else {
      setUpdated('failure');
    }
    setUpdating(false);
  }

  /**
   * Call when user asks to un-report a reported review. Accesses the Reviews database
   * and changes the reported flag for this review to false.
   */
  async function unReportReview(review: Review) {
    const response = await axios.post('/api/admin/reviews/restore', {
      review: review,
      token: token
    });

    if (response.status === 200) {
      const updatedReportedReviews = removeReviewFromList(
        review,
        reportedReviews
      );
      setReportedReviews(updatedReportedReviews);
    }
  }

  /**
   * Call when user selects "Add New Semester" button. Runs code to check the
   * course API for new classes and updates classes existing in the database.
   * Should run once a semester, when new classes are added to the roster.
   */
  async function addNewSemesters(semesters: string[]) {
    console.log('Adding new semester...');
    setUpdating(true);
    setUpdatingField('new semesters');
    //wz
    for (const semester of semesters) {
      const response = await axios.post('/api/admin/semester/add', {
        semester,
        token: token
      });
      const result = response.data.result;
      if (!result) {
        console.error(`Unable to add new semester ${semester}!`);
        continue;
      } else {
        console.log(`New Semester ${semester} Added`);
      }
    }
    setUpdating(false);
    setUpdated('semester');
  }

  // Call when user selects "Initialize Database" button. Scrapes the Cornell
  // Course API to store all classes and subjects in the local database.
  // Then, runs code to store id's of cross-listed classes against each class.
  // Should only be run ONCE when the app is initialzied.
  //
  // NOTE: requires an initialize flag to ensure the function is only run on
  // a button click without this, it will run every time this component is created.
  async function addAllCourses() {
    console.log('Initializing database');
    setUpdating(true);
    setUpdatingField('all database');
    //wz
    const response = await axios.post('/api/admin/db/initialize', {
      token: token
    });
    if (response.status === 200) {
      setUpdating(false);
      setUpdated('database');
    } else {
      console.log('Error at dbInit');
    }
  }

  /**
   * Call when admin wants to update professors for users to search through
   * when clicking the "Update Professors" button
   */
  async function updateProfessors() {
    console.log('Updating professors');
    setUpdating(true);
    setUpdatingField('professors');
    //wz
    const response = await axios.post('/api/admin/professors/add', {
      token: token
    });
    if (response.status === 200) {
      console.log('Updated the professors');
      setUpdating(false);
      setUpdated('professors');
    } else {
      console.log('Error at setProfessors');
    }
  }

  /**
   * Call when admin wants to reset all professors in classes when clicking the
   * "Reset Professors" button
   */
  async function resetProfessors() {
    console.log('Setting the professors to an empty array');
    setUpdating(true);
    setUpdatingField('professors to empty arrays');
    // wz
    const response = await axios.post('/api/admin/professors/reset', {
      token: token
    });
    if (response.status === 200) {
      console.log('Reset all the professors to empty arrays');
      setUpdating(false);
      setUpdated('profsReset');
    } else {
      console.log('Error at resetProfessors');
    }
  }

  /**
   * Call when user selects "Update Descriptions" button. Scrapes the Course API
   * to retrieve course description and stores them in the Course database.
   */
  async function updateDescriptions() {
    console.log('Updating course descriptions');
    setUpdating(true);
    setUpdatingField('course descriptions');
    const response = await axios.post('/api/admin/course/desc', {
      token: token
    });
    if (response.status === 200) {
      console.log('Updated all course descriptions');
      setUpdating(false);
      setUpdated('description');
    } else {
      console.log('Error at updateDescriptions');
    }
  }

  /*
   * Call when admin wants to update the list of subjects users can search through
   * when clicking the "Update Subjects" button
   */
  async function updateSubjects() {
    setUpdating(true);
    setUpdatingField('subjects');
    const response = await axios.post('/api/admin/subjects/update', {
      token: token
    });
    if (response.status === 200) {
      console.log('Updated all subject names');
      setUpdating(false);
      setUpdated('subjects');
    } else {
      console.log('Error at updateSubjects');
    }
  }

  async function updateSimilarityData() {
    console.log('Updatng course similarity data')
    setUpdating(true)
    setUpdatingField("course similarity data")
    const response = await axios.post('/api/admin/rec/similarity', { token: token });
    if (response.status === 200) {
      console.log('Updated course similarity data')
      setUpdating(false)
      setUpdated('similarity')
    } else {
      console.log('Error at updateSimilarityData')
    }
  }

  /**
   * Handle the first click to the "Initialize Database" button. Show an alert
   * and update state to remember the next click will be a double click.
   */
  function firstClickHandler() {
    alert(
      '<div><h1>Warning!</h1><p>Clicking again will reset all data in the database. Are you sure you want to do this?</p></div>'
    );
    setDoubleClick(true);
  }

  /**
   * Render the "Initialize Database" button.
   * If this is the user's first click, make the button give an alert.
   * If this is the user's second click, call addAllCourses above to initiaize
   * the local database
   */
  function renderInitButton() {
    // Offer button to edit database
    if (doubleClick) {
      return (
        <div className="">
          <button
            disabled={updating}
            type="button"
            className={styles.adminButtons}
            onClick={() => addAllCourses()}
          >
            Initialize Database
          </button>
        </div>
      );
    } else {
      // Offer button that gives alert and saves next click as a double click (in local state)
      return (
        <div className="">
          <button
            type="button"
            className={styles.adminButtons}
            onClick={() => firstClickHandler()}
          >
            Initialize Database
          </button>
        </div>
      );
    }
  }

  function renderAdmin(userToken: string) {
    return (
      <div className={styles.adminWrapper}>
        <div className="headInfo">
          <h1>Admin Interface</h1>
          <Stats token={userToken} />
          <div className={styles.semesterUpdate}>
            <h2>Admin tools</h2>
            <div className="" role="group">
              <button
                className={styles.adminButtons}
                onClick={() => setIsAdminModalOpen(true)}
              >
                Manage Administrators
              </button>
              <button
                disabled={updating}
                type="button"
                className={styles.adminButtons}
                onClick={() => addNewSemesters(addSemester)}
              >
                Add New Semester
              </button>
              <button
                disabled={updating}
                type="button"
                className={styles.adminButtons}
                onClick={() => updateProfessors()}
              >
                Update Professors
              </button>
              <button
                disabled={updating}
                type="button"
                className={styles.adminButtons}
                onClick={() => resetProfessors()}
              >
                Reset Professors
              </button>
              <button
                disabled={updating}
                type="button"
                className={styles.adminButtons}
                onClick={() => updateDescriptions()}
              >
                Update Descriptions
              </button>
              <button
                disabled={updating}
                type="button"
                className={styles.adminButtons}
                onClick={() => updateSubjects()}
              >
                Update Subjects
              </button>
              <button
                disabled={updating}
                type="button"
                className={styles.adminButtons}
                onClick={() => summarizeReviews()}
              >
                Summarize Reviews
              </button>
              <button
                disabled={updating}
                type="button"
                className={styles.adminButtons}
                onClick={() => updateSimilarityData()}
              >
                Update Similarity Data
              </button>
              {renderInitButton()}
            </div >
          </div >

          <ManageAdminModal
            open={isAdminModalOpen}
            setOpen={setIsAdminModalOpen}
            token={userToken}
          />

          <div>{messages[updated]}</div>

          <div hidden={!updating} className="">
            <p>Updating {updatingField} in the Course database.</p>
            <p>This process can take up to 15 minutes.</p>
          </div>
        </div >

        <div className="StagedReviews">
          <h1>Pending Reviews</h1>
          <button
            type="button"
            className={styles.massApproveButton}
            onClick={() => approveAllReviews(pendingReviews)}
          >
            Approve all pending reviews
          </button>
          <div className="PendingReviews">
            {pendingReviews.map((review: Review) => {
              return (
                <UpdateReview
                  key={review._id}
                  review={review}
                  removeHandler={removeReview}
                  approveHandler={approveReview}
                  unReportHandler={approveReview}
                />
              );
            })}
          </div>
          <br></br>
          <h1>Reported Reviews</h1>
          <div className="ReportedReviews">
            {reportedReviews.map((review: Review) => {
              //create a new class "button" that will set the selected class to this class when it is clicked.
              return (
                <UpdateReview
                  key={review._id}
                  review={review}
                  removeHandler={removeReview}
                  approveHandler={approveReview}
                  unReportHandler={unReportReview}
                />
              );
            })}
          </div>
        </div>
      </div >
    );
  }

  function adminLogin() {
    if (loading) {
      return <Loading />;
    } else if (isLoggedIn && token && isAdmin) {
      return renderAdmin(token);
    } else {
      return <Redirect to="/" />;
    }
  }

  return adminLogin();
};
