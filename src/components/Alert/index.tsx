import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    AiOutlineInfoCircle,
    AiOutlineWarning,
    AiOutlineCheckCircle,
    AiOutlineQuestionCircle,
} from 'react-icons/ai';

import {
    IoClose,
} from 'react-icons/io5';

import ElementFragments from '#components/ElementFragments';
import Button from '#components/Button';
import { AlertVariant } from '#components/AlertContext';
import Translate from '#components/Translate';

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    const icon: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    [key in AlertVariant]: React.ReactNode;
  } = {
      success: <AiOutlineCheckCircle className={styles.icon} />,
      danger: <AiOutlineWarning className={styles.icon} />,
      info: <AiOutlineInfoCircle className={styles.icon} />,
      warning: <AiOutlineQuestionCircle className={styles.icon} />,
  };

    const handleCloseButtonClick = React.useCallback(() => {
        if (onCloseButtonClick) {
            onCloseButtonClick(name);
        }
    }, [onCloseButtonClick, name]);

    const handleCopyDebugMessageButtonClick = React.useCallback(() => {
        if (debugMessage) {
            navigator.clipboard.writeText(debugMessage);
        }
    }, [debugMessage]);

    return (
        <div
            className={_cs(
                styles.alert,
                className,
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
                            variant="action"
                        >
                            <IoClose />
                        </Button>
                    )}
                >
                    { children }
                </ElementFragments>
            </div>
            {debugMessage && (
                <div className={styles.actions}>
                    <Button
                        className={styles.copyDebugMessageButton}
                        name={undefined}
                        onClick={handleCopyDebugMessageButtonClick}
                        variant="transparent"
                    >
                        <Translate stringId="alertCopyErrorDetails" />
                    </Button>
                </div>
            )}
        </div>
    );
}

export default Alert;
