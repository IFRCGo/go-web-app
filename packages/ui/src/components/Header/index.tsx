import { useMemo } from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import Heading, { Props as HeadingProps } from '#components/Heading';
import type { SpacingType } from '#components/types';
import useBasicLayout from '#hooks/useBasicLayout';
import useSpacingTokens from '#hooks/useSpacingTokens';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    elementRef?: React.Ref<HTMLDivElement>;
    ellipsizeHeading?: boolean;

    actions?: React.ReactNode;
    actionsContainerClassName?: string;

    children?: React.ReactNode;
    childrenContainerClassName?: string;

    heading: React.ReactNode;
    headingLevel?: HeadingProps['level'];
    headingSectionClassName?: string;
    headingContainerClassName?: string;
    headingClassName?: string;

    headingDescription?: React.ReactNode;
    headingDescriptionContainerClassName?: string;

    icons?: React.ReactNode;
    iconsContainerClassName?: string;

    wrapHeadingContent?: boolean;
    spacing?: SpacingType;
}

function Header(props: Props) {
    const {
        actions,
        actionsContainerClassName,
        children,
        childrenContainerClassName,
        className,
        elementRef,
        ellipsizeHeading,
        heading,
        headingClassName,
        headingLevel,
        headingDescription,
        headingDescriptionContainerClassName,
        icons,
        iconsContainerClassName,
        headingSectionClassName,
        headingContainerClassName,
        wrapHeadingContent = false,
        spacing = 'default',
    } = props;

    const headingChildren = useMemo(
        () => {
            if (isNotDefined(heading) && isNotDefined(headingDescription)) {
                return null;
            }

            return (
                <>
                    <Heading
                        level={headingLevel}
                        className={headingClassName}
                        ellipsize={ellipsizeHeading}
                    >
                        {heading}
                    </Heading>
                    {headingDescription && (
                        <div className={headingDescriptionContainerClassName}>
                            {headingDescription}
                        </div>
                    )}
                </>
            );
        },
        [
            heading,
            ellipsizeHeading,
            headingDescription,
            headingClassName,
            headingDescriptionContainerClassName,
            headingLevel,
        ],
    );

    const {
        content,
        containerClassName,
    } = useBasicLayout({
        actions,
        actionsContainerClassName,
        children: headingChildren,
        childrenContainerClassName: headingContainerClassName,
        className: headingSectionClassName,
        icons,
        iconsContainerClassName,
        withoutWrap: !wrapHeadingContent,
        spacing,
        variant: 'sm',
    });

    const gapSpacing = useSpacingTokens({
        spacing,
        inner: true,
    });

    if (!content && !children) {
        return null;
    }

    return (
        <div
            className={_cs(
                styles.header,
                gapSpacing,
                className,
            )}
            ref={elementRef}
        >
            {content && (
                <div className={containerClassName}>
                    {content}
                </div>
            )}
            {children && (
                <div className={childrenContainerClassName}>
                    {children}
                </div>
            )}
        </div>
    );
}

export default Header;
