import React from 'react';
import Header from '#components/Header';
import TopBanner from '#components/TopBanner';

import styles from './styles.module.scss';

function TopBannerExample() {
  return (
    <div className={styles.topBanner}>
      <Header
        heading="TOP BANNER COLLECTION"
        headingSize="medium"
      />
      <Header
        heading="SUCCESS ALERT"
        headingSize="small"
      />
      <TopBanner
        variant="positive"
        children="This is banner for Success message"
      />
      <Header
        heading="DANGER ALERT WITH ERROR MESSAGE"
        headingSize="small"
      />
      <TopBanner
        variant="negative"
        children="This is banner for Danger message"
      />
      <Header
        heading="INFO ALERT"
        headingSize="small"
      />
      <TopBanner
        variant="information"
        children="This is banner for Info message"
      />
      <Header
        heading="WARNING ALERT"
        headingSize="small"
      />
      <TopBanner
        variant="warning"
        children="This is banner for Warning message"
      />
    </div>
  );
}

export default TopBannerExample;
