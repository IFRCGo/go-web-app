import {
    useCallback,
    useContext,
    useEffect,
    useRef,
} from 'react';
import { _cs } from '@togglecorp/fujs';

import Alert from '#components/Alert';
import Portal from '#components/Portal';
import AlertContext from '#contexts/alert';
import { DURATION_DEFAULT_ALERT_DISMISS } from '#utils/constants';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    children?: React.ReactNode;
}

function AlertContainer(props: Props) {
    const {
        className,
        children,
    } = props;

    const {
        alerts,
        removeAlert,
    } = useContext(AlertContext);

    const dismissTimeout = useRef<Record<string, number>>({});

    useEffect(
        () => {
            alerts.filter((alert) => !alert.nonDismissable).forEach((alert) => {
                // NOTE: skip if there is already a timeout
                if (dismissTimeout.current[alert.name]) {
                    return;
                }
                dismissTimeout.current[alert.name] = window.setTimeout(
                    () => {
                        removeAlert(alert.name);
                        delete dismissTimeout.current[alert.name];
                    },
                    alert.duration ?? DURATION_DEFAULT_ALERT_DISMISS,
                );
            });
        },
        [alerts, removeAlert],
    );

    const handleAlertCloseButtonClick = useCallback(
        (name: string) => {
            const timeout = dismissTimeout.current[name];
            window.clearTimeout(timeout);

            removeAlert(name);
            delete dismissTimeout.current[name];
        },
        [removeAlert],
    );

    return (
        <Portal>
            <div className={_cs(styles.alertContainer, className)}>
                {alerts.map((alert) => (
                    <Alert
                        key={alert.name}
                        name={alert.name}
                        className={styles.alert}
                        nonDismissable={alert.nonDismissable}
                        type={alert.variant}
                        onCloseButtonClick={handleAlertCloseButtonClick}
                        debugMessage={alert.debugMessage}
                        title={alert.title}
                        description={alert.description}
                    />
                ))}
                {children}
            </div>
        </Portal>
    );
}

export default AlertContainer;
