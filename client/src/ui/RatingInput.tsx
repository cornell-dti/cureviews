import React, { useEffect, useState } from "react";
import styles from "./css/RatingInput.module.css";

type RatingInputProps = {
  name: string;
  label: string;
  value: number;
  setValue: any;
  maxRating: number;
  minLabel?: string;
  maxLabel?: string;
  className?: string;
};

export default function RatingInput({
  name,
  label,
  value,
  setValue,
  maxRating,
  minLabel,
  maxLabel,
  className,
}: RatingInputProps) {
  const [hoverValue, setHoverValue] = useState(value);

  useEffect(() => {
    setHoverValue(value);
  }, [value]);

  return (
    <div className={className}>
      <label htmlFor={name} className={styles.ratingInputLabel}>
        {label}
      </label>
      <div className={styles.ratingInput} id={name}>
        {/* {value} */}
        {Array.from({ length: maxRating }).map((u, i) => (
          <span
            className={styles.ratingUnit}
            key={`${name}-${i}`}
            onMouseEnter={() => setHoverValue(i + 1)}
            onMouseLeave={() => setHoverValue(value)}
          >
            <button
              id={`${name}-${i}`}
              className={styles.ratingButton}
              onClick={() => setValue(i + 1)}
              onFocus={() => setHoverValue(i + 1)}
              onBlur={() => setHoverValue(value)}
            >
              <div
                className={`${styles.ratingButtonPill}
                  ${
                    i >= value && i < hoverValue && styles.ratingButtonPillHover
                  }
                  ${i < hoverValue && styles.ratingButtonPillSelected}
                `}
              />
              {i + 1}
            </button>
          </span>
        ))}
      </div>
      <div className={styles.ratingMinMaxLabel}>
        <label htmlFor={`${name}-0`}>{minLabel}</label>
        <label htmlFor={`${name}-${maxRating - 1}`}>{maxLabel}</label>
      </div>
    </div>
  );
}
