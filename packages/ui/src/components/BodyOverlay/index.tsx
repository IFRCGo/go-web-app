import { _cs } from '@togglecorp/fujs';

import Overlay from '#components/Overlay';
import Portal from '#components/Portal';

import styles from './styles.module.css';

export interface Props {
  children: React.ReactNode;
  className?: string;
}

function BodyOverlay(props: Props) {
    const {
        className,
        children,
    } = props;

    return (
        <Portal>
            <Overlay
                variant="dark"
                className={_cs(className, styles.bodyOverlay)}
            >
                {children}
            </Overlay>
        </Portal>
    );
}

export default BodyOverlay;
