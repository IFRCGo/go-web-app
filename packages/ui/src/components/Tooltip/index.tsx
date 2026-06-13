import {
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import Container from '#components/Container';
import ListView from '#components/ListView';
import Portal from '#components/Portal';
import useFloatPlacement from '#hooks/useFloatPlacement';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    preferredWidth?: number;
}

/**
 * Hover-triggered tooltip attached to its parent element (specific layer).
 *
 * Deliberately simpler than `Popover`: it renders a Portal positioned with
 * `useFloatPlacement` (JS) rather than the native Popover API. That keeps the
 * surface in the HTML namespace and uses `getBoundingClientRect`, so a Tooltip
 * placed inside an `<svg>` (e.g. a chart point) works — where the native
 * Popover API (HTMLElement-only) and CSS anchor positioning do not.
 */
// FIXME(a11y-tier2): tooltip is hover-only; add keyboard/focus trigger and
// `aria-describedby` wiring from the parent control to the tooltip content.
function Tooltip(props: Props) {
    const {
        className,
        title,
        description,
        preferredWidth,
    } = props;

    const [hasParentRef, setHasParentRef] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    const parentRef = useRef<HTMLElement | null>(null);
    const dummyRef = useRef<HTMLDivElement>(null);

    useEffect(
        () => {
            const handleMouseEnter = () => {
                setShowTooltip(true);
            };

            const handleMouseOut = () => {
                setShowTooltip(false);
            };

            if (isNotDefined(dummyRef.current)) {
                return undefined;
            }

            const {
                current: {
                    parentNode,
                },
            } = dummyRef;

            if (isNotDefined(parentNode)) {
                return undefined;
            }

            parentRef.current = parentNode as HTMLElement;
            parentNode.addEventListener('mouseover', handleMouseEnter);
            parentNode.addEventListener('mouseout', handleMouseOut);
            // FIXME(frozenhelium): setState on mount signals parent DOM is available
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setHasParentRef(true);

            return () => {
                parentNode.removeEventListener('mouseover', handleMouseEnter);
                parentNode.removeEventListener('mouseout', handleMouseOut);
            };
        },
        [],
    );

    const {
        style,
        orientation,
    } = useFloatPlacement(parentRef);

    return (
        <>
            {!hasParentRef && (
                <div
                    className={styles.tooltipDummy}
                    ref={dummyRef}
                />
            )}
            {showTooltip && (
                <Portal>
                    <div
                        style={{
                            ...style,
                            width: isDefined(preferredWidth) ? `${preferredWidth}rem` : undefined,
                        }}
                        className={_cs(
                            styles.tooltipContent,
                            orientation === 'bottom' && styles.topOrientation,
                            className,
                        )}
                    >
                        <Container
                            role="tooltip"
                            heading={title}
                            withPadding
                        >
                            <ListView
                                layout="block"
                                withSpacingOpticalCorrection
                                spacing="sm"
                            >
                                {description}
                            </ListView>
                        </Container>
                    </div>
                </Portal>
            )}
        </>
    );
}

export default Tooltip;
