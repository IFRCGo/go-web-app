import React from 'react';

function useBlurEffect(
    shouldWatch: boolean,
    // NOTE: the api is a bit different
    callback: (clickedInside: boolean, clickedInParent: boolean, e: Event) => void,
    elementRef: React.RefObject<HTMLElement>,
    parentRef: React.RefObject<HTMLElement>,
) {
    React.useEffect(
        () => {
            if (!shouldWatch) {
                return undefined;
            }

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

                callback(isElementOrContainedInElement, isParentOrContainedInParent, e);
            };

            document.addEventListener('click', handleDocumentClick);

            return () => {
                document.removeEventListener('click', handleDocumentClick);
            };
        },
        [shouldWatch, callback, elementRef, parentRef],
    );
}
export default useBlurEffect;
