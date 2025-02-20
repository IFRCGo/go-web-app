import { useCallback } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import LegendItem, { Props as LegendItemProps } from '#components/LegendItem';
import RawList from '#components/RawList';

import styles from './styles.module.css';

export interface Props<ITEM> {
    className?: string;
    label?: React.ReactNode;
    labelClassName?: string;
    items: ITEM[] | undefined | null;
    itemListContainerClassName?: string;
    keySelector: (item: ITEM) => React.Key;
    colorSelector?: (item: ITEM) => string | undefined;
    labelSelector?: (item: ITEM) => React.ReactNode;
    iconSrcSelector?: (item: ITEM) => string | undefined;
    colorElementClassName?: string;
    iconElementClassName?: string;
    itemClassName?: string;
}

function Legend<ITEM>(props: Props<ITEM>) {
    const {
        className,
        label,
        items,
        keySelector,
        colorSelector,
        labelSelector,
        iconSrcSelector,
        itemClassName,
        iconElementClassName,
        colorElementClassName,
        labelClassName,
        itemListContainerClassName,
    } = props;

    const legendItemRendererParams = useCallback(
        (_: React.Key, item: ITEM): LegendItemProps => ({
            className: itemClassName,
            colorClassName: colorElementClassName,
            label: labelSelector?.(item),
            iconSrc: iconSrcSelector?.(item),
            color: colorSelector?.(item),
            iconClassName: iconElementClassName,
        }),
        [
            colorElementClassName,
            iconElementClassName,
            labelSelector,
            iconSrcSelector,
            colorSelector,
            itemClassName,
        ],
    );

    return (
        <div className={_cs(styles.legend, className)}>
            {isDefined(label) && (
                <div className={_cs(styles.label, labelClassName)}>
                    {label}
                </div>
            )}
            <div className={_cs(styles.legendItems, itemListContainerClassName)}>
                <RawList
                    data={items}
                    renderer={LegendItem}
                    keySelector={keySelector}
                    rendererParams={legendItemRendererParams}
                />
            </div>
        </div>
    );
}

export default Legend;
