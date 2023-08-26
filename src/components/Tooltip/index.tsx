import { useRef, useState, useEffect } from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import Popup from '#components/Popup';

import styles from './styles.module.css';

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

            if (isNotDefined(dummyRef.current)) {
                return undefined;
            }

            const {
                current: {
                    parentNode,
                },
            } = dummyRef;

            if (isNotDefined(parentNode)) {
                return undefined;
            }

            parentRef.current = parentNode as HTMLElement;
            parentNode.addEventListener('mouseover', handleMouseEnter);
            parentNode.addEventListener('mouseout', handleMouseOut);
            setHasParentRef(true);

            return () => {
                parentNode.removeEventListener('mouseover', handleMouseEnter);
                parentNode.removeEventListener('mouseout', handleMouseOut);
            };
        },
        [],
    );

    return (
        <>
            {!hasParentRef && (
                <div
                    className={styles.tooltipDummy}
                    ref={dummyRef}
                />
            )}
            {showPopup && (
                <Popup
                    className={className}
                    parentRef={parentRef as React.RefObject<HTMLElement>}
                >
                    {children}
                </Popup>
            )}
        </>
    );
}

export default Tooltip;
