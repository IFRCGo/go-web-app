import React from 'react';

import useTranslation from '#hooks/useTranslation';
import InfoPopup from '#components/InfoPopup';
import { resolveToString } from '#utils/common';

import i18n from './i18n.json';

import styles from './styles.module.scss';

interface Props {
  value?: string[];
  title?: React.ReactNode;
}

export function ReducedListDisplay(props: Props) {
  const {
    value,
    title,
  } = props;

  const strings = useTranslation(i18n);

  if (!value) {
    return null;
  }

  if (value.length < 4) {
    return (
      <>
        {value.join(', ')}
      </>
    );
  }

  const newList = value.slice(0, 2);
  const infoLabel = resolveToString(
    strings.reducedListDisplayMoreLabel,
    { n: value.length - 2 },
  );

  return (
    <>
      {newList.join(', ')}
      <InfoPopup
        className={styles.reducedListLabel}
        infoLabel={infoLabel}
        hideIcon
        title={title}
        description={value.join(', ')}
      />
    </>
  );
}

export default ReducedListDisplay;
