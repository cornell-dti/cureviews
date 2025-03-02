import React from 'react';
import styles from '../Styles/CornelliansSay.module.css';
import Bear from '/cornellians_say_bear.svg';

/**
 * Component for Cornellians Say. Only appears on courses that have at least 3 reviews
 * and a valid summary generated.
 */
type SummaryProps = {
  classSummary: string;
  summaryTags: Map<string, [string, string]>;
}
const CornelliansSay = ({ classSummary, summaryTags }: SummaryProps) => {
  const capitalizeFirstLetter = (word: string) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  };
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img src={Bear} alt="Bear Icon" className={styles.bearIcon} />
        <h1 className={styles.title}>Cornellians Say</h1>
      </div>
      <p className={styles.summary}>{classSummary}</p>
      <h2 className={styles.tagsTitle}>Top Tags</h2>
      {/* map each tag into a div displaying each key/category with its
      corresponding adjective and applies the corresponding style for the
      adjective's connotation */}
      <div className={styles.tagsContainer}>
        {Array.from(summaryTags.entries()).map(([category, [adjective, connotation]]) => (
          <div
            key={category}
            className={`${styles.tag} ${connotation === "positive"
              ? styles.positiveTag
              : connotation === "negative"
                ? styles.negativeTag
                : styles.neutralTag
              }`}
          >
            {capitalizeFirstLetter(adjective)} {category}
          </div>
        ))}
      </div>
    </div>
  );
};
export default CornelliansSay