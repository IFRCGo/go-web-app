import {
    HTMLProps,
    RefObject,
    useMemo,
} from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import useSpacingToken from '#hooks/useSpacingToken';
import {
    fullSpacings,
    gapSpacings,
    SpacingMode,
    SpacingType,
} from '#utils/style';

import styles from './styles.module.css';

export interface Props extends Omit<HTMLProps<HTMLDivElement>, 'ref' | 'before' | 'after'> {
    elementRef?: RefObject<HTMLDivElement>;
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
    withBeforeSeparator?: boolean;
    withAfterSeparator?: boolean;

    withoutSpacingOpticalCorrection?: boolean;
}

function BlockView(props: Props) {
    const {
        className,
        elementRef,
        before,
        children,
        after,
        beforeContainerClassName,
        childrenContainerClassName,
        afterContainerClassName,
        spacing,
        spacingOffset,
        withPadding,
        withBeforeSeparator,
        withAfterSeparator,
        withoutSpacingOpticalCorrection,

        ...divProps
    } = props;

    const spacingModes = useMemo<SpacingMode[]>(() => {
        if (!withPadding) {
            return gapSpacings;
        }

        return fullSpacings;
    }, [withPadding]);

    const spacingClassName = useSpacingToken({
        spacing,
        modes: spacingModes,
        offset: spacingOffset,
        withoutOpticalCorrection: withoutSpacingOpticalCorrection,
    });

    const innerSpacingClassName = useSpacingToken({
        spacing,
        modes: gapSpacings,
        offset: spacingOffset,
        withoutOpticalCorrection: withoutSpacingOpticalCorrection,
    });

    return (
        <div
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...divProps}
            className={_cs(
                styles.blockLayout,
                spacingClassName,
                className,
            )}
            ref={elementRef}
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
            {withBeforeSeparator && <hr className={styles.separator} />}
            {isDefined(children) && (
                <div
                    className={_cs(
                        styles.children,
                        innerSpacingClassName,
                        childrenContainerClassName,
                    )}
                >
                    {children}
                </div>
            )}
            {withAfterSeparator && <hr className={styles.separator} />}
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

export default BlockView;
