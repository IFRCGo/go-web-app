import { Fragment, useCallback } from 'react';

import useTranslation from '#hooks/useTranslation';
import InfoPopup from '#components/InfoPopup';
import { resolveToString } from '#utils/translation';

import i18n from './i18n.json';

import styles from './styles.module.css';

export interface Props {
    value?: React.ReactNode[];
    title?: React.ReactNode;
    joinBy?: React.ReactNode;
}

function ReducedListDisplay(props: Props) {
    const {
        value,
        title,
        joinBy = ', ',
    } = props;

    const strings = useTranslation(i18n);
    const reducer = useCallback(
        (prev: React.ReactNode | undefined, current: React.ReactNode, i: number) => {
            if (!prev) {
                return (
                    // eslint-disable-next-line react/no-array-index-key
                    <Fragment key={i}>
                        {current}
                    </Fragment>
                );
            }

            return (
                // eslint-disable-next-line react/no-array-index-key
                <Fragment key={i}>
                    {prev}
                    {joinBy}
                    {current}
                </Fragment>
            );
        },
        [joinBy],
    );

    if (!value || value.length === 0) {
        return null;
    }

    const allJoinedList = value.reduce(reducer);
    const maxItemsToShow = 3;
    if (value.length <= maxItemsToShow) {
        return (
            <div>
                {allJoinedList}
            </div>
        );
    }

    const itemsToShowIfMaxExceeded = 2;

    const newList = value.slice(0, itemsToShowIfMaxExceeded);
    const infoLabel = resolveToString(
        strings.reducedListDisplayMoreLabel,
        { n: value.length - itemsToShowIfMaxExceeded },
    );

    const newJoinedList = newList.reduce(reducer);

    return (
        <div>
            {newJoinedList}
            <InfoPopup
                className={styles.reducedListLabel}
                infoLabel={infoLabel}
                hideIcon
                title={title}
                description={allJoinedList}
            />
        </div>
    );
}

export default ReducedListDisplay;
