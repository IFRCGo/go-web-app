import {
    useCallback,
    useEffect,
    useId,
    useRef,
} from 'react';
import { CloseFillIcon } from '@ifrc-go/icons';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import Button from '#components/Button';
import Container, { type Props as ContainerProps } from '#components/Container';
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

export interface Props extends Omit<ContainerProps, 'withInternalPadding' | 'withoutWrapInHeading' | 'size' | 'headingId' | 'role'> {
    closeOnClickOutside?: boolean;
    closeOnEscape?: boolean;
    onClose?: () => void;
    /** Applied to the `<dialog>` element (its `::backdrop` is the dim layer) */
    overlayClassName?: string;
    modalContainerClassName?: string;
    size?: DialogSize;
    withoutCloseButton?: boolean;
}

/**
 * Modal dialog built on the native `<dialog>` element (specific layer).
 *
 * Opened with `showModal()`, so focus trapping, focus restore, background
 * inerting, top-layer rendering and the `::backdrop` come from the platform —
 * no portal or focus-trap library needed. Its accessible name is wired via
 * `aria-labelledby` to the Container heading (`Container.headingId`). Escape
 * and backdrop clicks are routed through `onClose` (gated by `closeOnEscape` /
 * `closeOnClickOutside`) so React stays the source of truth for open state.
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
    const dialogRef = useRef<HTMLDialogElement>(null);
    const headingId = useId();

    useEffect(
        () => {
            const dialogElement = dialogRef.current;
            dialogElement?.showModal();

            // showModal() inerts the background but does not lock its scroll.
            const prevOverflow = document.body.style.overflow;
            const prevScrollbarGutter = document.documentElement.style.scrollbarGutter;
            document.body.style.overflow = 'hidden';
            document.documentElement.style.scrollbarGutter = 'initial';

            return () => {
                document.body.style.overflow = prevOverflow;
                document.documentElement.style.scrollbarGutter = prevScrollbarGutter;
                dialogElement?.close();
            };
        },
        [],
    );

    const handleCancel = useCallback(
        (event: React.SyntheticEvent<HTMLDialogElement>) => {
            // Never let the element close itself on Escape; route through
            // onClose so the owner unmounts us (keeping React authoritative).
            event.preventDefault();
            if (closeOnEscape) {
                onClose?.();
            }
        },
        [closeOnEscape, onClose],
    );

    useEffect(
        () => {
            const dialogElement = dialogRef.current;
            if (!dialogElement) {
                return undefined;
            }
            // A click whose target is the <dialog> itself is a backdrop click
            // (content sits in the child Container). Attached imperatively so
            // the listener lives on the genuinely-interactive dialog element.
            const handleBackdropClick = (event: MouseEvent) => {
                if (event.target === dialogElement && closeOnClickOutside) {
                    onClose?.();
                }
            };
            dialogElement.addEventListener('click', handleBackdropClick);
            return () => {
                dialogElement.removeEventListener('click', handleBackdropClick);
            };
        },
        [closeOnClickOutside, onClose],
    );

    const sizeStyle = sizeToStyleMap[size];

    // Only show the close button when it can actually do something — closing a
    // mount-to-show dialog needs the owner's onClose. Avoids a dead "×".
    const showCloseButton = !withoutCloseButton && isDefined(onClose);

    return (
        <dialog
            ref={dialogRef}
            className={_cs(styles.dialog, sizeStyle, overlayClassName, modalContainerClassName)}
            aria-labelledby={heading ? headingId : undefined}
            onCancel={handleCancel}
        >
            <Container
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...containerProps}
                heading={heading}
                headingId={headingId}
                withPadding
                withoutWrapInHeader
                withoutWrapInFooter
                className={_cs(styles.modal, className)}
                withContentOverflow
                headerActions={(showCloseButton || headerActions) ? (
                    <>
                        {headerActions}
                        {showCloseButton && (
                            <Button
                                name={undefined}
                                onClick={onClose}
                                variant="tertiary"
                                title={strings.closeButtonLabel}
                            >
                                <CloseFillIcon className={styles.closeIcon} />
                            </Button>
                        )}
                    </>
                ) : undefined}
            />
        </dialog>
    );
}

export default Dialog;
