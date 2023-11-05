import React, { useState } from 'react'
import Select from 'react-select'

import RatingInput from './RatingInput'
import tag_names from '../../Globals/tag_names'

import styles from '../Styles/ReviewForm.module.css'
import majors from '../../Globals/majors'

type ReviewFormProps = {
  actionButtonLabel: string
  onSubmitReview: (review: NewReview) => void
  value?: NewReview
  isReviewCommentVisible?: boolean
  professors?: string[]
}

type NewReview = {
  text: string
  rating: number
  difficulty: number
  workload: number
  professors: string[]
  isCovid: boolean
  grade: string
  major: string[]
}

type ButtonState = {
  [key: string]: boolean
}

/**
 * This component contains the form UI, state, and validation to write a new
 * review.
 * @props
 * actionButtonLabel: text that describes what the button on the form does
 * onSubmitReview: if the review is submitted, this function will save this
 *                 review to later be approved for display by moderators
 * value:
 * isReviewCommentVisible: boolean value to determine if the review comment
 *                         will be displayed
 * professors: a string array that stores the professors that taught this class
 */
const ReviewForm = ({
  actionButtonLabel,
  onSubmitReview,
  value,
  isReviewCommentVisible = true,
  professors,
}: ReviewFormProps) => {
  const [overallRating, setOverallRating] = useState(value?.rating || 3)
  const [difficultyRating, setDifficultyRating] = useState(
    value?.difficulty || 3
  )
  const [workloadRating, setWorkloadRating] = useState(value?.workload || 3)
  const [selectedProfessors, setSelectedProfessors] = useState<string[]>(
    value?.professors || []
  )
  const [isSelectedProfessorsInvalid, setIsSelectedProfessorsInvalid] =
    useState(false)
  const [reviewText, setReviewText] = useState(value?.text || '')
  const [isReviewTextInvalid, setIsReviewTextInvalid] = useState(false)
  const [isCovid, setIsCovid] = useState(value?.isCovid || false)
  const [selectedGrade, setGradeSelected] = useState(value?.grade || '')
  const [selectedMajors, setMajorSelected] = useState<string[]>(
    value?.major || []
  )
  const [selectedTags, setSelectedTags] = useState<string[]>(tag_names)
  const [clicked, setClicked] = useState<ButtonState>({})

  function toSelectOptions(professors: string[] | undefined) {
    return professors?.map((prof) => ({ value: prof, label: prof })) || []
  }

  function isInputValid(): boolean {
    const regex = new RegExp(
      /^(?=.*[A-Z0-9])[\w:;.,?$%*#@[\]!--{}/\\()"'/$ ]+$/i
    )
    const isReviewTextValid =
      !isReviewCommentVisible || (!!reviewText && regex.test(reviewText))
    setIsReviewTextInvalid(!isReviewTextValid)
    const isSelectedProfessorsValid =
      selectedProfessors && selectedProfessors.length > 0
    setIsSelectedProfessorsInvalid(!isSelectedProfessorsValid)
    return isReviewTextValid && isSelectedProfessorsValid
  }

  const handleTagClick = (tag: string) => {
    setClicked((prevClicked) => ({
      ...prevClicked,
      [tag]: !prevClicked[tag],
    }))

    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  return (
    <>
      <div className={`row ${styles.reviewForm}`}>
        <div className={`col-xl-6 col-lg-6 col-sm-6 ${styles.formColumn}`}>
          <h2 className={`${styles.reviewHeader}`}>Leave a Review</h2>
          <div className={styles.inputs}>
            <label
              className={styles.selectProfessorLabel}
              htmlFor="select-professor"
            >
              Professor
            </label>
            <Select
              value={toSelectOptions(selectedProfessors)}
              onChange={(professors: any) => {
                setIsSelectedProfessorsInvalid(false)
                setSelectedProfessors(
                  professors?.map(({ value, label }: any) => value)
                )
              }}
              isMulti
              options={toSelectOptions([...(professors || []), 'Not Listed'])}
              placeholder="Select professors"
            />
            {isSelectedProfessorsInvalid && (
              <div className={styles.errorText}>
                Please select your professors.
              </div>
            )}
          </div>

          <div className={styles.inputs}>
            <label
              className={styles.selectProfessorLabel}
              htmlFor="select-professor"
            >
              Grade Received (optional)
            </label>
            <Select
              value={{ value: selectedGrade, label: selectedGrade }}
              onChange={(grade: any) => {
                setGradeSelected(grade.value)
              }}
              isSingle
              options={toSelectOptions([
                'A+',
                'A',
                'A-',
                'B+',
                'B',
                'B-',
                'C+',
                'C',
                'C-',
                'D+',
                'D',
                'D-',
                'F',
              ])}
              placeholder="Select Grade"
            />
          </div>

          <div className={styles.ratingInput}>
            <RatingInput
              name="overall"
              label="Overall"
              value={overallRating}
              setValue={setOverallRating}
              maxRating={5}
              minLabel="Not for me"
              maxLabel="Loved it"
              isOverall={true}
            />
          </div>
          <div className={styles.ratingInput}>
            <RatingInput
              name="difficulty"
              label="Difficulty"
              value={difficultyRating}
              setValue={setDifficultyRating}
              maxRating={5}
              minLabel="Piece of cake"
              maxLabel="Challenging"
              isOverall={false}
            />
          </div>
          <div className={styles.ratingInput}>
            <RatingInput
              name="workload"
              label="Workload"
              value={workloadRating}
              setValue={setWorkloadRating}
              maxRating={5}
              minLabel="Not much"
              maxLabel="Lots of work"
              isOverall={false}
            />
          </div>
        </div>
        <div className={`col-xl-6 col-lg-6 col-sm-6 ${styles.commentColumn}`}>
          {isReviewCommentVisible && (
            <div className={styles.review}>
              <label className={styles.reviewComment}>
                <textarea
                  className={styles.reviewText}
                  value={reviewText}
                  onChange={(event) => {
                    setIsReviewTextInvalid(false)
                    setReviewText(event.target.value)
                  }}
                  placeholder={`${
                    selectedProfessors &&
                    selectedProfessors.includes('Not listed')
                      ? 'Who was your professor? '
                      : ''
                  }What did you like and dislike about the course? How engaging were the lectures? What were your thoughts on the professor? Would you recommend this class?`}
                />
              </label>
              {isReviewTextInvalid && (
                <div className={styles.errorText}>
                  Please add text to your review, or make sure there are no
                  illegal characters.
                </div>
              )}

              <div className={styles.tagsContainer}>
                <label htmlFor="select-tags">Select Tags (optional)</label>
                <div className={styles.tagButtonContainer}>
                  {tag_names.map((tag) => (
                    <button
                      key={tag}
                      className={
                        clicked[tag] ? styles.selectedBtn : styles.tagButton
                      }
                      onClick={() => handleTagClick(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <label className={styles.covidCheckboxLabel}>
                <input
                  type="checkbox"
                  name="experience-covid"
                  checked={isCovid}
                  onChange={(event) => setIsCovid(event.target.checked)}
                />
                <span className={styles.covidCheckboxLabelText}>
                  My experience was affected by COVID-19
                </span>
              </label>
            </div>
          )}

          <button
            className={`${styles.actionButton}`}
            onClick={() => {
              if (isInputValid()) {
                onSubmitReview({
                  rating: overallRating,
                  difficulty: difficultyRating,
                  workload: workloadRating,
                  professors: selectedProfessors,
                  text: reviewText,
                  isCovid,
                  grade: selectedGrade,
                  major: selectedMajors,
                })
              }
            }}
          >
            {actionButtonLabel}
          </button>
        </div>
      </div>
    </>
  )
}

export default ReviewForm
export type { NewReview }
