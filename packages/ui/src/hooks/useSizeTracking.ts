import {
    useEffect,
    useState,
} from 'react';
import { isDefined } from '@togglecorp/fujs';

function useSizeTracking(ref: React.RefObject<HTMLElement | SVGSVGElement>, disabled = false) {
    const [size, setSize] = useState(() => {
        const bcr = ref.current?.getBoundingClientRect();

        return {
            width: bcr?.width ?? 0,
            height: bcr?.height ?? 0,
        };
    });

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            const entry = entries.at(0);
            const contentRect = entry?.contentRect;

            if (contentRect) {
                // TODO: throttle callback
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

    return size;
}

export default useSizeTracking;
