import { useCallback } from 'react';
import {
    CheckboxCircleLineIcon,
    CloseLineIcon,
    ErrorWarningLineIcon,
    InformationLineIcon,
    QuestionLineIcon,
} from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import ButtonLayout from '#components/ButtonLayout';
import Container from '#components/Container';
import RawButton from '#components/RawButton';
import { AlertType } from '#contexts/alert';
import useTranslation from '#hooks/useTranslation';
import { BoxShadowType } from '#utils/style';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface Props<N> {
    name: N;
    className?: string;
    /** Semantic status of the alert */
    variant?: AlertType;
    title?: React.ReactNode;
    description?: React.ReactNode;
    /** Hide the close button so the user cannot dismiss the alert */
    nonDismissable?: boolean;
    onCloseButtonClick?: (name: N) => void;
    /** Technical error details, surfaced through a copy action */
    debugMessage?: string;
    /**
     * Use a variant-tinted light surface with variant-colored text
     * instead of the default filled variant background
     */
    withLightBackground?: boolean;
    /** Shadow spec for the alert surface */
    boxShadow?: BoxShadowType;
}

const alertVariantToClassNameMap: {
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

/**
 * Alert notifies the user about the result of an action
 * (typically rendered through AlertContainer).
 * Specific layer: exposes a single semantic `variant` prop.
 */
function Alert<N extends string>(props: Props<N>) {
    const {
        name,
        className,
        variant = 'info',
        title,
        description,
        onCloseButtonClick,
        nonDismissable,
        debugMessage,
        withLightBackground,
        boxShadow = 'md',
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
            // NOTE: transient, assertive notification -> role="alert" (live region)
            role="alert"
            className={_cs(
                styles.alert,
                alertVariantToClassNameMap[variant],
                withLightBackground && styles.withLightBackground,
                className,
            )}
            headerIcons={icon[variant]}
            heading={title}
            headingLevel={5}
            headerActions={!nonDismissable && (
                // NOTE: text-on-dark is not part of the curated Button
                // variants, so this composes RawButton + ButtonLayout directly
                <RawButton
                    className={styles.dismissButton}
                    name={undefined}
                    onClick={handleCloseButtonClick}
                    title={strings.closeButtonTitle}
                    aria-label={strings.closeButtonTitle}
                >
                    <ButtonLayout
                        colorVariant="text-on-dark"
                        styleVariant="transparent"
                    >
                        <CloseLineIcon className={styles.closeIcon} />
                    </ButtonLayout>
                </RawButton>
            )}
            withoutWrapInHeader
            withoutWrapInFooter
            footerActions={debugMessage && (
                // NOTE: text-on-dark + translucent is not part of the curated
                // Button variants, so this composes RawButton + ButtonLayout
                // directly (spacingOffset mirrors the Button default)
                <RawButton
                    className={styles.copyDebugButton}
                    name={undefined}
                    onClick={handleCopyDebugMessageButtonClick}
                >
                    <ButtonLayout
                        colorVariant="text-on-dark"
                        styleVariant="translucent"
                        textSize="sm"
                        spacing="sm"
                        spacingOffset={-3}
                    >
                        {strings.alertCopyErrorDetails}
                    </ButtonLayout>
                </RawButton>
            )}
            withPadding
            boxShadow={boxShadow}
        >
            {description}
        </Container>
    );
}

export default Alert;
