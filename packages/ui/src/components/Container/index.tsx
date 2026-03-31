import {
    HTMLProps,
    RefObject,
    useMemo,
} from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import BlockView from '#components/BlockView';
import DefaultMessage from '#components/DefaultMessage';
import Description from '#components/Description';
import Heading, { type Props as HeadingProps } from '#components/Heading';
import InlineView, { Props as InlineViewProps } from '#components/InlineView';
import ListView from '#components/ListView';
import useSpacingToken from '#hooks/useSpacingToken';
import {
    getSpacingValue,
    paddingSpacings,
    SpacingType,
} from '#utils/style';

import styles from './styles.module.css';

export interface Props extends Omit<HTMLProps<HTMLDivElement>, 'ref'>{
    elementRef?: RefObject<HTMLDivElement>;
    className?: string;

    heading?: React.ReactNode;
    withEllipsizedHeading?: boolean;
    headingLevel?: HeadingProps['level'];
    headerDescription?: React.ReactNode;
    headerIcons?: React.ReactNode;
    headerActions?: React.ReactNode;
    withHeaderBorder?: boolean;
    withCenteredHeaderDescription?: boolean;
    withCenteredHeading?: boolean;
    withoutWrapInHeader?: boolean;

    filters?: React.ReactNode;
    children: React.ReactNode;
    withContentOverflow?: boolean;
    withContentWell?: boolean;

    footerIcons?: React.ReactNode;
    footerActions?: React.ReactNode;
    footer?: React.ReactNode;
    withFooterBorder?: boolean;

    // FIXME: these props should be merged
    withoutWrapInFooter?: boolean;
    withLargeBreakpointInHeader?: boolean,

    pending?: boolean;
    overlayPending?: boolean;
    empty?: boolean;
    filtered?: boolean;
    errored?: boolean;
    emptyMessage?: React.ReactNode;
    filteredEmptyMessage?: React.ReactNode;
    errorMessage?: React.ReactNode;
    pendingMessage?: React.ReactNode;
    withoutMessageIcon?: boolean;
    withCompactMessage?: boolean;

    withBackground?: boolean;
    withDarkBackground?: boolean;
    withShadow?: boolean;
    withPadding?: boolean;

    spacing?: SpacingType;
    spacingOffset?: number;
    withoutSpacingOpticalCorrection?: boolean;
    withFixedHeight?: boolean;

    withCenteredContent?: boolean;
}

