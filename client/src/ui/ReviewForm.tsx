import React, { useState } from "react";
import Select from "react-select";
import RatingInput from "./RatingInput";
import styles from "./css/ReviewForm.module.css";

type ReviewFormProps = {
  actionButtonLabel: string;
  onSubmitReview: (review: NewReview) => void;
  value?: NewReview;
  isReviewCommentVisible?: boolean;
  professors?: string[];
};

export type NewReview = {
  text: string;
  rating: number;
  difficulty: number;
  workload: number;
  professors: string[];
  isCovid: boolean;
  grade: string;
  major: string[];
};

/**
 * This component contains the form UI, state, and validation to write a new
 * review.
 */
export default function ReviewForm({
  actionButtonLabel,
  onSubmitReview,
  value,
  isReviewCommentVisible = true,
  professors,
}: ReviewFormProps) {
  const [overallRating, setOverallRating] = useState(value?.rating || 3);
  const [difficultyRating, setDifficultyRating] = useState(
    value?.difficulty || 3
  );
  const [workloadRating, setWorkloadRating] = useState(value?.workload || 3);
  const [selectedProfessors, setSelectedProfessors] = useState<string[]>(
    value?.professors || []
  );
  const [isSelectedProfessorsInvalid, setIsSelectedProfessorsInvalid] =
    useState(false);
  const [reviewText, setReviewText] = useState(value?.text || "");
  const [isReviewTextInvalid, setIsReviewTextInvalid] = useState(false);
  const [isCovid, setIsCovid] = useState(value?.isCovid || false);
  const [selectedGrade, setGradeSelected] = useState(value?.grade || "");
  const [selectedMajors, setMajorSelected] =useState<string[]>(
    value?.major || []
  );

  function toSelectOptions(professors: string[] | undefined) {
    return professors?.map((prof) => ({ value: prof, label: prof })) || [];
  }

  function isInputValid(): boolean {
    const regex = new RegExp(
      /^(?=.*[A-Z0-9])[\w:;.,?$%*#@[\]!--{}/\\()"'/$ ]+$/i
    );
    const isReviewTextValid =
      !isReviewCommentVisible || (!!reviewText && regex.test(reviewText));
    setIsReviewTextInvalid(!isReviewTextValid);
    const isSelectedProfessorsValid =
      selectedProfessors && selectedProfessors.length > 0;
    setIsSelectedProfessorsInvalid(!isSelectedProfessorsValid);
    return isReviewTextValid && isSelectedProfessorsValid;
  }

  return (
    <>
      <h2 className={styles.reviewHeader}>Leave a Review</h2>
      <div>
        <label
          className={styles.selectProfessorLabel}
          htmlFor="select-professor"
        >
          Professor
        </label>
        <Select
          value={toSelectOptions(selectedProfessors)}
          onChange={(professors: any) => {
            setIsSelectedProfessorsInvalid(false);
            setSelectedProfessors(
              professors?.map(({ value, label }: any) => value)
            );
          }}
          isMulti
          options={toSelectOptions(professors)}
          placeholder="Select professors"
        />
        {isSelectedProfessorsInvalid && (
          <div className={styles.errorText}>Please select your professors.</div>
        )}
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
        />
      </div>
      <div>
        <label
          className={styles.selectProfessorLabel}
          htmlFor="select-professor"
        >
          Grade Received
          (optional)
        </label>
        <Select
          value={{value: selectedGrade, label: selectedGrade}}
          onChange={(grade: any) => {
            setGradeSelected(grade.value)
            ;
          }}
          isSingle
          options={toSelectOptions(["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"])}
          placeholder="Select Grade"
        />
      </div>
      <div>
        <label
          className={styles.selectProfessorLabel}
          htmlFor="select-professor"
        >
          What's your major? (optional)
        </label>
        <Select
          value={toSelectOptions(selectedMajors)}
          onChange={(majors: any) => {
            setMajorSelected(
              majors?.map(({ value, label }: any) => value)
            );
          }}
          isMulti
          options={toSelectOptions(["Computer science",
          "Biology/biological sciences",
          "Labor and industrial relations",
          "Hotel/motel administration/management",
          "Agricultural economics",
          "Biological and biomedical sciences",
          "Econometrics and quantitative economics",
          "Information technology",
          "Mechanical engineering",
          "Political science and government",
          "Animal sciences",
          "Electrical and electronics engineering",
          "Mathematics",
          "Communication",
          "Natural resources/conservation",
          "Operations research",
          "Psychology",
          "Agriculture",
          "Architectural and building sciences/technology",
          "Human development and family studies",
          "Sociology",
          "Chemical engineering",
          "Public policy analysis",
          "Chemistry",
          "Physics",
          "History",
          "Bioengineering and biomedical engineering",
          "English language and literature",
          "Nutrition sciences",
          "Statistics",
          "International public health/international health",
          "Civil engineering",
          "Biometry/biometrics",
          "City/urban, community and regional planning",
          "Agricultural engineering",
          "Plant sciences",
          "Food science",
          "Engineering physics/applied physics",
          "Fine/studio arts",
          "Environmental/environmental health engineering",
          "Philosophy",
          "Materials engineering",
          "International agriculture",
          "American/united states studies/civilization",
          "Apparel and textiles",
          "Asian studies/civilization",
          "Spanish language and literature",
          "Computer and information sciences",
          "Linguistics",
          "Near and middle eastern studies",
          "General studies",
          "Landscape architecture",
          "Geological and earth sciences/geosciences",
          "Anthropology",
          "Classics and classical languages, literatures, and linguistics",
          "Visual and performing arts",
          "Comparative literature",
          "French language and literature",
          "Engineering",
          "Entomology",
          "Music",
          "Italian language and literature",
          "Astronomy",
          "Archeology",
          "Science, technology and society",
          "Art history, criticism and conservation",
          "Atmospheric sciences and meteorology",
          "Gay/lesbian studies",
          "African-american/black studies",
          "Textile science",
          "Religion/religious studies",
          "German studies",
          "Economics"])}
          placeholder="Select Major(s)"
        />
      </div>
      {isReviewCommentVisible && (
        <div>
          <label className={styles.reviewComment}>
            <span>Review comment</span>
            <textarea
              value={reviewText}
              onChange={(event) => {
                setIsReviewTextInvalid(false);
                setReviewText(event.target.value);
              }}
            />
          </label>
          {isReviewTextInvalid && (
            <div className={styles.errorText}>
              Please add text to your review, or make sure there are no illegal
              characters.
            </div>
          )}
        </div>
      )}
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
      <button
        className={`btn ${styles.actionButton}`}
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
              major: selectedMajors
            });
          }
        }}
      >
        {actionButtonLabel}
      </button>
    </>
  );
}
