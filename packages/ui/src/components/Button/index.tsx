import {
    useCallback,
    useMemo,
} from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import RawButton, { Props as RawButtonProps } from '#components/RawButton';
import { SpacingType } from '#components/types';
import useBasicLayout from '#hooks/useBasicLayout';

import styles from './styles.module.css';

// NOTE: Adding a 'tertiary-on-dark' to use 'tertiary' button on darker backgrounds
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'tertiary-on-dark' | 'dropdown-item';

const buttonVariantToClassNameMap: Record<ButtonVariant, string> = {
    primary: styles.primary,
    secondary: styles.secondary,
    tertiary: styles.tertiary,
    'tertiary-on-dark': styles.tertiaryOnDark,
    'dropdown-item': styles.dropdownItem,
};

const spacingTypeToClassNameMap: Record<SpacingType, string> = {
    none: styles.noSpacing,
    condensed: styles.condensedSpacing,
    compact: styles.compactSpacing,
    cozy: styles.cozySpacing,
    default: styles.defaultSpacing,
    comfortable: styles.comfortableSpacing,
    relaxed: styles.relaxedSpacing,
    loose: styles.looseSpacing,
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
    spacing?: SpacingType;
    ellipsize?: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useButtonFeatures(props: ButtonFeatureProps) {
    const {
        actions,
        actionsContainerClassName: actionsClassName,
        children: childrenFromProps,
        childrenContainerClassName: childrenClassName,
        className,
        disabled,
        icons,
        iconsContainerClassName: iconsClassName,
        variant = 'primary',
        spacing = 'default',
        ellipsize,
    } = props;

    const buttonClassName = _cs(
        styles.button,
        buttonVariantToClassNameMap[variant],
        spacingTypeToClassNameMap[spacing],
        disabled && styles.disabled,
        ellipsize && styles.ellipsized,
        className,
    );

    const children = useMemo(
        () => {
            if (!ellipsize) {
                return childrenFromProps;
            }

            return (
                <div className={styles.overflowWrapper}>
                    {childrenFromProps}
                </div>
            );
        },
        [ellipsize, childrenFromProps],
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
        childrenContainerClassName: _cs(styles.children, childrenClassName),
        actionsContainerClassName: actionsClassName,
        spacing,
        withoutWrap: true,
        variant: 'xs',
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

function Button<const N>(props: Props<N>) {
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
        spacing,
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
        spacing,
        // NOTE: disabling a button if there is on onClick handler
        disabled: disabled || (type !== 'submit' && isNotDefined(onClick)),
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
