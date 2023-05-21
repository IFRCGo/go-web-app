import {
    useRef,
    useEffect,
    useState,
} from 'react';
import { _cs } from '@togglecorp/fujs';

import Container, { Props as ContainerProps } from '#components/Container';
import Popup from '#components/Popup';

import styles from './styles.module.css';

interface Props extends ContainerProps {
    containerClassName?: string;
}

function Tooltip(props: Props) {
    const {
        className,
        containerClassName,
        ...otherProps
    } = props;

    const [showPopup, setShowPopup] = useState(false);
    const dummyRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLElement>(null);
    const parentRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (dummyRef.current) {
            parentRef.current = dummyRef.current.parentNode;
        }

        const handleMouseOver = () => {
            setShowPopup(true);
        };

        const handleMouseOut = () => {
            setShowPopup(false);
        };

        if (parentRef.current) {
            parentRef.current.addEventListener('mouseover', handleMouseOver);
            parentRef.current.addEventListener('mouseout', handleMouseOut);
        }

        return () => {
            parentRef.current?.removeEventListener('mouseover', handleMouseOver);
            parentRef.current?.removeEventListener('mouseout', handleMouseOut);
        };
    }, []);

    return (
        <>
            <div
                className={styles.dummy}
                ref={dummyRef}
            />
            {showPopup && (
                <Popup
                    className={_cs(styles.tooltip, className)}
                    elementRef={popupRef}
                    parentRef={parentRef}
                >
                    <Container
                        className={containerClassName}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...otherProps}
                    />
                </Popup>
            )}
        </>
    );
}

export default Tooltip;
