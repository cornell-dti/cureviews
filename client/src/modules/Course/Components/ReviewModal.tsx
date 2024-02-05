import React from 'react'

import Select from './Select'

// CSS FILES
import styles from '../Styles/ReviewModal.module.css'
import closeIcon from '../../../assets/icons/X.svg'

// Data
import majors from '../../Globals/majors'

const ReviewModal = ({ open }: Modal) => {
  if (!open) {
    return <></>
  }

  const placeholdertext =
    'What did you like and dislike about the course? How engaging were the lectures? What were your thoughts on the professor? Would you recommend this class?'

  const professoroptions = [
    'David Gries',
    'Roben Van Vesselar',
    'Anne Bracy',
    'Killian Weinberger',
    'Dean Kavita Bala',
    'Robert Haribariban',
  ]

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

  return (
    <div className={styles.modalbg}>
      <div className={styles.modal}>
        <img className={styles.closeicon} src={closeIcon} alt="close-modal" />
        <div className={styles.title}>Leave a Review</div>

        <div className={styles.content}>
          <div className={styles.formcol}>
            <Select options={professoroptions} placeholder="Porofessor" />
            <Select options={gradeoptions} placeholder="B+" />
            <Select options={majors} placeholder="Underwater Basket Weaving" />
          </div>
          <div className={styles.textcol}>
            <textarea
              className={styles.textinputbox}
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
}
export default ReviewModal
