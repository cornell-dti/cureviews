import React, { useEffect, useState } from 'react';

import MultiSelect from './MultiSelect';
import SingleSelect from './SingleSelect';
import RatingInput from './RatingInput';

// CSS FILES
import styles from '../Styles/ReviewModal.module.css';
import closeIcon from '../../../assets/icons/X.svg';

// Data
import majors from '../../Globals/majors';
import LoginModal from './LoginModal';
import { useAuthOptionalLogin } from '../../../auth/auth_utils';

const ReviewModal = ({
  open,
  setReviewOpen,
  submitReview,
  professorOptions
}: Modal) => {
  // Modal Logic
  const closeModal = () => {
    setReviewOpen(false);
  };
  // Content & Options
  const placeholdertext =
    'What did you like and dislike about the course? How engaging were the lectures? What were your thoughts on the professor? Would you recommend this class?';

  const majorOptions: string[] = majors;

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
    'S',
    'U'
  ];

  // Form & Review Content State
  const [selectedProfessors, setSelectedProfessors] = useState<string[]>([]);
  const [selectedMajors, setSelectedMajors] = useState<string[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [reviewText, setReviewText] = useState<string>('');

  const [overall, setOverall] = useState<number>(3);
  const [difficulty, setDifficulty] = useState<number>(3);
  const [workload, setWorkload] = useState<number>(3);

  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);

  const { isLoggedIn, signIn } = useAuthOptionalLogin();

  const [valid, setValid] = useState<Valid>({
    professor: false,
    major: false,
    grade: false,
    text: false
  });
  const [allowSubmit, setAllowSubmit] = useState<boolean>(false);

  useEffect(() => {
    if (!professorOptions.includes('Not Listed')) {
      professorOptions.push('Not Listed');
    }
  }, [professorOptions]);

  useEffect(() => {
    setAllowSubmit(valid.professor && valid.major && valid.grade && valid.text);
  }, [valid]);

  const onProfessorChange = (newSelectedProfessors: string[]) => {
    setSelectedProfessors(newSelectedProfessors);
    if (newSelectedProfessors.length > 0)
      setValid({ ...valid, professor: true });
    else setValid({ ...valid, professor: false });
  };

  const onMajorChange = (newSelectedMajors: string[]) => {
    setSelectedMajors(newSelectedMajors);
    if (newSelectedMajors.length > 0) setValid({ ...valid, major: true });
    else setValid({ ...valid, major: false });
  };

  const onGradeChange = (newSelectedGrade: string) => {
    setSelectedGrade(newSelectedGrade);
    if (newSelectedGrade !== '') setValid({ ...valid, grade: true });
    else setValid({ ...valid, grade: false });
  };

  const onReviewTextChange = (newText: string) => {
    setReviewText(newText);
    if (newText !== '') setValid({ ...valid, text: true });
    else setValid({ ...valid, text: false });
  };

  // Handle Submission
  const validReview = (): boolean =>
    selectedProfessors.length > 0 && reviewText.length > 5;

  // Called by onSubmitReview if the user should not see modal
  const handleSubmitReview = () => {
    if (validReview()) {
      const newReview: NewReview = {
        rating: overall,
        difficulty: difficulty,
        workload: workload,
        professors: selectedProfessors,
        text: reviewText,
        isCovid: false,
        grade: selectedGrade,
        major: selectedMajors
      };
      submitReview(newReview);
    }
  };

  // Handle click of submit button
  const onSubmitReview = () => {
    if (isLoggedIn) {
      handleSubmitReview();
      signIn('profile');
    } else {
      handleSubmitReview();
      setLoginModalOpen(true);
      setReviewOpen(false);
    }
  };

  if (!open && loginModalOpen && !isLoggedIn) {
    return (
      <div className={styles.modalbg}>
        <div className={styles.modal}>
          <LoginModal open={loginModalOpen} />
        </div>
      </div>
    );
  }

  if (!open) {
    return <></>;
  }

  return (
    <div className={styles.modalbg}>
      <div className={styles.modal}>
        <img
          className={styles.closeicon}
          onClick={closeModal}
          src={closeIcon}
          alt="close-modal"
        />
        <div className={styles.title}>Leave a Review</div>

        <div className={styles.content}>
          <div className={styles.formcol}>
            <MultiSelect
              options={professorOptions}
              value={selectedProfessors}
              onChange={onProfessorChange}
              placeholder="Professor"
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
              placeholder="Major"
              appearFromTop={true}
            />
            <SingleSelect
              options={gradeoptions}
              value={selectedGrade}
              onChange={onGradeChange}
              placeholder="Grade Received"
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
            <p className={styles.anonymouslabel}>
              Don't worry - all your reviews are anonymous!
            </p>
            <button
              className={styles.submitbutton}
              onClick={() => {
                onSubmitReview();
              }}
              disabled={!allowSubmit}
            >
              Submit Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

type Modal = {
  open: boolean;
  setReviewOpen: (open: boolean) => void;
  submitReview: (review: NewReview) => void;
  professorOptions: string[];
};

type NewReview = {
  text: string;
  rating: number;
  difficulty: number;
  workload: number;
  professors: string[];
  isCovid: boolean;
  grade: string;
  major: string[];
};

type Valid = {
  professor: boolean;
  major: boolean;
  grade: boolean;
  text: boolean;
};

export default ReviewModal;
