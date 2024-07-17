import {
    useCallback,
    useEffect,
} from 'react';
import { FocusOn } from 'react-focus-on';
import { CloseFillIcon } from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import BodyOverlay from '#components/BodyOverlay';
import Button from '#components/Button';
import Container, { type Props as ContainerProps } from '#components/Container';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'pageWidth' | 'full' | 'auto';

const sizeToStyleMap: Record<ModalSize, string> = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
    xl: styles.sizeXl,
    full: styles.sizeFull,
    auto: styles.sizeAuto,
    pageWidth: styles.pageWidth,
};

export interface Props extends Omit<ContainerProps, 'withInternalPadding' | 'withoutWrapInHeading'> {
    closeOnClickOutside?: boolean;
    closeOnEscape?: boolean;
    onClose?: () => void;
    overlayClassName?: string;
    modalContainerClassName?: string;
    size?: ModalSize;
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
        childrenContainerClassName,
        modalContainerClassName,

        ...containerProps
    } = props;

    const strings = useTranslation(i18n);

    useEffect(
        () => {
            const prevValue = document.documentElement.style.scrollbarGutter;
            document.documentElement.style.scrollbarGutter = 'initial';

            return () => {
                document.documentElement.style.scrollbarGutter = prevValue;
            };
        },
        [],
    );

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
        <BodyOverlay className={_cs(styles.overlay, overlayClassName)}>
            <FocusOn
                className={_cs(styles.modalContainer, modalContainerClassName, sizeStyle)}
                onClickOutside={handleClickOutside}
                onEscapeKey={handleEscape}
                gapMode="padding"
                // gapMode={null}
            >
                <Container
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...containerProps}
                    withInternalPadding
                    withoutWrapInHeading
                    className={_cs(styles.modal, className)}
                    childrenContainerClassName={_cs(styles.content, childrenContainerClassName)}
                    actions={(!withoutCloseButton || actions) ? (
                        <>
                            {actions}
                            <Button
                                name={undefined}
                                onClick={onClose}
                                variant="tertiary"
                                title={strings.closeButtonLabel}
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
