import React, { useState } from "react";
import Select from "react-select";
import RatingInput from "./RatingInput";
import styles from "./css/StartReviewForm.module.css";

type StartReviewFormProps = {
  professors?: string[];
  onStartReview: (
    overallRating: number,
    difficultyRating: number,
    workloadRating: number,
    selectedProfessors: string[]
  ) => void;
};

export default function StartReviewForm({
  professors,
  onStartReview,
}: StartReviewFormProps) {
  const [overallRating, setOverallRating] = useState(3);
  const [difficultyRating, setDifficultyRating] = useState(3);
  const [workloadRating, setWorkloadRating] = useState(3);
  const [selectedProfessors, setSelectedProfessors] = useState<string[]>([]);

  return (
    <div className={styles.reviewCard}>
      <h2 className={styles.reviewHeader}>Leave a Review</h2>
      <div>
        <label
          className={styles.selectProfessorLabel}
          htmlFor="select-professor"
        >
          Professor
        </label>
        <Select
          className="react-select-container"
          value={selectedProfessors}
          onChange={(professors: any) => {
            setSelectedProfessors(professors);
          }}
          isMulti
          options={professors?.map((prof) => ({ value: prof, label: prof }))}
          placeholder="Select professors"
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
      <label className={styles.covidCheckboxLabel}>
        <input type="checkbox" name="experience-covid" />
        <span className={styles.covidCheckboxLabelText}>
          My experience was affected by COVID-19
        </span>
      </label>
      <button
        className={`btn ${styles.startReviewButton}`}
        onClick={() =>
          onStartReview(
            overallRating,
            difficultyRating,
            workloadRating,
            selectedProfessors.map(({ value, label }: any) => value)
          )
        }
      >
        Start a review
      </button>
    </div>
  );
}
