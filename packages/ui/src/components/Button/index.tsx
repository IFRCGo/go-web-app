import { _cs } from '@togglecorp/fujs';

import ButtonLayout, { Props as ButtonLayoutProps } from '#components/ButtonLayout';
import RawButton, { Props as RawButtonProps } from '#components/RawButton';

import styles from './styles.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'subtle';

const variantToLayoutVariant: Record<
    ButtonVariant,
    Required<Pick<ButtonLayoutProps, 'colorVariant' | 'styleVariant'>>
> = {
    primary: { colorVariant: 'primary', styleVariant: 'filled' },
    secondary: { colorVariant: 'primary', styleVariant: 'outline' },
    tertiary: { colorVariant: 'text', styleVariant: 'action' },
    subtle: { colorVariant: 'primary', styleVariant: 'translucent' },
};

type PickedButtonLayoutProps =
    | 'after'
    | 'before'
    | 'children'
    | 'elementRef'
    | 'spacing'
    | 'spacingOffset'
    | 'textSize'
    | 'withFullWidth'
    | 'withoutPadding';

export type Props<NAME> = Omit<RawButtonProps<NAME>, 'children' | 'elementRef'>
& Pick<ButtonLayoutProps, PickedButtonLayoutProps>
& {
    /**
     * Curated visual variant, mapped internally to the ButtonLayout
     * colorVariant + styleVariant axes:
     * primary=(primary, filled), secondary=(primary, outline),
     * tertiary=(text, action), subtle=(primary, translucent)
     */
    variant?: ButtonVariant;
};

/**
 * Standard button (specific layer).
 *
 * Composes RawButton (behavior) with ButtonLayout (visuals) and exposes
 * a single curated `variant` prop instead of ButtonLayout's two-axis
 * colorVariant + styleVariant API. For axis pairs outside the curated
 * set, compose RawButton + ButtonLayout directly.
 *
 * Note on `elementRef`: it references the root element rendered by
 * ButtonLayout, which is the visual root of the component (the native
 * button element wrapping it has `display: contents` and generates
 * no box).
 */
function Button<const NAME>(props: Props<NAME>) {
    const {
        variant = 'secondary',
        spacing,
        spacingOffset = -3,
        withoutPadding,
        withFullWidth,
        before,
        after,
        textSize,

        elementRef,

        name,
        onClick,
        children,
        disabled,

        className,
        type = 'button',

        ...rawButtonProps
    } = props;

    const {
        colorVariant,
        styleVariant,
    } = variantToLayoutVariant[variant];

    return (
        <RawButton
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rawButtonProps}
            className={_cs(styles.button, withFullWidth && styles.fullWidth)}
            name={name}
            onClick={onClick}
            type={type}
            disabled={disabled}
        >
            <ButtonLayout
                className={className}
                elementRef={elementRef}
                colorVariant={colorVariant}
                styleVariant={styleVariant}
                spacing={spacing}
                spacingOffset={spacingOffset}
                withoutPadding={withoutPadding}
                withFullWidth={withFullWidth}
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

export default Button;
