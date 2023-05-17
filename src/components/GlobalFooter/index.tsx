import React from 'react';
import { _cs } from '@togglecorp/fujs';
import Heading from '#components/Heading';
import Button from '#components/Button';
import PageContainer from '#components/PageContainer';

import styles from './styles.module.css';

interface Props {
  className?: string;
}

function GlobalFooter(props: Props) {
  const {
    className,
  } = props;

  return (
    <PageContainer
      className={_cs(styles.footer, className)}
      contentClassName={styles.content}
    >
      <div className={styles.about}>
        <Heading>
          About
        </Heading>
        <div className={styles.description}>
          IFRC GO is a Red Cross Red Crescent platform to connect information on emergency needs with the right response.
        </div>
        <div className={styles.copyright}>
          © IFRC 2023 v6.5.4
        </div>
      </div>
      <div className={styles.findMore}>
        <Heading>
          Find out more
        </Heading>
        <div className={styles.findMoreLinks}>
          <div>
            ifrc.org
          </div>
          <div>
            rcrcsims.org
          </div>
          <div>
            data.ifrc.org
          </div>
        </div>
      </div>
      <div className={styles.helpfulLink}>
        <Heading>
          Helpful links
        </Heading>
        <div className={styles.links}>
          <div>
            Open Source Code
          </div>
          <div>
            API Documentation
          </div>
          <div>
            Other Resources
          </div>
        </div>
      </div>
      <div className={styles.contact}>
        <Heading>
          Contact Us
        </Heading>
        <Button name={undefined}>
          im@ifrc.org
        </Button>
      </div>
    </PageContainer>
  );
}

export default GlobalFooter;
