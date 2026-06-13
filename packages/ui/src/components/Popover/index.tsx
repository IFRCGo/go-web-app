import { _cs } from '@togglecorp/fujs';

import Portal from '#components/Portal';
import useFloatPlacement from '#hooks/useFloatPlacement';

import styles from './styles.module.css';

export interface Props {
    /**
     * Id for the floating surface. Used by disclosure components
     * (e.g. Dropdown) to wire `aria-controls` from their trigger.
     */
    id?: string;
    className?: string;
    pointerClassName?: string;
    elementRef?: React.RefObject<HTMLDivElement | null>;
    parentRef: React.RefObject<HTMLElement | null>;
    children?: React.ReactNode;
    preferredWidth?: number;
}

/**
 * Bare floating surface rendered in a portal and positioned next to its
 * parent (generic layer). It carries no own ARIA role — composing
 * components decide the semantics (menu, dialog, tooltip, etc.).
 */
function Popover(props: Props) {
    const {
        id,
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
                id={id}
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

export default Popover;
