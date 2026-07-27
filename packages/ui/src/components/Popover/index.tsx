import {
    useId,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import Portal from '#components/Portal';

import styles from './styles.module.css';

// The native Popover API (showPopover + popover="manual" top layer) shipped in
// Chromium 114 / Firefox 125 / Safari 17. Where it's unavailable we fall back
// to a Portal so the surface is still rendered (escaping ancestor overflow).
const SUPPORTS_POPOVER = typeof HTMLElement !== 'undefined'
    && typeof HTMLElement.prototype.showPopover === 'function';

export interface Props {
    /**
     * Id for the floating surface. Used by disclosure components
     * (e.g. Dropdown) to wire `aria-controls` from their trigger.
     */
    id?: string;
    className?: string;
    pointerClassName?: string;
    elementRef?: React.RefObject<HTMLDivElement | null>;
    parentRef: React.RefObject<HTMLElement | null>;
    children?: React.ReactNode;
    preferredWidth?: number;
}

function showPopoverSafely(element: HTMLElement | null) {
    // Skip entirely when the Popover API is unavailable (the element is then
    // Portal-rendered without the popover attribute). The isConnected /
    // :popover-open guards also cover React StrictMode's double-invoked effects.
    if (!SUPPORTS_POPOVER || !element || !element.isConnected) {
        return;
    }
    if (!element.matches(':popover-open')) {
        element.showPopover();
    }
}

/**
 * Bare floating surface (generic layer).
 *
 * Rendered in the browser top layer via the native Popover API
 * (`popover="manual"`) and positioned with native CSS Anchor Positioning
 * relative to `parentRef`. Intended for triggers that are HTML elements
 * (buttons, inputs); SVG-embedded overlays (e.g. chart tooltips) should not
 * use this — see `Tooltip`, which positions a Portal with JS instead. The
 * composing component controls open/close by mounting/unmounting it (manual
 * popovers do not light-dismiss). It carries no own ARIA role.
 */
function Popover(props: Props) {
    const {
        id,
        parentRef,
        elementRef,
        children,
        className,
        pointerClassName,
        preferredWidth,
    } = props;

    const generatedId = useId();
    // A valid CSS dashed-ident anchor name (useId may contain ':').
    const anchorName = `--popover-${generatedId.replace(/[^\w-]/g, '')}`;

    const internalContentRef = useRef<HTMLDivElement>(null);
    const contentRef = elementRef ?? internalContentRef;
    const pointerRef = useRef<HTMLDivElement>(null);

    // CSS anchor positioning flips the content box above the trigger when there
    // is no room below; we read that resolved orientation back so the (separate)
    // pointer can sit on the matching side instead of flipping on its own.
    const [isFlipped, setIsFlipped] = useState(false);

    useLayoutEffect(
        () => {
            const parentElement = parentRef.current;
            const contentElement = contentRef.current;
            // Establish the anchor on the trigger so the popover (which lives in
            // the top layer) can position against it via CSS anchor positioning.
            parentElement?.style.setProperty('anchor-name', anchorName);

            // Reveal once on mount; the composing component unmounts to close.
            showPopoverSafely(contentElement);
            showPopoverSafely(pointerRef.current);

            const updateOrientation = () => {
                if (isNotDefined(parentElement) || isNotDefined(contentElement)) {
                    return;
                }
                const parentRect = parentElement.getBoundingClientRect();
                const contentRect = contentElement.getBoundingClientRect();
                // content sits entirely above the trigger => flipped
                setIsFlipped(contentRect.bottom <= parentRect.top + 1);
            };

            updateOrientation();
            window.addEventListener('scroll', updateOrientation, true);
            window.addEventListener('resize', updateOrientation);

            return () => {
                parentElement?.style.removeProperty('anchor-name');
                window.removeEventListener('scroll', updateOrientation, true);
                window.removeEventListener('resize', updateOrientation);
            };
        },
        [parentRef, anchorName, contentRef],
    );

    // CSS custom properties aren't part of the CSSProperties type
    const anchorStyle = {
        '--popover-anchor-name': anchorName,
        '--popover-preferred-width': isDefined(preferredWidth) ? `${preferredWidth}rem` : undefined,
    } as unknown as React.CSSProperties;

    // native top layer when supported; otherwise no popover attribute (so the
    // element is visible) and a Portal is used to escape ancestor overflow.
    const popoverValue = SUPPORTS_POPOVER ? 'manual' : undefined;

    const content = (
        <>
            <div
                popover={popoverValue}
                id={id}
                ref={contentRef}
                style={anchorStyle}
                className={_cs(styles.popup, className)}
            >
                {children}
            </div>
            <div
                popover={popoverValue}
                ref={pointerRef}
                style={anchorStyle}
                className={_cs(styles.pointer, isFlipped && styles.flipped, pointerClassName)}
            >
                <svg
                    className={styles.icon}
                    viewBox="0 0 200 100"
                >
                    <path
                        d="M0 100 L100 0 L200 100Z"
                    />
                </svg>
            </div>
        </>
    );

    if (SUPPORTS_POPOVER) {
        return content;
    }

    return (
        <Portal>
            {content}
        </Portal>
    );
}

export default Popover;