function Container(props: Props) {
    const {
        className,
        elementRef,

        heading,
        withEllipsizedHeading,
        headingLevel = 3,
        headerIcons,
        headerActions,
        headerDescription,
        withHeaderBorder,
        withCenteredHeading,
        withCenteredHeaderDescription,
        withoutWrapInHeader,
        withLargeBreakpointInHeader,

        filters,

        footerIcons,
        footer,
        footerActions,
        withFooterBorder,
        withoutWrapInFooter,

        children,
        withContentOverflow,
        withContentWell,

        empty = false,
        filtered = false,
        pending = false,
        overlayPending,
        errored = false,
        emptyMessage,
        filteredEmptyMessage,
        pendingMessage,
        errorMessage,
        withoutMessageIcon,
        withCompactMessage,

        withBackground,
        withDarkBackground,
        withShadow,
        withPadding,
        withFixedHeight,
        spacing,
        spacingOffset = 0,
        withoutSpacingOpticalCorrection,

        withCenteredContent,

        ...divProps
    } = props;

    const shouldShowHeadingRow = isDefined(heading)
        || isDefined(headerIcons)
        || isDefined(headerActions);
    const shouldShowHeader = shouldShowHeadingRow
        || isDefined(headerDescription);

    const shouldShowFooter = isDefined(footer)
        || isDefined(footerIcons)
        || isDefined(footerActions);

    const contentSpacingClassName = useSpacingToken({
        spacing,
        offset: spacingOffset,
        modes: paddingSpacings,
        withoutOpticalCorrection: withoutSpacingOpticalCorrection,
    });

    const spacingValue = getSpacingValue(spacing, spacingOffset);

    const overflowChildren = (withContentOverflow && withPadding)
        ? (
            <div
                className={styles.overflowContainer}
                style={{
                    padding: `0 ${spacingValue}`,
                    margin: `0 calc(-1 * ${spacingValue})`,
                }}
            >
                {children}
            </div>
        ) : children;

    const mainContent = (children || empty || pending || errored || filtered) && (
        <>
            <DefaultMessage
                className={styles.message}
                pending={pending}
                filtered={filtered}
                errored={errored}
                empty={empty}
                overlayPending={overlayPending}
                emptyMessage={emptyMessage}
                filteredEmptyMessage={filteredEmptyMessage}
                pendingMessage={pendingMessage}
                errorMessage={errorMessage}
                withoutIcon={withoutMessageIcon}
                compact={withCompactMessage}
            />
            {!empty && !errored && (!pending || overlayPending) && overflowChildren}
        </>
    );

    const headerWrapBreakpoint = useMemo<InlineViewProps['wrapBreakpoint']>(() => {
        if (withoutWrapInHeader) {
            return 'none';
        }

        if (headingLevel > 3) {
            return 'sm';
        }

        if (withLargeBreakpointInHeader) {
            return 'lg';
        }

        return 'md';
    }, [headingLevel, withLargeBreakpointInHeader, withoutWrapInHeader]);

    return (
        <BlockView
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...divProps}
            elementRef={elementRef}
            className={_cs(
                styles.container,
                withBackground && styles.withBackground,
                withDarkBackground && styles.withDarkBackground,
                withShadow && styles.withShadow,
                withContentWell && styles.withContentWell,
                withFixedHeight && styles.withFixedHeight,
                withCenteredContent && styles.withCenteredContent,
                className,
            )}
            spacing={spacing}
            spacingOffset={spacingOffset}
            withoutSpacingOpticalCorrection={withoutSpacingOpticalCorrection}
            withPadding={withPadding}
            before={shouldShowHeader && (
                <ListView
                    spacing={spacing}
                    spacingOffset={spacingOffset}
                    layout="block"
                    withSpacingOpticalCorrection
                >
                    {shouldShowHeadingRow && (
                        <InlineView
                            spacing={spacing}
                            spacingOffset={spacingOffset - 1}
                            withoutSpacingOpticalCorrection={withoutSpacingOpticalCorrection}
                            wrapBreakpoint={headerWrapBreakpoint}
                            before={headerIcons}
                            after={headerActions && (
                                <ListView
                                    spacing={spacing}
                                    spacingOffset={spacingOffset - 1}
                                    withSpacingOpticalCorrection={!withoutSpacingOpticalCorrection}
                                >
                                    {headerActions}
                                </ListView>
                            )}
                        >
                            <Heading
                                level={headingLevel}
                                ellipsize={withEllipsizedHeading}
                                centerAligned={withCenteredHeading}
                            >
                                {heading}
                            </Heading>
                        </InlineView>
                    )}
                    {headerDescription && (
                        <Description withCenteredContent={withCenteredHeaderDescription}>
                            {headerDescription}
                        </Description>
                    )}
                </ListView>
            )}
            after={shouldShowFooter && (
                <InlineView
                    spacing={spacing}
                    spacingOffset={spacingOffset}
                    withoutSpacingOpticalCorrection={withoutSpacingOpticalCorrection}
                    before={footerIcons}
                    after={footerActions}
                    wrapBreakpoint={withoutWrapInFooter ? 'none' : 'lg'}
                >
                    {footer}
                </InlineView>
            )}
            withBeforeSeparator={withHeaderBorder}
            withAfterSeparator={withFooterBorder}
            childrenContainerClassName={_cs(
                styles.content,
                overlayPending && styles.pendingOverlaid,
                withContentOverflow && styles.withOverflow,
                withPadding && withContentOverflow && styles.withPaddingOverflow,
                withContentWell && contentSpacingClassName,
            )}
        >
            {isDefined(filters) && (
                <ListView
                    layout="block"
                    spacing={spacing}
                    spacingOffset={spacingOffset}
                >
                    <ListView
                        gridContentClassName={styles.filters}
                        layout="grid"
                        numPreferredGridColumns={6}
                        spacing={spacing}
                        spacingOffset={spacingOffset - 1}
                    >
                        {filters}
                    </ListView>
                    {mainContent}
                </ListView>
            )}
            {isNotDefined(filters) && mainContent}
        </BlockView>
    );
}

export default Container;
