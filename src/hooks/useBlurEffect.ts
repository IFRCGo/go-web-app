import React from 'react';

function useBlurEffect(
    shouldWatch: boolean, // boolean,
    callback: (clickedInside: boolean, e: Event) => void,
    elementRef: React.RefObject<HTMLElement> | React.MutableRefObject<null>,
    parentRef: React.RefObject<HTMLElement> | React.MutableRefObject<null>,
) {
    React.useEffect(() => {
        const handleDocumentClick = (e: Event) => {
            const { current: element } = elementRef;
            const { current: parent } = parentRef;

            const targetNode = e.target as Node | null;

            const isElementOrContainedInElement = e && element
                ? element === e.target || element.contains(targetNode)
                : false;
            const isParentOrContainedInParent = parent
                ? parent === e.target || parent.contains(targetNode)
                : false;

            const clickedInside = isElementOrContainedInElement || isParentOrContainedInParent;
            callback(clickedInside, e);
        };

        if (shouldWatch) {
            document.addEventListener('click', handleDocumentClick);
        } else {
            document.removeEventListener('click', handleDocumentClick);
        }

        return () => { document.removeEventListener('click', handleDocumentClick); };
    }, [shouldWatch, callback, elementRef, parentRef]);
}

export default useBlurEffect;
