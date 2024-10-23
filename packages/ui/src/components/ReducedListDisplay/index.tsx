import { Fragment } from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import InfoPopup from '#components/InfoPopup';
import useTranslation from '#hooks/useTranslation';
import { resolveToString } from '#utils/translation';

import i18n from './i18n.json';
import styles from './styles.module.css';

function joinList<LIST_ITEM, RENDERER_PROPS>(
    list: LIST_ITEM[],
    keySelector: (item: LIST_ITEM, i: number) => string | number,
    renderer: React.ComponentType<RENDERER_PROPS>,
    rendererParams: (item: LIST_ITEM, i: number) => RENDERER_PROPS,
    separator: React.ReactNode,
) {
    return list.reduce<React.ReactNode[]>(
        (acc, child, index, array) => {
            const itemKey = keySelector(child, index);

            const Component = renderer;
            const item = (
                <Component
                    key={itemKey}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rendererParams(child, index)}
                />
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

export interface Props<LIST_ITEM, RENDERER_PROPS> {
    list?: LIST_ITEM[];
    keySelector: (item: LIST_ITEM, i: number) => string | number;
    renderer: React.ComponentType<RENDERER_PROPS>
    rendererParams: (item: LIST_ITEM, i: number) => RENDERER_PROPS;
    title?: React.ReactNode;
    separator?: React.ReactNode;
    maxItems?: number;
    minItems?: number;
}

function ReducedListDisplay<LIST_ITEM, RENDERER_PROPS>(props: Props<LIST_ITEM, RENDERER_PROPS>) {
    const {
        list,
        title,
        renderer,
        rendererParams,
        keySelector,
        separator = ', ',
        maxItems = 4,
        minItems = 2,
    } = props;

    const strings = useTranslation(i18n);
    if (isNotDefined(list) || list.length === 0) {
        return null;
    }

    const allItemList = joinList(list, keySelector, renderer, rendererParams, separator);

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

    const newJoinedList = joinList(newList, keySelector, renderer, rendererParams, separator);

    return (
        <div className={styles.reducedListDisplay}>
            {newJoinedList}
            <InfoPopup
                className={styles.reducedListLabel}
                infoLabel={infoLabel}
                withoutIcon
                title={title}
                description={(
                    <div>
                        {allItemList}
                    </div>
                )}
            />
        </div>
    );
}

export default ReducedListDisplay;
