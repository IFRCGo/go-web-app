import {
    useCallback,
    useEffect,
} from 'react';
import { FocusOn } from 'react-focus-on';
import { CloseFillIcon } from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import Button from '#components/Button';
import Container, { type Props as ContainerProps } from '#components/Container';
import Portal from '#components/Portal';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'pageWidth' | 'full' | 'auto';

const sizeToStyleMap: Record<DialogSize, string> = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
    xl: styles.sizeXl,
    full: styles.sizeFull,
    auto: styles.sizeAuto,
    pageWidth: styles.pageWidth,
};

export interface Props extends Omit<ContainerProps, 'withInternalPadding' | 'withoutWrapInHeading' | 'size'> {
    closeOnClickOutside?: boolean;
    closeOnEscape?: boolean;
    onClose?: () => void;
    overlayClassName?: string;
    modalContainerClassName?: string;
    size?: DialogSize;
    withoutCloseButton?: boolean;
}

/**
 * Overlay dialog built on Container, rendered in a portal with focus
 * trapping (specific layer).
 *
 * Carries `role="dialog"` + `aria-modal="true"`; its accessible name is
 * derived from the heading (via `aria-labelledby` once Container exposes a
 * heading id, with an `aria-label` fallback when the heading is a string).
 */
function Dialog(props: Props) {
    const {
        closeOnClickOutside = false,
        closeOnEscape = false,
        onClose,
        overlayClassName,
        size = 'md',
        withoutCloseButton = false,

        className,
        heading,
        headerActions,
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

    // FIXME(a11y-tier2): wire `aria-labelledby` to Container's heading id once
    // Group MISC-B exposes a `headingId` prop on Container and threads it onto
    // the Heading element. Until then the dialog's accessible name comes from
    // the `aria-label` fallback below, which only covers string headings.
    const headingFallbackLabel = typeof heading === 'string' ? heading : undefined;

    return (
        <Portal>
            <div className={_cs(styles.overlay, overlayClassName)}>
                <FocusOn
                    className={_cs(styles.focusContainer, modalContainerClassName, sizeStyle)}
                    onClickOutside={handleClickOutside}
                    onEscapeKey={handleEscape}
                    gapMode="padding"
                    // gapMode={null}
                >
                    <Container
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...containerProps}
                        role="dialog"
                        aria-modal="true"
                        aria-label={headingFallbackLabel}
                        heading={heading}
                        withPadding
                        withoutWrapInHeader
                        withoutWrapInFooter
                        className={_cs(styles.modal, className)}
                        withContentOverflow
                        headerActions={(!withoutCloseButton || headerActions) ? (
                            <>
                                {headerActions}
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
            </div>
        </Portal>
    );
}

export default Dialog;
