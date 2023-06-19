import { Fragment } from 'react';
import useTranslation from '#hooks/useTranslation';
import InfoPopup from '#components/InfoPopup';
import { resolveToString } from '#utils/translation';

import i18n from './i18n.json';

import styles from './styles.module.css';

function joinList<LIST_ITEM>(
    list: LIST_ITEM[],
    keySelector: (item: LIST_ITEM, i: number) => string | number,
    renderer: (item: LIST_ITEM, i: number) => React.ReactNode,
    separator: React.ReactNode,
) {
    return list.reduce<React.ReactNode[]>(
        (acc, child, index, array) => {
            const itemKey = keySelector(child, index);

            const item = (
                <Fragment key={itemKey}>
                    {renderer(child, index)}
                </Fragment>
            );

            acc.push(item);

            if (index !== array.length - 1) {
                acc.push(
                    <Fragment
                        key={`separator-${itemKey}`}
                    >
                        {separator}
                    </Fragment>,
                );
            }

            return acc;
        },
        [],
    );
}

export interface Props<LIST_ITEM> {
    list?: LIST_ITEM[];
    keySelector: (item: LIST_ITEM, i: number) => string | number;
    renderer: (item: LIST_ITEM, i: number) => React.ReactNode;
    title?: React.ReactNode;
    separator?: React.ReactNode;
    maxItems?: number;
    minItems?: number;
}

function ReducedListDisplay<LIST_ITEM>(props: Props<LIST_ITEM>) {
    const {
        list,
        title,
        renderer,
        keySelector,
        separator = ', ',
        maxItems = 4,
        minItems = 2,
    } = props;

    const strings = useTranslation(i18n);
    if (!list || list.length === 0) {
        return null;
    }

    const allItemList = joinList(list, keySelector, renderer, separator);

    if (list.length <= maxItems) {
        return (
            <div className={styles.reducedListDisplay}>
                {allItemList}
            </div>
        );
    }

    const newList = list.slice(0, minItems);
    const infoLabel = resolveToString(
        strings.reducedListDisplayMoreLabel,
        { n: list.length - minItems },
    );

    const newJoinedList = joinList(newList, keySelector, renderer, separator);

    return (
        <div className={styles.reducedListDisplay}>
            {newJoinedList}
            <InfoPopup
                className={styles.reducedListLabel}
                infoLabel={infoLabel}
                hideIcon
                title={title}
                description={allItemList}
            />
        </div>
    );
}

export default ReducedListDisplay;
