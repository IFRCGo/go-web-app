import React from 'react';

import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';
import Spinner from '#components/Spinner';

interface Props {
    className?: string;
}

function BlockLoading(props: Props) {
  const { className } = props;

  return (
    <div className={_cs(className, styles.blockLoading)}>
      <Spinner />
    </div>
  );
}

export default BlockLoading;
