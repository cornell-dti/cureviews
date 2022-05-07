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
  isOverall: boolean;
};

/**
 * This component allows users to input ratings up to `maxRating` using their
 * pointer or arrow keys. It is controlled with `value` and `setValue` and
 * renders the value with "pills."
 */
export default function RatingInput({
  name,
  label,
  value,
  setValue,
  maxRating,
  minLabel,
  maxLabel,
  className,
  isOverall,
}: RatingInputProps) {
  const [hoverIndex, setHoverIndex] = useState(value - 1);
  const [color, setColor] = useState<string>("");

  const buttonRefs = useMemo(
    () => Array.from({ length: maxRating }).map(() => React.createRef<any>()),
    [maxRating]
  );

  useEffect(() => {
    setHoverIndex(value - 1);
    setColor(getColor(value));
  }, [value]);

  function handleKeyDown({ key }: any) {
    if (key === "ArrowLeft" && hoverIndex >= 1) {
      buttonRefs[hoverIndex - 1].current.focus();
    }

    if (key === "ArrowRight" && hoverIndex < maxRating - 1) {
      buttonRefs[hoverIndex + 1].current.focus();
    }
  }

  function getColor(index: number) {
    if (0 <= index && index < 3) {
      return isOverall ? "Red" : "Green";
    } else if (3 <= index && index < 4) {
      return "Yellow";
    } else {
      return isOverall ? "Green" : "Red";
    }
  }

  return (
    <div className={className} tabIndex={0} onKeyDown={handleKeyDown}>
      <label className={styles.ratingInputLabel}>{label}</label>
      <div className={styles.ratingInput}>
        {Array.from({ length: maxRating }).map((u, i) => (
          <span
            className={styles.ratingUnit}
            key={`${name}-${i}`}
            onMouseEnter={() => {
              setHoverIndex(i);
              setColor(getColor(i + 1));
            }}
            onMouseLeave={() => {
              setHoverIndex(value - 1);
              setColor(getColor(value));
            }}
          >
            <button
              ref={buttonRefs[i]}
              className={styles.ratingButton}
              onClick={() => {
                setValue(i + 1);
                setColor(getColor(i + 1));
              }}
              onFocus={() => {
                setValue(i + 1);
                setColor(getColor(i + 1));
              }}
              tabIndex={-1}
            >
              <div
                className={`${styles.ratingButtonPill}
                  ${
                    i >= value &&
                    i < hoverIndex + 1 &&
                    styles["ratingButtonPillHover" + color]
                  }
                  ${
                    i < hoverIndex + 1 &&
                    styles["ratingButtonPillSelected" + color]
                  }
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
