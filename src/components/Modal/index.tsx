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

interface Props {
    children: React.ReactNode;
    className?: string;
    closeOnClickOutside?: boolean;
    closeOnEscape?: boolean;
    footerClassName?: string;
    footerIcons?: React.ReactNode;
    footerContent?: React.ReactNode;
    footerActions?: React.ReactNode;
    headerClassName?: string;
    onCloseButtonClick: () => void;
    opened: boolean;
    overlayClassName?: string;
    size?: SizeType;
    title?: React.ReactNode;
    headingLevel?: HeadingProps['level'];
    hideCloseButton?: boolean;
    bodyClassName?: string;
}

function Modal(props: Props) {
    const {
        bodyClassName,
        children,
        className,
        closeOnClickOutside = true,
        closeOnEscape = true,
        footerClassName: footerClassNameFromProps,
        footerIcons,
        footerActions,
        footerContent,
        headerClassName,
        onCloseButtonClick,
        opened,
        overlayClassName,
        size = 'xl',
        title,
        headingLevel,
        hideCloseButton = false,
    } = props;

    const hasHeader = !!title || hideCloseButton;
    const sizeStyle = styles[`size-${size}`];

    const handleClickOutside = useCallback(() => {
        if (closeOnClickOutside) {
            onCloseButtonClick();
        }
    }, [onCloseButtonClick, closeOnClickOutside]);

    const handleEscape = useCallback(() => {
        if (closeOnEscape) {
            onCloseButtonClick();
        }
    }, [onCloseButtonClick, closeOnEscape]);

    const {
        containerClassName: footerClassName,
        content: footer,
    } = useBasicLayout({
        icons: footerIcons,
        children: footerContent,
        actions: footerActions,
    });

    return (
        <div>
            {opened && (
                <BodyOverlay className={overlayClassName}>
                    <FocusOn
                        className={_cs(styles.modalContainer, sizeStyle)}
                        onClickOutside={handleClickOutside}
                        onEscapeKey={handleEscape}
                    >
                        <div
                            className={_cs(styles.modal, className)}
                            role="dialog"
                            aria-modal
                            aria-labelledby="modalLabel"
                            aria-describedby="modalBody"
                        >
                            {hasHeader && (
                                <Header
                                    className={_cs(headerClassName, styles.modalHeader)}
                                    heading={title}
                                    headingLevel={headingLevel}
                                    actions={hideCloseButton && (
                                        <IconButton
                                            name={undefined}
                                            onClick={onCloseButtonClick}
                                            ariaLabel="Close"
                                            variant="tertiary"
                                        >
                                            <CloseFillIcon />
                                        </IconButton>
                                    )}
                                />
                            )}
                            <div className={_cs(styles.modalBody, bodyClassName)} id="modalBody">
                                {children}
                            </div>
                            <footer
                                className={_cs(
                                    footerClassName,
                                    footerClassNameFromProps,
                                    styles.modalFooter,
                                )}
                            >
                                {footer}
                            </footer>
                        </div>
                    </FocusOn>
                </BodyOverlay>
            )}
        </div>
    );
}

export default Modal;
