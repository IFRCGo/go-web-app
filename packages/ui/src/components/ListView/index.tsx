import {
    RefObject,
    useLayoutEffect,
    useRef,
} from 'react';
import { _cs } from '@togglecorp/fujs';

import useSpacingToken from '#hooks/useSpacingToken';
import {
    fullSpacings,
    gapSpacings,
    getSpacingValue,
    SpacingType,
} from '#utils/style';

import styles from './styles.module.css';

// FIXME: move to hooks
function useFallbackRef<T>(ref?: React.Ref<T>) {
    const localRef = useRef<T>(null);

    if (ref && typeof ref !== 'function') {
        return ref as React.RefObject<T | null>;
    }

    return localRef;
}

interface CommonProps extends Omit<React.HTMLProps<HTMLDivElement>, 'ref'> {
    className?: string;
    elementRef?: RefObject<HTMLDivElement | null>;

    spacing?: SpacingType;
    spacingOffset?: number;
    withSpacingOpticalCorrection?: boolean;

    children?: React.ReactNode;
    withPadding?: boolean;
    withFullWidth?: boolean;
    withBackground?: boolean;
    withDarkBackground?: boolean;
    withOverflow?: boolean;
    withGrow?: boolean;
}

interface InlineLayoutProps {
    layout?: 'inline';
    withWrap?: boolean;
    withSpaceBetweenContents?: boolean;
    withCenteredContents?: boolean;
    withStartAlignment?: boolean;

    numPreferredGridColumns?: never;
    minGridColumnSize?: never;
    gridContentClassName?: never;
    withSidebar?: never;
    sidebarPosition?: never;
    sidebarSize?: never;
}

interface BlockLayoutProps {
    layout: 'block';
    withCenteredContents?: boolean;

    withWrap?: never;
    withSpaceBetweenContents?: never;
    numPreferredGridColumns?: never;
    minGridColumnSize?: never;
    gridContentClassName?: never;
    withSidebar?: never;
    sidebarPosition?: never;
    sidebarSize?: never;
    withStartAlignment?: never;
}

interface GridLayoutProps {
    layout: 'grid';
    numPreferredGridColumns?: number;
    minGridColumnSize?: string;
    gridContentClassName?: string;

    withWrap?: never;
    withSpaceBetweenContents?: never;
    withCenteredContents?: never;
    withSidebar?: never;
    sidebarPosition?: never;
    sidebarSize?: never;
    withStartAlignment?: never;
}

interface GridLayoutWithSidebarProps {
    layout: 'grid';
    withSidebar: true,
    sidebarPosition?: 'start' | 'end';
    sidebarSize?: 'xs' | 'sm' | 'md' | 'lg';
    gridContentClassName?: string;

    withWrap?: never;
    numPreferredGridColumns?: never;
    withSpaceBetweenContents?: never;
    withCenteredContents?: never;
    minGridColumnSize?: never;
    withStartAlignment?: never;
}

export type Props = CommonProps & (
InlineLayoutProps
| BlockLayoutProps
| GridLayoutProps
| GridLayoutWithSidebarProps
);

function ListView(props: Props) {
    const {
        className,
        layout = 'inline',
        withWrap,
        withSpaceBetweenContents,
        withCenteredContents,
        withStartAlignment,
        spacing,
        withPadding,
        withBackground,
        withDarkBackground,
        children,
        numPreferredGridColumns = 2,
        minGridColumnSize = '12rem',
        gridContentClassName,
        withSidebar,
        sidebarPosition = 'end',
        sidebarSize = 'md',
        spacingOffset,
        withFullWidth,
        elementRef: elementRefFromProps,
        withSpacingOpticalCorrection = false,
        withOverflow = false,
        withGrow = false,
        ...divElementProps
    } = props;

    const elementRef = useFallbackRef(elementRefFromProps);

    useLayoutEffect(() => {
        if (layout === 'grid') {
            elementRef.current?.style.setProperty(
                '--num-preferred-grid-columns',
                String(numPreferredGridColumns),
            );

            elementRef.current?.style.setProperty(
                '--min-grid-column-size',
                String(minGridColumnSize),
            );

            const paddingPartitions = withPadding ? 2 : 0;
            const gapPartitions = numPreferredGridColumns - 1;
            const numPartitions = paddingPartitions + gapPartitions;
            elementRef.current?.style.setProperty(
                '--reserved-space',
                `calc(${getSpacingValue(spacing)} * ${numPartitions})`,
            );
        }
    }, [numPreferredGridColumns, minGridColumnSize, layout, withPadding, spacing, elementRef]);

    const spacingClassName = useSpacingToken({
        spacing,
        offset: spacingOffset,
        modes: withPadding ? fullSpacings : gapSpacings,
        withoutOpticalCorrection: !withSpacingOpticalCorrection,
    });

    return (
        <div
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...divElementProps}
            ref={elementRef}
            className={_cs(
                styles.listView,
                layout === 'inline' && styles.inlineLayout,
                layout === 'block' && styles.blockLayout,
                layout === 'grid' && styles.gridLayout,
                layout !== 'grid' && spacingClassName,
                withWrap && styles.withWrap,
                withStartAlignment && styles.withStartAlignment,
                withSpaceBetweenContents && styles.withSpaceBetweenContents,
                withCenteredContents && styles.withCenteredContents,
                withFullWidth && styles.withFullWidth,
                withBackground && styles.withBackground,
                withDarkBackground && styles.withDarkBackground,
                withSidebar && styles.withSidebar,
                withOverflow && styles.withOverflow,
                withGrow && styles.withGrow,
                className,
            )}
            role={layout !== 'grid' ? 'list' : undefined}
        >
            {layout === 'grid' && (
                <div
                    className={_cs(
                        styles.gridContent,
                        spacingClassName,
                        gridContentClassName,
                        withSidebar && styles.gridContentWithSidebar,
                        sidebarPosition === 'start' && styles.sidebarPositionStart,
                        sidebarSize === 'xs' && styles.xsSidebar,
                        sidebarSize === 'sm' && styles.smSidebar,
                        sidebarSize === 'md' && styles.mdSidebar,
                        sidebarSize === 'lg' && styles.lgSidebar,
                    )}
                    role="grid"
                >
                    {children}
                </div>
            )}
            {layout !== 'grid' && children}
        </div>
    );
}

export default ListView;
