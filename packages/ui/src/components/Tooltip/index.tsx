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
import ListView from '#components/ListView';
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
            const handleShow = () => {
                setShowPopup(true);
            };

            const handleHide = () => {
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
            parentNode.addEventListener('mouseover', handleShow);
            parentNode.addEventListener('mouseout', handleHide);
            parentNode.addEventListener('focusin', handleShow);
            parentNode.addEventListener('focusout', handleHide);
            setHasParentRef(true);

            return () => {
                parentNode.removeEventListener('mouseover', handleShow);
                parentNode.removeEventListener('mouseout', handleHide);
                parentNode.removeEventListener('focusin', handleShow);
                parentNode.removeEventListener('focusout', handleHide);
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
                    role="tooltip"
                >
                    <Container
                        heading={title}
                        withPadding
                    >
                        <ListView
                            layout="block"
                            withSpacingOpticalCorrection
                            spacing="sm"
                        >
                            {description}
                        </ListView>
                    </Container>
                </Popup>
            )}
        </>
    );
}

export default Tooltip;
