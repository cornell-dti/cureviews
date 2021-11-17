import React, { useEffect, useState } from "react";
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
};

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
  const [reviewText, setReviewText] = useState(value?.text || "");
  const [isCovid, setIsCovid] = useState(value?.isCovid || false);

  function toSelectOptions(professors: string[] | undefined) {
    return professors?.map((prof) => ({ value: prof, label: prof })) || [];
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
            setSelectedProfessors(
              professors?.map(({ value, label }: any) => value)
            );
          }}
          isMulti
          options={toSelectOptions(professors)}
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
      {isReviewCommentVisible && (
        <label className={styles.reviewComment}>
          <span>Review comment</span>
          <textarea
            value={reviewText}
            onChange={(event) => {
              setReviewText(event.target.value);
            }}
          />
        </label>
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
        onClick={() =>
          onSubmitReview({
            rating: overallRating,
            difficulty: difficultyRating,
            workload: workloadRating,
            professors: selectedProfessors,
            text: reviewText,
            isCovid,
          })
        }
      >
        {actionButtonLabel}
      </button>
    </>
  );
}
