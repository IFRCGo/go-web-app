import { bound, isDefined, isNotDefined } from '@togglecorp/fujs';
import { useState, useCallback, useEffect } from 'react';

const ONE_REM = parseFloat(getComputedStyle(document.documentElement).fontSize);
// px
const MIN_WIDTH = 16 * ONE_REM;
const VERTICAL_OFFSET = 0.5 * ONE_REM;

type Orientation = {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'right';
};

const defaultOrientation: Orientation = {
    vertical: 'bottom',
    horizontal: 'right',
};

function getPreferredOrientation(position: DOMRect): Orientation {
    const windowCenterX = window.innerWidth / 2;
    const windowCenterY = window.innerHeight / 2;

    const centerX = position.x + position.width / 2;
    const centerY = position.y + position.height / 2;

    return {
        horizontal: centerX < windowCenterX ? 'left' : 'right',
        vertical: centerY < windowCenterY ? 'top' : 'bottom',
    };
}

interface Placement {
    top: string;
    left: string;
    right: string;
    bottom: string;
}

const defaultPlacement: Placement = {
    top: 'unset',
    left: 'unset',
    right: 'unset',
    bottom: 'unset',
};

function useFloatPlacement(
    parentRef: React.RefObject<HTMLElement | undefined>,
    preferredWidth?: number,
) {
    const [placements, setPlacements] = useState<{
        content: Placement,
        pointer: Placement,
        width: string,
        orientation: Orientation,
    }>({
        content: defaultPlacement,
        pointer: defaultPlacement,
        width: 'auto',
        orientation: defaultOrientation,
    });

    const calculatePlacement = useCallback(() => {
        if (isNotDefined(parentRef.current)) {
            return;
        }

        const parentBCR = parentRef.current.getBoundingClientRect();
        const {
            x: parentX,
            y: parentY,
            width: parentWidth,
            height: parentHeight,
        } = parentBCR;

        const horizontalPadding = ONE_REM;
        const minX = horizontalPadding;
        const maxX = window.innerWidth - horizontalPadding;
        const maxWidth = window.innerWidth - 2 * horizontalPadding;

        const orientation = getPreferredOrientation(parentBCR);
        const parentCenterX = parentX + parentWidth / 2;

        const width = bound(
            isDefined(preferredWidth) ? preferredWidth * ONE_REM : parentWidth,
            MIN_WIDTH,
            maxWidth,
        );

        let x1 = parentCenterX - width / 2;
        let x2 = parentCenterX + width / 2;

        if (x1 < minX) {
            const diff = minX - x1 - horizontalPadding;
            x1 = minX;
            x2 += diff;
        }

        if (x2 > maxX) {
            const diff = x2 - maxX - horizontalPadding;
            x2 = maxX;
            x1 -= diff;
        }

        setPlacements({
            content: {
                bottom: orientation.vertical === 'bottom'
                    ? `${window.innerHeight - parentY + VERTICAL_OFFSET}px`
                    : 'unset',
                top: orientation.vertical === 'top'
                    ? `${parentY + parentHeight + VERTICAL_OFFSET}px`
                    : 'unset',
                left: orientation.horizontal === 'left' ? `${x1}px` : 'unset',
                right: orientation.horizontal === 'right' ? `${window.innerWidth - x2}px` : 'unset',
            },
            pointer: {
                left: `${parentCenterX}px`,
                top: orientation.vertical === 'top' ? `${parentY + parentHeight}px` : `${parentY - VERTICAL_OFFSET}px`,
                right: 'unset',
                bottom: 'unset',
            },
            width: `${x2 - x1}px`,
            orientation,
        });
    }, [parentRef, preferredWidth]);

    useEffect(() => {
        calculatePlacement();
        // TODO: throttle and debounce callbacks
        const handleScroll = calculatePlacement;
        const handleResize = calculatePlacement;

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, [calculatePlacement]);

    return placements;
}

export default useFloatPlacement;
