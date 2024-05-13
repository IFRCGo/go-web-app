import {
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import Container from '#components/Container';
import Popup from '#components/Popup';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    preferredWidth?: number;
}

function Tooltip(props: Props) {
    const {
        className,
        title,
        description,
        preferredWidth,
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
                    className={_cs(styles.tooltipContent, className)}
                    parentRef={parentRef as React.RefObject<HTMLElement>}
                    pointerClassName={styles.pointer}
                    preferredWidth={preferredWidth}
                >
                    <Container
                        heading={title}
                        withInternalPadding
                        contentViewType="vertical"
                    >
                        {description}
                    </Container>
                </Popup>
            )}
        </>
    );
}

export default Tooltip;
