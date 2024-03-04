import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import {
    type SpacingType,
    type SpacingVariant,
} from '#components/types';
import useSpacingTokens from '#hooks/useSpacingTokens';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    icons?: React.ReactNode;
    children: React.ReactNode;
    actions?: React.ReactNode;
    description?: React.ReactNode;
    iconsContainerClassName?: string;
    childrenContainerClassName?: string;
    actionsContainerClassName?: string;
    spacing?: SpacingType;
    variant?: SpacingVariant;
    withoutWrap?: boolean;
}

function useBasicLayout(props: Props) {
    const {
        className,
        icons,
        children,
        actions,
        iconsContainerClassName,
        childrenContainerClassName,
        actionsContainerClassName,
        withoutWrap,
        spacing = 'default',
        variant = 'md',
    } = props;

    const gapSpacing = useSpacingTokens({
        spacing,
        variant,
        mode: 'gap',
    });

    const innerGapSpacing = useSpacingTokens({
        spacing,
        variant,
        mode: 'gap',
        inner: true,
    });

    const containerClassName = _cs(
        styles.basicLayout,
        !withoutWrap && styles.withWrap,
        gapSpacing,
        className,
    );

    const emptyContent = isNotDefined(icons)
            && isNotDefined(children)
            && isNotDefined(actions);

    const content = emptyContent ? null : (
        <>
            {icons && (
                <div
                    className={_cs(
                        styles.iconsContainer,
                        innerGapSpacing,
                        iconsContainerClassName,
                    )}
                >
                    {icons}
                </div>
            )}
            <div
                className={_cs(
                    styles.childrenContainer,
                    innerGapSpacing,
                    childrenContainerClassName,
                )}
            >
                {children}
            </div>
            {actions && (
                <div
                    className={_cs(
                        styles.actionsContainer,
                        innerGapSpacing,
                        actionsContainerClassName,
                    )}
                >
                    {actions}
                </div>
            )}
        </>
    );

    return {
        containerClassName,
        content,
    };
}

export default useBasicLayout;
