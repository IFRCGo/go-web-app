import React from 'react';

const defaultPlacement = {
    top: 'unset',
    right: 'unset',
    bottom: 'unset',
    left: 'unset',
};

function useFloatPlacement(parentRef: React.RefObject<HTMLElement>) {
    const [placement, setPlacement] = React.useState(defaultPlacement);

    const calculatePlacement = React.useCallback(() => {
        const newPlacement = { ...defaultPlacement };

        if (parentRef.current) {
            const parentBCR = parentRef.current.getBoundingClientRect();
            const {
                x, y, width, height,
            } = parentBCR;

            const cX = window.innerWidth / 2;
            const cY = window.innerHeight / 2;

            const horizontalPosition = (cX - parentBCR.x) > 0 ? 'right' : 'left';
            const verticalPosition = (cY - parentBCR.y) > 0 ? 'bottom' : 'top';

            if (horizontalPosition === 'left') {
                newPlacement.right = `${document.body.clientWidth - x - width}px`;
            } else if (horizontalPosition === 'right') {
                newPlacement.left = `${x}px`;
            }

            if (verticalPosition === 'top') {
                newPlacement.bottom = `${window.innerHeight - y}px`;
            } else if (verticalPosition === 'bottom') {
                newPlacement.top = `${y + height}px`;
            }
        }

        setPlacement(newPlacement);
    }, [setPlacement, parentRef]);

    React.useEffect(() => {
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
