import {
    useContext,
    useRef,
    useEffect,
    useCallback,
} from 'react';
import { _cs } from '@togglecorp/fujs';

import AlertContext, {
    DEFAULT_ALERT_DISMISS_DURATION,
} from '#contexts/alert';
import Alert from '#components/Alert';
import Portal from '#components/Portal';

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

    console.info(alerts);

    const dismissTimeout = useRef<Record<string, number>>({});

    useEffect(() => {
        alerts.forEach((alert) => {
            if (!alert.nonDismissable && !dismissTimeout.current[alert.name]) {
                dismissTimeout.current[alert.name] = window.setTimeout(() => {
                    removeAlert(alert.name);
                    delete dismissTimeout.current[alert.name];
                }, alert.duration ?? DEFAULT_ALERT_DISMISS_DURATION);
            }
        });
    }, [alerts, removeAlert]);

    const handleAlertCloseButtonClick = useCallback((name: string) => {
        window.clearTimeout(dismissTimeout.current[name]);
        removeAlert(name);
    }, [removeAlert]);

    return (
        <Portal>
            <div className={_cs(styles.alertContainer, className)}>
                {alerts.map((alert) => (
                    <Alert
                        name={alert.name}
                        className={styles.alert}
                        key={alert.name}
                        nonDismissable={alert.nonDismissable}
                        variant={alert.variant}
                        onCloseButtonClick={handleAlertCloseButtonClick}
                        debugMessage={alert.debugMessage}
                    >
                        { alert.children }
                    </Alert>
                ))}
                { children }
            </div>
        </Portal>
    );
}

export default AlertContainer;
