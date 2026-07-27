import {
    useCallback,
    useContext,
    useState,
} from 'react';
import {
    Button,
    ButtonLayout,
    type ButtonProps,
    type ConfirmButtonProps,
    Dialog,
    ListView,
    RawButton,
} from '@ifrc-go/ui';
import { MenuContext } from '@ifrc-go/ui/contexts';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isDefined } from '@togglecorp/fujs';

import Link, { type Props as LinkProps } from '#components/Link';

import i18n from './i18n.json';
import styles from './styles.module.css';

type CommonProp = {
    persist?: boolean;
    withoutFullWidth?: boolean;
}

type ButtonTypeProps<NAME> = Omit<ButtonProps<NAME>, 'type' | 'variant' | 'withFullWidth'> & {
    type: 'button';
}

type LinkTypeProps = LinkProps & {
    type: 'link';
    onClick?: never;
}

type ConfirmButtonTypeProps<NAME> = Omit<ConfirmButtonProps<NAME>, 'type' | 'variant' | 'withFullWidth'> & {
    type: 'confirm-button',
}

type Props<NAME> = CommonProp & (
    ButtonTypeProps<NAME> | LinkTypeProps | ConfirmButtonTypeProps<NAME>
);

function DropdownMenuItem<NAME>(props: Props<NAME>) {
    const {
        persist = false,
        onClick,
        withoutFullWidth,
        ...remainingProps
    } = props;

    const strings = useTranslation(i18n);
    const { setShowDropdown } = useContext(MenuContext);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const onConfirm = remainingProps.type === 'confirm-button'
        ? remainingProps.onConfirm
        : undefined;

    const handleLinkClick = useCallback(
        () => {
            if (!persist) {
                setShowDropdown(false);
            }
            // TODO: maybe add onClick here?
        },
        [setShowDropdown, persist],
    );

    const handleButtonClick = useCallback(
        (name: NAME, e: React.MouseEvent<HTMLButtonElement>) => {
            if (remainingProps.type !== 'link') {
                if (!persist) {
                    setShowDropdown(false);
                }

                if (isDefined(onClick)) {
                    onClick(name, e);
                }
            }
        },
        [setShowDropdown, persist, onClick, remainingProps.type],
    );

    const handleConfirmButtonClick = useCallback(
        (name: NAME, e: React.MouseEvent<HTMLButtonElement>) => {
            handleButtonClick(name, e);
            setShowConfirmation(true);
        },
        [handleButtonClick],
    );

    const handleConfirmClick = useCallback(
        (name: NAME) => {
            setShowConfirmation(false);
            if (isDefined(onConfirm)) {
                onConfirm(name);
            }
        },
        [onConfirm],
    );

    if (remainingProps.type === 'link') {
        const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            type: _,
            styleVariant = 'transparent',
            colorVariant = 'text',
            children,
            ...otherProps
        } = remainingProps;

        return (
            <Link
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                styleVariant={styleVariant}
                colorVariant={colorVariant}
                onClick={handleLinkClick}
                withFullWidth={!withoutFullWidth}
            >
                {children}
            </Link>
        );
    }

    if (remainingProps.type === 'button') {
        const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            type: _,
            after,
            before,
            children,
            className,
            disabled,
            elementRef,
            spacing,
            spacingOffset = -3,
            textSize,
            withoutPadding,
            ...otherProps
        } = remainingProps;

        // NOTE: composing RawButton + ButtonLayout to preserve the old
        // (text, transparent) menu item look, which is not in Button's
        // curated variant set
        return (
            <RawButton
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                className={styles.menuItem}
                onClick={handleButtonClick}
                disabled={disabled}
            >
                <ButtonLayout
                    className={className}
                    elementRef={elementRef}
                    colorVariant="text"
                    styleVariant="transparent"
                    spacing={spacing}
                    spacingOffset={spacingOffset}
                    withoutPadding={withoutPadding}
                    withFullWidth={!withoutFullWidth}
                    before={before}
                    after={after}
                    textSize={textSize}
                    disabled={disabled}
                >
                    {children}
                </ButtonLayout>
            </RawButton>
        );
    }

    if (remainingProps.type === 'confirm-button') {
        const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            type: _,
            after,
            before,
            children,
            className,
            confirmHeading = strings.confirmation,
            confirmMessage = strings.confirmMessage,
            disabled,
            elementRef,
            name,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            onConfirm: _unusedOnConfirm,
            spacing,
            spacingOffset = -3,
            textSize,
            withoutPadding,
            ...otherProps
        } = remainingProps;

        // NOTE: composing RawButton + ButtonLayout to preserve the old
        // (text, transparent) menu item look, which is not in
        // ConfirmButton's curated variant set; the confirmation dialog
        // is replicated from ConfirmButton
        return (
            <>
                <RawButton
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...otherProps}
                    name={name}
                    className={styles.menuItem}
                    onClick={handleConfirmButtonClick}
                    disabled={disabled}
                >
                    <ButtonLayout
                        className={className}
                        elementRef={elementRef}
                        colorVariant="text"
                        styleVariant="transparent"
                        spacing={spacing}
                        spacingOffset={spacingOffset}
                        withoutPadding={withoutPadding}
                        withFullWidth={!withoutFullWidth}
                        before={before}
                        after={after}
                        textSize={textSize}
                        disabled={disabled}
                    >
                        {children}
                    </ButtonLayout>
                </RawButton>
                {showConfirmation && (
                    <Dialog
                        heading={confirmHeading}
                        closeOnEscape={false}
                        size="sm"
                        footerActions={(
                            <ListView spacing="sm">
                                <Button
                                    name={false}
                                    onClick={setShowConfirmation}
                                >
                                    {strings.buttonCancel}
                                </Button>
                                <Button
                                    name={name}
                                    variant="primary"
                                    onClick={handleConfirmClick}
                                >
                                    {strings.buttonOk}
                                </Button>
                            </ListView>
                        )}
                    >
                        {confirmMessage}
                    </Dialog>
                )}
            </>
        );
    }
}

export default DropdownMenuItem;
