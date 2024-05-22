import { _cs } from '@togglecorp/fujs';

import Portal from '#components/Portal';
import useFloatPlacement from '#hooks/useFloatPlacement';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    pointerClassName?: string;
    elementRef?: React.RefObject<HTMLDivElement>;
    parentRef: React.RefObject<HTMLElement | undefined>;
    children?: React.ReactNode;
    preferredWidth?: number;
}

function Popup(props: Props) {
    const {
        parentRef,
        elementRef,
        children,
        className,
        pointerClassName,
        preferredWidth,
    } = props;

    const {
        content,
        pointer,
        width,
        orientation,
    } = useFloatPlacement(parentRef, preferredWidth);

    return (
        <Portal>
            <div
                ref={elementRef}
                style={{
                    ...content,
                    width,
                }}
                className={_cs(
                    styles.popup,
                    orientation.vertical === 'bottom' && styles.topOrientation,
                    className,
                )}
            >
                {children}
            </div>
            <div
                className={_cs(
                    styles.pointer,
                    orientation.vertical === 'bottom' && styles.topOrientation,
                    pointerClassName,
                )}
                style={{ ...pointer }}
            >
                <svg
                    className={styles.icon}
                    viewBox="0 0 200 100"
                >
                    <path
                        d="M0 100 L100 0 L200 100Z"
                    />
                </svg>
            </div>
        </Portal>
    );
}

export default Popup;
