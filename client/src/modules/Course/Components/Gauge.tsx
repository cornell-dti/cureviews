import React, { useEffect, useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import styles from '../Styles/Gauge.module.css';

type GaugeProps = {
  rating: number | undefined;
  label: string;
  isOverall: boolean;
};

type GaugeState = {
  color: string;
  percentage: number;
  rating: number | string;
};

export default function Gauge({ rating, label, isOverall }: GaugeProps) {
  const [gaugeState, setGaugeState] = useState<GaugeState>({
    color: '#000',
    percentage: 0.0,
    rating: 0.0
  });

  useEffect(() => {
    if (rating && !isNaN(rating)) {
      let percentage = 20 * rating; // rating is 1-5
      let color;

      let red = `hsl(4, 100%, 71%)`;
      let yellow = `hsl(47, 94%, 58%)`;
      let green = `hsl(101, 64%, 43%)`;

      let ratingRounded = parseFloat(rating.toFixed(1));

      if (0 <= ratingRounded && ratingRounded < 3) {
        color = isOverall ? red : green;
      } else if (3.0 <= ratingRounded && ratingRounded < 4) {
        color = yellow;
      } else {
        color = isOverall ? green : red;
      }

      setGaugeState({
        percentage: percentage,
        color: color,
        rating: rating.toFixed(1)
      });
    } else {
      setGaugeState({ color: '#000', rating: '-', percentage: 0.0 });
    }
  }, [setGaugeState, rating, isOverall]);

  return (
    <div className={styles.container}>
      <div className={styles.textcolumn}>
        <div className={styles.rating}>{gaugeState.rating}</div>
        <div className={styles.label}>{label}</div>
      </div>
      <div className={styles.circle}>
        <CircularProgressbar
          className={styles.gaugeCircle}
          value={gaugeState.percentage}
          strokeWidth={10}
          styles={buildStyles({
            pathColor: gaugeState.color,
            strokeLinecap: 'butt'
          })}
        />
      </div>
    </div>
  );
}
