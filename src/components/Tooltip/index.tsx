import { useRef, useState, useEffect } from 'react';

import Popup from '#components/Popup';

interface Props {
    className?: string;
    children?: React.ReactNode;
}

function Tooltip(props: Props) {
    const {
        className,
        children,
    } = props;

    const [hasParentRef, setHasParentRef] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    const parentRef = useRef<HTMLElement>();
    const dummyRef = useRef<HTMLDivElement>(null);

    useEffect(
        () => {
            const handleMouseEnter = () => {
                setShowPopup(true);
            };

            const handleMouseOut = () => {
                setShowPopup(false);
            };

            if (dummyRef.current) {
                const {
                    current: {
                        parentNode,
                    },
                } = dummyRef;

                if (parentNode) {
                    parentRef.current = parentNode as HTMLElement;
                    parentNode.addEventListener('mouseover', handleMouseEnter);
                    parentNode.addEventListener('mouseout', handleMouseOut);
                    setHasParentRef(true);
                }
            }

            return () => {
                const parentNode = parentRef.current;
                if (parentNode) {
                    parentNode.removeEventListener('mouseover', handleMouseEnter);
                    parentNode.removeEventListener('mouseout', handleMouseOut);
                }
            };
        },
        [],
    );

    return (
        <>
            {!hasParentRef && (
                <div
                    ref={dummyRef}
                />
            )}
            {showPopup && (
                <Popup
                    className={className}
                    parentRef={parentRef as React.RefObject<HTMLElement>}
                    horizontallyCentered
                >
                    {children}
                </Popup>
            )}
        </>
    );
}

export default Tooltip;
