import React from 'react';

function useBlurEffect(
    shouldWatch: boolean,
    callback: (clickedInside: boolean, clickedInParent: boolean, e: Event) => void,
    elementRef: React.RefObject<HTMLElement>,
    parentRef: React.RefObject<HTMLElement>,
) {
    React.useEffect(() => {
        const handleDocumentClick = (e: Event) => {
            console.info('document click');
            const { current: element } = elementRef;
            const { current: parent } = parentRef;

            // console.info(element, parent);

            const targetNode = e.target as Node | null;

            const isElementOrContainedInElement = e && element
                ? element === e.target || element.contains(targetNode)
                : false;

            const isParentOrContainedInParent = parent
                ? parent === e.target || parent.contains(targetNode)
                : false;

            callback(isElementOrContainedInElement, isParentOrContainedInParent, e);
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
