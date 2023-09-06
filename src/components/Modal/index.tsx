import { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import BodyOverlay from '#components/BodyOverlay';
import Button from '#components/Button';
import Container, { type Props as ContainerProps } from '#components/Container';
import { CloseFillIcon } from '@ifrc-go/icons';
import { FocusOn } from 'react-focus-on';
import styles from './styles.module.css';

export type SizeType = 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto';

const sizeToStyleMap: Record<SizeType, string> = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
    xl: styles.sizeXl,
    full: styles.sizeFull,
    auto: styles.sizeAuto,
};

export interface Props extends Omit<ContainerProps, 'withInternalPadding' | 'withoutWrapInHeading'> {
    closeOnClickOutside?: boolean;
    closeOnEscape?: boolean;
    onClose?: () => void;
    overlayClassName?: string;
    size?: SizeType;
    withoutCloseButton?: boolean;
}

function Modal(props: Props) {
    const {
        closeOnClickOutside = false,
        closeOnEscape = false,
        onClose,
        overlayClassName,
        size = 'md',
        withoutCloseButton = false,

        className,
        actions,

        ...containerProps
    } = props;

    const sizeStyle = sizeToStyleMap[size];

    const handleClickOutside = useCallback(() => {
        if (closeOnClickOutside && onClose) {
            onClose();
        }
    }, [onClose, closeOnClickOutside]);

    const handleEscape = useCallback(() => {
        if (closeOnEscape && onClose) {
            onClose();
        }
    }, [onClose, closeOnEscape]);

    return (
        <BodyOverlay className={overlayClassName}>
            <FocusOn
                className={_cs(styles.modalContainer, sizeStyle)}
                onClickOutside={handleClickOutside}
                onEscapeKey={handleEscape}
            >
                <Container
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...containerProps}
                    withInternalPadding
                    withoutWrapInHeading
                    className={_cs(styles.modal, className)}
                    actions={(!withoutCloseButton || actions) ? (
                        <>
                            {actions}
                            <Button
                                name={undefined}
                                onClick={onClose}
                                variant="tertiary"
                                // FIXME: use translation
                                title="Close"
                            >
                                <CloseFillIcon className={styles.closeIcon} />
                            </Button>
                        </>
                    ) : undefined}
                />
            </FocusOn>
        </BodyOverlay>
    );
}

export default Modal;
