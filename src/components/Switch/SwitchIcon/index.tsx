import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface SwitchIconProps {
  className?: string;
  value?: boolean | null;
}

function SwitchIcon(props: SwitchIconProps) {
    const {
        className,
        value,
    } = props;

    return (
        <div
            className={_cs(
                styles.switchIcon,
                className,
                value ? styles.on : styles.off,
            )}
            aria-hidden="true"
        >
            <div className={styles.knob} />
        </div>
    );
}

export default SwitchIcon;
