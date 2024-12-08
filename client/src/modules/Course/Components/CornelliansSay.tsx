import React from 'react';
import styles from '../Styles/CornelliansSay.module.css';
import Bear from '/cornellians_say_bear.svg';

type SummaryProps = {
  classSummary: string;
  summaryTags: Map<string, [string, string]>;
}
const CornelliansSay = ({ classSummary, summaryTags }: SummaryProps) => {
  const summaryTagsMap = new Map(Object.entries(summaryTags));
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img src={Bear} alt="Bear Icon" className={styles.bearIcon} />
        <h1 className={styles.title}>Cornellians Say</h1>
      </div>
      <p className={styles.summary}>{classSummary}</p>
      <h2 className={styles.tagsTitle}>Top Tags</h2>
      <div className={styles.tagsContainer}>
        {Array.from(summaryTags.entries()).map(([category, [adjective, connotation]]) => (
          <div
            key={category} // Use the category as the key
            className={`${styles.tag} ${connotation === "positive"
              ? styles.positiveTag
              : connotation === "negative"
                ? styles.negativeTag
                : styles.neutralTag
              }`}
          >
            {category} {adjective}
          </div>
        ))}
      </div>
    </div>
  );
};
export default CornelliansSay