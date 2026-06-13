import { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

import {
    fullSpacings,
    gapSpacings,
    getSpacingClassName,
    SpacingMode,
    SpacingType,
} from '#utils/style';

import styles from './styles.module.css';

export interface Props extends Omit<React.HTMLProps<HTMLDivElement>, 'ref' | 'before' | 'after' | 'name' | 'value' | 'onClick'> {
    /** Ref to the root DOM node */
    elementRef?: React.RefObject<HTMLDivElement | null>;
    className?: string;

    before?: React.ReactNode;
    beforeContainerClassName?: string;
    children?: React.ReactNode;
    childrenContainerClassName?: string;
    after?: React.ReactNode;
    afterContainerClassName?: string;

    spacing?: SpacingType;
    spacingOffset?: number;
    withPadding?: boolean;
    withoutSpacingOpticalCorrection?: boolean;
    withAdditionalInlinePadding?: boolean;
    withEllipsizedContent?: boolean;

    contentAlignment?: 'start' | 'center' | 'end';
    contentJustification?: 'start' | 'center' | 'end';
    withInlineDisplay?: boolean;
}

/**
 * Horizontal before/children/after row with spec-driven spacing
 * (generic layer).
 */
function InlineLayout(props: Props) {
    const {
        className,
        elementRef,
        before,
        beforeContainerClassName,
        children,
        childrenContainerClassName,
        after,
        afterContainerClassName,
        spacing,
        spacingOffset,
        withPadding,
        withoutSpacingOpticalCorrection,
        withAdditionalInlinePadding,
        withEllipsizedContent,
        contentAlignment = 'center',
        withInlineDisplay,

        ...divProps
    } = props;

    const spacingModes = useMemo<SpacingMode[]>(() => {
        if (!withPadding) {
            return gapSpacings;
        }

        return fullSpacings;
    }, [withPadding]);

    const spacingClassName = getSpacingClassName({
        spacing,
        modes: spacingModes,
        offset: spacingOffset ?? 0,
        withAdditionalInlinePadding,
        withoutOpticalCorrection: withoutSpacingOpticalCorrection,
    });

    const innerSpacingClassName = getSpacingClassName({
        spacing,
        modes: gapSpacings,
        offset: spacingOffset ?? 0,
        withoutOpticalCorrection: withoutSpacingOpticalCorrection,
    });

    return (
        <div
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...divProps}
            ref={elementRef}
            className={_cs(
                styles.inlineLayout,
                spacingClassName,
                contentAlignment === 'start' && styles.startAlignedContent,
                contentAlignment === 'end' && styles.endAlignedContent,
                withInlineDisplay && styles.withInlineDisplay,
                className,
            )}
        >
            {before && (
                <div
                    className={_cs(
                        styles.beforeContent,
                        innerSpacingClassName,
                        beforeContainerClassName,
                    )}
                >
                    {before}
                </div>
            )}
            {/* FIXME: remove unnecessary gap when children is empty */}
            <div
                className={_cs(
                    styles.children,
                    innerSpacingClassName,
                    childrenContainerClassName,
                    withEllipsizedContent && styles.ellipsized,
                )}
            >
                {children}
            </div>
            {after && (
                <div
                    className={_cs(
                        styles.afterContent,
                        afterContainerClassName,
                        innerSpacingClassName,
                    )}
                >
                    {after}
                </div>
            )}
        </div>
    );
}

export default InlineLayout;
