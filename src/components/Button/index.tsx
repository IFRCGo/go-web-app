import { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import RawButton, { Props as RawButtonProps } from '#components/RawButton';
import useBasicLayout from '#hooks/useBasicLayout';
import styles from './styles.module.css';

// NOTE:
// Adding a 'tertiary-on-dark' to use 'tertiary' button on darker backgrounds
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'tertiary-on-dark';

const buttonVariantToStyleMap: Record<ButtonVariant, string> = {
    primary: styles.primary,
    secondary: styles.secondary,
    tertiary: styles.tertiary,
    'tertiary-on-dark': styles.tertiaryOnDark,
};

export type ButtonFeatureProps<N> = Omit<Props<N>, 'name' | 'onClick'>;

export function useButtonFeatures<N>(
    props: ButtonFeatureProps<N>,
) {
    const {
        actions,
        actionsClassName,
        children,
        childrenClassName,
        className,
        disabled,
        icons,
        iconsClassName,
        variant = 'primary',
    } = props;

    const buttonClassName = _cs(
        styles.button,
        buttonVariantToStyleMap[variant],
        className,
    );

    const {
        content,
        containerClassName,
    } = useBasicLayout({
        className: buttonClassName,
        icons,
        children,
        actions,
        iconsContainerClassName: iconsClassName,
        childrenContainerClassName: childrenClassName,
        actionsContainerClassName: actionsClassName,
    });

    return {
        className: containerClassName,
        children: content,
        disabled,
    };
}

export interface Props<N> extends RawButtonProps<N> {
    variant?: ButtonVariant;
    actions?: React.ReactNode;
    actionsClassName?: string;
    childrenClassName?: string;
    disabled?: boolean;
    icons?: React.ReactNode;
    iconsClassName?: string;
    name: N;
    onClick?: (name: N, e: React.MouseEvent<HTMLButtonElement>) => void;
}

function Button<N>(props: Props<N>) {
    const {
        actions,
        actionsClassName,
        children,
        childrenClassName,
        className,
        disabled,
        icons,
        iconsClassName,
        name,
        onClick,
        variant,
        ...otherProps
    } = props;

    const handleButtonClick = useCallback((n: N, e: React.MouseEvent<HTMLButtonElement>) => {
        if (onClick) {
            onClick(n, e);
        }
    }, [onClick]);

    const buttonProps = useButtonFeatures({
        variant,
        className,
        actionsClassName,
        iconsClassName,
        childrenClassName,
        children,
        icons,
        actions,
        // NOTE: disabling a button if there is on onClick handler
        disabled: disabled || !onClick,
    });

    return (
        <RawButton
            name={name}
            type="button"
            onClick={handleButtonClick}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...buttonProps}
        />
    );
}

export default Button;
