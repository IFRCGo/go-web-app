import {
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import Container from '#components/Container';
import ListView from '#components/ListView';
import Popover from '#components/Popover';

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
 * Renders its content in a Popover with `role="tooltip"`.
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
    const [showPopup, setShowPopup] = useState(false);

    const parentRef = useRef<HTMLElement | null>(null);
    const dummyRef = useRef<HTMLDivElement>(null);

    useEffect(
        () => {
            const handleMouseEnter = () => {
                setShowPopup(true);
            };

            const handleMouseOut = () => {
                setShowPopup(false);
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

    return (
        <>
            {!hasParentRef && (
                <div
                    className={styles.tooltipDummy}
                    ref={dummyRef}
                />
            )}
            {showPopup && (
                <Popover
                    className={_cs(styles.tooltipContent, className)}
                    parentRef={parentRef as React.RefObject<HTMLElement | null>}
                    pointerClassName={styles.pointer}
                    preferredWidth={preferredWidth}
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
                </Popover>
            )}
        </>
    );
}

export default Tooltip;
