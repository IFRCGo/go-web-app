import {
    useCallback,
    useEffect,
    useState,
} from 'react';
import { isNotDefined } from '@togglecorp/fujs';

export type Orientation = 'top' | 'bottom';

interface Placement {
    style: React.CSSProperties;
    orientation: Orientation;
}

const defaultPlacement: Placement = {
    style: { position: 'fixed' },
    orientation: 'bottom',
};

/**
 * Minimal fixed-position placement for a floating element next to `parentRef`.
 *
 * Deliberately simple: the element is placed directly below the parent, or
 * above it when there is more room above than below. No horizontal clamping,
 * width sizing, centering or other adjustments.
 */
function useFloatPlacement(parentRef: React.RefObject<HTMLElement | null>) {
    const [placement, setPlacement] = useState<Placement>(defaultPlacement);

    const calculatePlacement = useCallback(
        () => {
            const parent = parentRef.current;
            if (isNotDefined(parent)) {
                return;
            }

            const rect = parent.getBoundingClientRect();
            const showAbove = rect.top > (window.innerHeight - rect.bottom);

            setPlacement({
                orientation: showAbove ? 'top' : 'bottom',
                style: showAbove
                    ? {
                        position: 'fixed',
                        left: rect.left,
                        bottom: window.innerHeight - rect.top,
                    }
                    : {
                        position: 'fixed',
                        left: rect.left,
                        top: rect.bottom,
                    },
            });
        },
        [parentRef],
    );

    useEffect(
        () => {
            // measure-then-position: the initial placement must be computed from
            // the DOM rect on mount, which requires a synchronous setState
            // eslint-disable-next-line react-hooks/set-state-in-effect
            calculatePlacement();
            window.addEventListener('scroll', calculatePlacement, true);
            window.addEventListener('resize', calculatePlacement);

            return () => {
                window.removeEventListener('scroll', calculatePlacement, true);
                window.removeEventListener('resize', calculatePlacement);
            };
        },
        [calculatePlacement],
    );

    return placement;
}

export default useFloatPlacement;
