import React, { useState } from 'react'

import MultiSelect from './MultiSelect'
import SingleSelect from './SingleSelect'
import RatingInput from './RatingInput'

// CSS FILES
import styles from '../Styles/ReviewModal.module.css'
import closeIcon from '../../../assets/icons/X.svg'

// Data
import majors from '../../Globals/majors'

const ReviewModal = ({ open, professorOptions }: Modal) => {
  const placeholdertext =
    'What did you like and dislike about the course? How engaging were the lectures? What were your thoughts on the professor? Would you recommend this class?'

  const majorOptions: string[] = majors

  const gradeoptions = [
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
  ]

  const [selectedProfessors, setSelectedProfessors] = useState<string[]>([])
  const [selectedMajors, setSelectedMajors] = useState<string[]>([])
  const [selectedGrade, setSelectedGrade] = useState<string>('')
  const [reviewText, setReviewText] = useState<string>('')

  const [overall, setOverall] = useState<number>(3)
  const [difficulty, setDifficulty] = useState<number>(3)
  const [workload, setWorkload] = useState<number>(3)

  function onProfessorChange(newSelectedProfessors: string[]) {
    setSelectedProfessors(newSelectedProfessors)
  }

  function onMajorChange(newSelectedMajors: string[]) {
    setSelectedMajors(newSelectedMajors)
  }

  function onGradeChange(newSelectedGrade: string) {
    setSelectedGrade(newSelectedGrade)
  }

  function onReviewTextChange(newText: string) {
    setReviewText(newText)
    console.log(newText)
  }

  if (!open) {
    return <></>
  }

  return (
    <div className={styles.modalbg}>
      <div className={styles.modal}>
        <img className={styles.closeicon} src={closeIcon} alt="close-modal" />
        <div className={styles.title}>Leave a Review</div>

        <div className={styles.content}>
          <div className={styles.formcol}>
            <MultiSelect
              options={professorOptions}
              value={selectedProfessors}
              onChange={onProfessorChange}
              placeholder="Porofessor"
            />
            <div className={styles.slider}>
              <RatingInput
                name="overall"
                label="Overall"
                value={overall}
                setValue={setOverall}
                maxRating={5}
                minLabel="Not for me"
                maxLabel="Loved it"
                isOverall={true}
              />
            </div>
            <div className={styles.slider}>
              <RatingInput
                name="difficulty"
                label="Difficulty"
                value={difficulty}
                setValue={setDifficulty}
                maxRating={5}
                minLabel="Piece of cake"
                maxLabel="Challenging"
                isOverall={false}
              />
            </div>
            <div className={styles.slider}>
              <RatingInput
                name="workload"
                label="Workload"
                value={workload}
                setValue={setWorkload}
                maxRating={5}
                minLabel="Not much"
                maxLabel="Lots of work"
                isOverall={false}
              />
            </div>
            <MultiSelect
              options={majorOptions}
              value={selectedMajors}
              onChange={onMajorChange}
              placeholder="Underwater Basket Weaving"
            />
            <SingleSelect
              options={gradeoptions}
              value={selectedGrade}
              onChange={onGradeChange}
              placeholder="B+"
            />
          </div>
          <div className={styles.textcol}>
            <textarea
              className={styles.textinputbox}
              value={reviewText}
              onChange={(e) => onReviewTextChange(e.target.value)}
              name="review-content"
              id="review-content"
              placeholder={placeholdertext}
            ></textarea>
            <div className={styles.tags} aria-label="tags-coming-soon">
              {' '}
              🙈 New feature soon ... 🙈{' '}
            </div>
            <button className={styles.submitbutton}> Submit Review </button>
          </div>
        </div>
      </div>
    </div>
  )
}

type Modal = {
  open: boolean
  professorOptions: string[]
}
export default ReviewModal