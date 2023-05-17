import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
  className?: string;
  barHeight?: number;
  title?: string;
  value: number;
  totalValue: number;
  color?: string;
}
function ProgressBar(props: Props) {
  const {
    className,
    title,
    totalValue,
    value,
    color,
    barHeight = 8,
  } = props;

  return (
    <div className={_cs(styles.progressWrapper, className)}>
      <div className={styles.progressTitle}>
        {title}
      </div>
      <div
        className={styles.progressBarWrapper}
        style={{ height: `${barHeight}px` }}
      >
        <div
          className={styles.progressBar}
          style={{
            width: `${(value / totalValue) * 100}%`,
            backgroundColor: color ?? '#011E41',
          }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
