import React, { useEffect, useMemo, useState } from "react";
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
  const [hoverIndex, setHoverIndex] = useState(value - 1);

  const buttonRefs = useMemo(
    () => Array.from({ length: maxRating }).map(() => React.createRef<any>()),
    [maxRating]
  );

  useEffect(() => {
    setHoverIndex(value - 1);
  }, [value]);

  function handleKeyDown({ key }: any) {
    if (key === "ArrowLeft" && hoverIndex >= 1) {
      buttonRefs[hoverIndex - 1].current.focus();
    }

    if (key === "ArrowRight" && hoverIndex < maxRating - 1) {
      buttonRefs[hoverIndex + 1].current.focus();
    }
  }

  return (
    <div className={className}>
      <label className={styles.ratingInputLabel}>{label}</label>
      <div
        className={styles.ratingInput}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {Array.from({ length: maxRating }).map((u, i) => (
          <span
            className={styles.ratingUnit}
            key={`${name}-${i}`}
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(value - 1)}
          >
            <button
              ref={buttonRefs[i]}
              className={styles.ratingButton}
              onClick={() => setValue(i + 1)}
              onFocus={() => setValue(i + 1)}
              tabIndex={-1}
            >
              <div
                className={`${styles.ratingButtonPill}
                  ${
                    i >= value &&
                    i < hoverIndex + 1 &&
                    styles.ratingButtonPillHover
                  }
                  ${i < hoverIndex + 1 && styles.ratingButtonPillSelected}
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
