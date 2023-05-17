import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import BodyOverlay from '#components/BodyOverlay';
import Header from '#components/Header';
import Footer from '#components/Footer';
import IconButton from '#components/IconButton';
import { IoClose } from 'react-icons/io5';
import { FocusOn } from 'react-focus-on';
import styles from './styles.module.css';

export type SizeType = 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto';

interface Props {
  children: React.ReactNode;
  className?: string;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  footerClassName?: string;
  footerContent?: React.ReactNode;
  headerClassName?: string;
  onCloseButtonClick: () => void;
  opened: boolean;
  overlayClassName?: string;
  size?: SizeType;
  title?: React.ReactNode;
  withCloseButton?: boolean;
  bodyClassName?: string;
}

function Modal(props: Props) {
  const {
    bodyClassName,
    children,
    className,
    closeOnClickOutside = true,
    closeOnEscape = true,
    footerClassName,
    footerContent,
    headerClassName,
    onCloseButtonClick,
    opened,
    overlayClassName,
    size = 'xl',
    title,
    withCloseButton = true,
  } = props;

  const hasHeader = !!title || withCloseButton;
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

  return (
    <>
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
              aria-modal={true}
              aria-labelledby="modalLabel"
              aria-describedby="modalBody"
            >
              {hasHeader && (
                <Header className={_cs(headerClassName, styles.modalHeader)} id="modalLabel">
                  {title && (
                    title
                  )}
                  {withCloseButton && (
                    <IconButton
                      name={undefined}
                      onClick={onCloseButtonClick}
                      ariaLabel="Close"
                      variant="tertiary"
                    >
                      <IoClose />
                    </IconButton>
                  )}
                </Header>
              )}
              <div className={_cs(styles.modalBody, bodyClassName)} id="modalBody">
                {children}
              </div>
              <Footer className={_cs(styles.modalFooter, footerClassName)}>
                {footerContent}
              </Footer>
            </div>
          </FocusOn>
        </BodyOverlay>
      )}
    </>
  );
}

export default Modal;
