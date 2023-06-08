import { _cs } from '@togglecorp/fujs';
import useBasicLayout from '#hooks/useBasicLayout';

import styles from './styles.module.css';

// NOTE: Adding a 'tertiary-on-dark' to use 'tertiary' button on darker backgrounds
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'tertiary-on-dark';

const buttonVariantToStyleMap: Record<ButtonVariant, string> = {
    primary: styles.primary,
    secondary: styles.secondary,
    tertiary: styles.tertiary,
    'tertiary-on-dark': styles.tertiaryOnDark,
};

export interface Props {
    className?: string;
    children?: React.ReactNode;
    variant?: ButtonVariant;
    actions?: React.ReactNode;
    actionsClassName?: string;
    childrenClassName?: string;
    disabled?: boolean;
    icons?: React.ReactNode;
    iconsClassName?: string;
}

function useButtonFeatures(props: Props) {
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
        spacing: 'compact',
    });

    return {
        className: containerClassName,
        children: content,
        disabled,
    };
}

export default useButtonFeatures;
