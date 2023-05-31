import React from 'react';

import useTranslation from '#hooks/useTranslation';
import InfoPopup from '#components/InfoPopup';
import { resolveToString } from '#utils/translation';

import i18n from './i18n.json';

import styles from './styles.module.css';

export interface Props {
    value?: string[];
    title?: React.ReactNode;
}

function ReducedListDisplay(props: Props) {
    const {
        value,
        title,
    } = props;

    const strings = useTranslation(i18n);

    if (!value) {
        return null;
    }

    const maxItemsToShow = 3;
    if (value.length <= maxItemsToShow) {
        return (
            <div>
                {value.join(', ')}
            </div>
        );
    }

    const itemsToShowIfMaxExceeded = 2;

    const newList = value.slice(0, itemsToShowIfMaxExceeded);
    const infoLabel = resolveToString(
        strings.reducedListDisplayMoreLabel,
        { n: value.length - itemsToShowIfMaxExceeded },
    );

    return (
        <div>
            {newList.join(', ')}
            <InfoPopup
                className={styles.reducedListLabel}
                infoLabel={infoLabel}
                hideIcon
                title={title}
                description={value.join(', ')}
            />
        </div>
    );
}

export default ReducedListDisplay;
