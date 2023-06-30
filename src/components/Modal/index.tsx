import { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import BodyOverlay from '#components/BodyOverlay';
import Header from '#components/Header';
import { Props as HeadingProps } from '#components/Heading';
import useBasicLayout from '#hooks/useBasicLayout';
import IconButton from '#components/IconButton';
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

export interface Props {
    children: React.ReactNode;
    className?: string;
    closeOnClickOutside?: boolean;
    closeOnEscape?: boolean;
    footerClassName?: string;
    footerIcons?: React.ReactNode;
    footerContent?: React.ReactNode;
    footerActions?: React.ReactNode;
    headerClassName?: string;
    onClose?: () => void;
    overlayClassName?: string;
    size?: SizeType;
    heading?: React.ReactNode;
    headingLevel?: HeadingProps['level'];
    hideCloseButton?: boolean;
    bodyClassName?: string;
}

function Modal(props: Props) {
    const {
        bodyClassName,
        children,
        className,
        closeOnClickOutside = false,
        closeOnEscape = false,
        footerClassName: footerClassNameFromProps,
        footerIcons,
        footerActions,
        footerContent,
        headerClassName,
        onClose,
        overlayClassName,
        size = 'md',
        heading,
        headingLevel,
        hideCloseButton = false,
    } = props;

    const hasHeader = !!heading || hideCloseButton;
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

    const {
        containerClassName: footerClassName,
        content: footer,
    } = useBasicLayout({
        icons: footerIcons,
        children: footerContent,
        actions: footerActions,
    });

    return (
        <BodyOverlay className={overlayClassName}>
            <FocusOn
                className={_cs(styles.modalContainer, sizeStyle)}
                onClickOutside={handleClickOutside}
                onEscapeKey={handleEscape}
            >
                {/* FIXME: use container */}
                <div
                    className={_cs(styles.modal, className)}
                    role="dialog"
                    aria-modal
                >
                    {hasHeader && (
                        <Header
                            className={_cs(headerClassName, styles.modalHeader)}
                            heading={heading}
                            headingLevel={headingLevel}
                            actions={hideCloseButton && (
                                <IconButton
                                    name={undefined}
                                    onClick={onClose}
                                    ariaLabel="Close"
                                    variant="tertiary"
                                >
                                    <CloseFillIcon />
                                </IconButton>
                            )}
                        />
                    )}
                    <div className={_cs(styles.modalBody, bodyClassName)}>
                        {children}
                    </div>
                    <footer
                        className={_cs(
                            footerClassName,
                            footerClassNameFromProps,
                        )}
                    >
                        {footer}
                    </footer>
                </div>
            </FocusOn>
        </BodyOverlay>
    );
}

export default Modal;
