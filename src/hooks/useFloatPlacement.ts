import { useState, useCallback, useEffect } from 'react';

interface Placement {
    top: string;
    right: string;
    bottom: string;
    left: string;
    transform?: string;
}

const defaultPlacement: Placement = {
    top: 'unset',
    right: 'unset',
    bottom: 'unset',
    left: 'unset',
};

function useFloatPlacement(parentRef: React.RefObject<HTMLElement>, horizontallyCentered = false) {
    const [placement, setPlacement] = useState<Placement>(defaultPlacement);

    const calculatePlacement = useCallback(() => {
        const newPlacement = { ...defaultPlacement };

        if (parentRef.current) {
            const parentBCR = parentRef.current.getBoundingClientRect();
            const {
                x, y, width, height,
            } = parentBCR;

            const cX = window.innerWidth / 2;
            const cY = window.innerHeight / 2;

            const secondQuarterStartX = cX - window.innerWidth / 4;
            const fourthQuarterStartX = cX - window.innerWidth / 4;

            const parentCenterX = parentBCR.x + parentBCR.width / 2;
            const parentCenterY = parentBCR.y + parentBCR.height / 2;

            const horizontalPlacement = (cX - parentCenterX) > 0 ? 'right' : 'left';
            const verticalPlacement = (cY - parentCenterY) > 0 ? 'bottom' : 'top';

            if (horizontalPlacement === 'left') {
                newPlacement.right = `${document.body.clientWidth - x - width}px`;
            } else if (horizontalPlacement === 'right') {
                newPlacement.left = `${x}px`;
            }

            if (verticalPlacement === 'top') {
                newPlacement.bottom = `${window.innerHeight - y}px`;
            } else if (verticalPlacement === 'bottom') {
                newPlacement.top = `${y + height}px`;
            }

            if (horizontallyCentered) {
                const startPlacement = x;
                const endPlacement = document.body.clientWidth - x - width;
                if (horizontalPlacement === 'right' && startPlacement > secondQuarterStartX) {
                    newPlacement.transform = 'translateX(-50%)';
                }

                if (horizontalPlacement === 'left' && endPlacement < fourthQuarterStartX) {
                    newPlacement.transform = 'translateX(50%)';
                }
            }
        }

        setPlacement(newPlacement);
    }, [setPlacement, parentRef, horizontallyCentered]);

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

    return placement;
}

export default useFloatPlacement;
