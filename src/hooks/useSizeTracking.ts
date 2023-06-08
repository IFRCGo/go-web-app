import { useEffect, useState } from 'react';

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
                // TODO: throttle
                setSize({
                    width: contentRect.width,
                    height: contentRect.height,
                });
            }
        });

        const el = ref.current;
        if (!disabled && el) {
            resizeObserver.observe(ref.current);
        }

        return () => {
            if (el) {
                resizeObserver.unobserve(el);
            }
        };
    }, [disabled, ref]);

    return size;
}

export default useSizeTracking;
