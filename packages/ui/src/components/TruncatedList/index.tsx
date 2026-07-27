import {
    Fragment,
    useId,
} from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import RawButton from '#components/RawButton';
import useBooleanState from '#hooks/useBooleanState';
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
    leadingSeparator = false,
) {
    return list.reduce<React.ReactNode[]>(
        (acc, child, index) => {
            const itemKey = keySelector(child, index);

            if (leadingSeparator || index !== 0) {
                acc.push(
                    <Fragment key={`separator-${itemKey}`}>
                        {separator}
                    </Fragment>,
                );
            }

            const Component = renderer;
            acc.push(
                <Component
                    key={itemKey}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rendererParams(child, index)}
                />,
            );

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
    className?: string;
}

/**
 * TruncatedList renders a list inline, collapsing everything past `minItems`
 * behind a "+N more" disclosure once the list is longer than `maxItems`.
 * Specific layer: the full list is always mounted in the DOM (the remainder is
 * collapsed via CSS, not unmounted) and the reveal is a real `<button>` with
 * `aria-expanded`/`aria-controls`, so it is keyboard- and screen-reader-friendly.
 */
function TruncatedList<LIST_ITEM, RENDERER_PROPS>(props: Props<LIST_ITEM, RENDERER_PROPS>) {
    const {
        list,
        title,
        renderer,
        rendererParams,
        keySelector,
        separator = ', ',
        maxItems = 4,
        minItems = 2,
        className,
    } = props;

    const strings = useTranslation(i18n);
    const remainderId = useId();
    const [
        expanded,
        { toggle: toggleExpanded },
    ] = useBooleanState(false);

    if (isNotDefined(list) || list.length === 0) {
        return null;
    }

    if (list.length <= maxItems) {
        return (
            <div className={_cs(styles.truncatedList, className)}>
                {joinList(list, keySelector, renderer, rendererParams, separator)}
            </div>
        );
    }

    const inlineList = list.slice(0, minItems);
    const remainderList = list.slice(minItems);

    const remainderCount = remainderList.length;
    const showMoreLabel = resolveToString(
        strings.truncatedListShowMoreLabel,
        { n: remainderCount },
    );
    const toggleAriaLabel = expanded
        ? strings.truncatedListShowLessAriaLabel
        : resolveToString(
            strings.truncatedListShowMoreAriaLabel,
            { n: remainderCount },
        );

    return (
        <div className={_cs(styles.truncatedList, className)}>
            {joinList(inlineList, keySelector, renderer, rendererParams, separator)}
            <RawButton
                name={undefined}
                className={styles.toggleButton}
                onClick={toggleExpanded}
                aria-expanded={expanded}
                aria-controls={remainderId}
                aria-label={toggleAriaLabel}
            >
                {showMoreLabel}
            </RawButton>
            {/* NOTE: the remainder is always mounted; it is collapsed via CSS
              * (not unmounted) so assistive tech can reach it and the reveal
              * stays a pure disclosure rather than a mount-on-open popover. */}
            <div
                id={remainderId}
                className={_cs(
                    styles.remainder,
                    expanded && styles.expanded,
                )}
            >
                {isNotDefined(title) ? null : (
                    <div className={styles.title}>
                        {title}
                    </div>
                )}
                <div className={styles.remainderList}>
                    {joinList(
                        remainderList,
                        keySelector,
                        renderer,
                        rendererParams,
                        separator,
                        true,
                    )}
                </div>
            </div>
        </div>
    );
}

export default TruncatedList;
