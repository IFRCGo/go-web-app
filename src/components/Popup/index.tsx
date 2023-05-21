import { _cs } from '@togglecorp/fujs';

import Portal from '#components/Portal';
import useFloatPlacement from '#hooks/useFloatPlacement';

import styles from './styles.module.css';

interface Props {
    className?: string;
    elementRef: React.RefObject<HTMLElement>;
    parentRef: React.RefObject<HTMLElement>;
    children?: React.ReactNode;
}

function Popup(props: Props) {
    const {
        parentRef,
        elementRef,
        children,
        className,
    } = props;

    const placement = useFloatPlacement(parentRef);

    return (
        <Portal>
            <div
                ref={elementRef as React.RefObject<HTMLDivElement>}
                style={placement}
                className={_cs(styles.popup, className)}
            >
                {children}
            </div>
        </Portal>
    );
}

export default Popup;
