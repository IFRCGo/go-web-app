import { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    InformationLineIcon,
    ErrorWarningLineIcon,
    CheckboxCircleLineIcon,
    QuestionLineIcon,
    CloseLineIcon,
} from '@ifrc-go/icons';
import Button from '#components/Button';
import Container from '#components/Container';

import { AlertType } from '#contexts/alert';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

import styles from './styles.module.css';

export interface Props<N> {
    name: N;
    className?: string;
    type?: AlertType;
    title?: React.ReactNode;
    description?: React.ReactNode;
    nonDismissable?: boolean;
    onCloseButtonClick?: (name: N) => void;
    debugMessage?: string;
}

const alertTypeToClassNameMap: {
    [key in AlertType]: string;
} = {
    success: styles.success,
    warning: styles.warning,
    danger: styles.danger,
    info: styles.info,
};

function Alert<N extends string>(props: Props<N>) {
    const {
        name,
        className,
        type = 'info',
        title,
        description,
        onCloseButtonClick,
        nonDismissable,
        debugMessage,
    } = props;

    const strings = useTranslation(i18n);

    const icon: {
        [key in AlertType]: React.ReactNode;
    } = {
        success: <CheckboxCircleLineIcon className={styles.icon} />,
        danger: <ErrorWarningLineIcon className={styles.icon} />,
        info: <InformationLineIcon className={styles.icon} />,
        warning: <QuestionLineIcon className={styles.icon} />,
    };

    const handleCloseButtonClick = useCallback(
        () => {
            if (onCloseButtonClick) {
                onCloseButtonClick(name);
            }
        },
        [onCloseButtonClick, name],
    );

    const handleCopyDebugMessageButtonClick = useCallback(
        () => {
            if (debugMessage) {
                navigator.clipboard.writeText(debugMessage);
            }
        },
        [debugMessage],
    );

    return (
        <Container
            className={_cs(
                styles.alert,
                alertTypeToClassNameMap[type],
                className,
            )}
            icons={icon[type]}
            heading={title}
            headingLevel={4}
            ellipsizeHeading
            actions={nonDismissable && (
                <Button
                    name={undefined}
                    onClick={handleCloseButtonClick}
                    variant="tertiary-on-dark"
                    title={strings.closeButtonTitle}
                >
                    <CloseLineIcon className={styles.closeIcon} />
                </Button>
            )}
            footerActions={debugMessage && (
                <div className={styles.actions}>
                    <Button
                        name={undefined}
                        onClick={handleCopyDebugMessageButtonClick}
                        variant="tertiary-on-dark"
                    >
                        {strings.alertCopyErrorDetails}
                    </Button>
                </div>
            )}
        >
            {description}
        </Container>
    );
}

export default Alert;
