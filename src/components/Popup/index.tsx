import { _cs } from '@togglecorp/fujs';

import Portal from '#components/Portal';
import useFloatPlacement from '#hooks/useFloatPlacement';

import styles from './styles.module.css';

interface Props {
    className?: string;
    elementRef?: React.RefObject<HTMLDivElement>;
    parentRef: React.RefObject<HTMLElement>;
    children?: React.ReactNode;
    horizontallyCentered?: boolean;
}

function Popup(props: Props) {
    const {
        parentRef,
        elementRef,
        children,
        className,
        horizontallyCentered,
    } = props;

    const placement = useFloatPlacement(parentRef, horizontallyCentered);

    return (
        <Portal>
            <div
                ref={elementRef}
                style={placement}
                className={_cs(styles.popup, className)}
            >
                {children}
            </div>
        </Portal>
    );
}

export default Popup;
