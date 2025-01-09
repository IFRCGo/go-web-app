import React from 'react';
import { _cs } from '@togglecorp/fujs';

import PERSummaryDashboard from './PERSummaryDashboard';
import PERPerformanceDashboard from './PERPerformanceDashboard';

import styles from './styles.module.css';

interface Props {
  className?: string;
  variant: 'summary' | 'performance';
  accessToken?: string;
}

function PERDashboard(props: Props) {
  const {
    className,
    variant,
    accessToken,
  } = props;

  return (
    <div className={_cs(styles.perDashboard, className)}>
      {variant === 'summary' && (
        <PERSummaryDashboard 
          className={className}
          accessToken={accessToken}
        />
      )}
      {variant === 'performance' && (
        <PERPerformanceDashboard 
          className={className}
          accessToken={accessToken}
        />
      )}
    </div>
  );
}

export default PERDashboard;
