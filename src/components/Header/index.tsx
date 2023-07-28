import { _cs } from '@togglecorp/fujs';

import Heading, { Props as HeadingProps } from '#components/Heading';
import useBasicLayout from '#hooks/useBasicLayout';
import type { SpacingType } from '#components/types';

import styles from './styles.module.css';

const spacingTypeToClassNameMap: Record<SpacingType, string> = {
    none: styles.noSpacing,
    compact: styles.compactSpacing,
    cozy: styles.cozySpacing,
    comfortable: styles.comfortableSpacing,
    relaxed: styles.relaxedSpacing,
    loose: styles.looseSpacing,
};

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
        spacing = 'comfortable',
    } = props;

    const headingComp = heading ? (
        <Heading
            level={headingLevel}
            className={_cs(styles.heading, headingClassName)}
        >
            {ellipsizeHeading ? (
                <div
                    className={styles.overflowWrapper}
                    title={typeof heading === 'string' ? heading : undefined}
                >
                    {heading}
                </div>
            ) : heading}
        </Heading>
    ) : undefined;

    const {
        content,
        containerClassName,
    } = useBasicLayout({
        actions,
        actionsContainerClassName,
        children: (
            <>
                {headingComp}
                {headingDescription && (
                    <div
                        className={_cs(
                            styles.headingDescription,
                            headingDescriptionContainerClassName,
                        )}
                    >
                        {headingDescription}
                    </div>
                )}
            </>
        ),
        childrenContainerClassName: _cs(styles.headingContainer, headingContainerClassName),
        className: headingSectionClassName,
        icons,
        iconsContainerClassName,
        noWrap: !wrapHeadingContent,
    });

    if (!content && !children) {
        return null;
    }

    return (
        <div
            className={_cs(
                styles.header,
                spacingTypeToClassNameMap[spacing],
                ellipsizeHeading && styles.headingEllipsized,
                className,
            )}
            ref={elementRef}
        >
            {content && (
                <div className={_cs(styles.headingSection, containerClassName)}>
                    {content}
                </div>
            )}
            {children && (
                <div className={_cs(styles.description, childrenContainerClassName)}>
                    {children}
                </div>
            )}
        </div>
    );
}

export default Header;
