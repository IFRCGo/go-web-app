import {
    useEffect,
    useState,
} from 'react';
import { isDefined } from '@togglecorp/fujs';

import useDebouncedValue from '#hooks/useDebouncedValue';

function useSizeTracking(
    ref: React.RefObject<HTMLElement | SVGSVGElement | null>,
    disabled = false,
) {
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            const entry = entries.at(0);
            const contentRect = entry?.contentRect;

            if (contentRect) {
                setSize({
                    width: contentRect.width,
                    height: contentRect.height,
                });
            }
        });

        const el = ref.current;
        if (!disabled && isDefined(el)) {
            resizeObserver.observe(el);
        }

        return () => {
            if (!disabled && isDefined(el)) {
                resizeObserver.unobserve(el);
            }
        };
    }, [disabled, ref]);

    return useDebouncedValue(size);
}

export default useSizeTracking;
