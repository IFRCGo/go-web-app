import { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    InformationLineIcon,
    ErrorWarningLineIcon,
    CheckboxCircleLineIcon,
    QuestionLineIcon,
    CloseLineIcon,
} from '@ifrc-go/icons';

import ElementFragments from '#components/ElementFragments';
import Button from '#components/Button';
import { AlertVariant } from '#contexts/alert';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

import styles from './styles.module.css';

export interface Props<N> {
    name: N;
    className?: string;
    variant?: AlertVariant;
    children: React.ReactNode;
    nonDismissable?: boolean;
    onCloseButtonClick?: (name: N) => void;
    debugMessage?: string;
}

const alertVariantToClassNameMap: {
    [key in AlertVariant]: string;
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
        variant = 'info',
        children,
        onCloseButtonClick,
        nonDismissable,
        debugMessage,
    } = props;

    const strings = useTranslation(i18n);

    const icon: {
        [key in AlertVariant]: React.ReactNode;
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
        <div
            className={_cs(
                className,
                styles.alert,
                alertVariantToClassNameMap[variant],
            )}
        >
            <div className={styles.content}>
                <ElementFragments
                    icons={icon[variant]}
                    childrenContainerClassName={styles.content}
                    actions={!nonDismissable && (
                        <Button
                            className={styles.closeButton}
                            name={undefined}
                            onClick={handleCloseButtonClick}
                            variant="tertiary-on-dark"
                        >
                            <CloseLineIcon />
                        </Button>
                    )}
                >
                    {children}
                </ElementFragments>
            </div>
            {debugMessage && (
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
        </div>
    );
}

export default Alert;
