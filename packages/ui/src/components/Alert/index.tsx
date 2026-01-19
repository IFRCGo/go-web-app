import { useCallback } from 'react';
import {
    CheckboxCircleLineIcon,
    CloseLineIcon,
    ErrorWarningLineIcon,
    InformationLineIcon,
    QuestionLineIcon,
} from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import Button from '#components/Button';
import Container from '#components/Container';
import IconButton from '#components/IconButton';
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

const icon: {
    [key in AlertType]: React.ReactNode;
} = {
    success: <CheckboxCircleLineIcon className={styles.icon} />,
    danger: <ErrorWarningLineIcon className={styles.icon} />,
    info: <InformationLineIcon className={styles.icon} />,
    warning: <QuestionLineIcon className={styles.icon} />,
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
            headerIcons={icon[type]}
            heading={title}
            headingLevel={5}
            headerActions={!nonDismissable && (
                <IconButton
                    name={undefined}
                    onClick={handleCloseButtonClick}
                    colorVariant="text-on-dark"
                    title={strings.closeButtonTitle}
                    ariaLabel={strings.closeButtonTitle}
                >
                    <CloseLineIcon />
                </IconButton>
            )}
            withoutWrapInHeader
            withoutWrapInFooter
            footerActions={debugMessage && (
                <Button
                    name={undefined}
                    onClick={handleCopyDebugMessageButtonClick}
                    colorVariant="text-on-dark"
                    styleVariant="translucent"
                    textSize="sm"
                    spacing="sm"
                >
                    {strings.alertCopyErrorDetails}
                </Button>
            )}
            withPadding
            withShadow
        >
            {description}
        </Container>
    );
}

export default Alert;
