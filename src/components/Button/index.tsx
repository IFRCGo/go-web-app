import { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import useBasicLayout from '#hooks/useBasicLayout';
import RawButton, { Props as RawButtonProps } from '#components/RawButton';
import styles from './styles.module.css';

// NOTE: Adding a 'tertiary-on-dark' to use 'tertiary' button on darker backgrounds
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'tertiary-on-dark';

const buttonVariantToStyleMap: Record<ButtonVariant, string> = {
    primary: styles.primary,
    secondary: styles.secondary,
    tertiary: styles.tertiary,
    'tertiary-on-dark': styles.tertiaryOnDark,
};

export interface ButtonFeatureProps {
    className?: string;
    children?: React.ReactNode;
    variant?: ButtonVariant;
    actions?: React.ReactNode;
    actionsContainerClassName?: string;
    childrenContainerClassName?: string;
    disabled?: boolean;
    icons?: React.ReactNode;
    iconsContainerClassName?: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useButtonFeatures(props: ButtonFeatureProps) {
    const {
        actions,
        actionsContainerClassName: actionsClassName,
        children,
        childrenContainerClassName: childrenClassName,
        className,
        disabled,
        icons,
        iconsContainerClassName: iconsClassName,
        variant = 'primary',
    } = props;

    const buttonClassName = _cs(
        styles.button,
        buttonVariantToStyleMap[variant],
        disabled && styles.disabled,
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
        spacing: 'compact',
    });

    return {
        className: containerClassName,
        children: content,
        disabled,
    };
}

export interface Props<N> extends ButtonFeatureProps, RawButtonProps<N> {
    name: N;
    onClick?: (name: N, e: React.MouseEvent<HTMLButtonElement>) => void;
}

function Button<N>(props: Props<N>) {
    const {
        actions,
        actionsContainerClassName: actionsClassName,
        children,
        childrenContainerClassName: childrenClassName,
        className,
        disabled,
        icons,
        iconsContainerClassName: iconsClassName,
        name,
        onClick,
        variant,
        type = 'button',
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
        actionsContainerClassName: actionsClassName,
        iconsContainerClassName: iconsClassName,
        childrenContainerClassName: childrenClassName,
        children,
        icons,
        actions,
        // NOTE: disabling a button if there is on onClick handler
        disabled: disabled || (type !== 'submit' && !onClick),
    });

    return (
        <RawButton
            name={name}
            type={type}
            onClick={handleButtonClick}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...buttonProps}
        />
    );
}

export default Button;
