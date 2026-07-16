import { useMemo } from 'react';
import { isDefined } from '@togglecorp/fujs';

import ButtonLayout, {
    ButtonColorVariant,
    Props as ButtonLayoutProps,
} from '#components/ButtonLayout';
import RawButton, { Props as RawButtonProps } from '#components/RawButton';

import styles from './styles.module.css';

type PickedButtonLayoutProps =
    | 'styleVariant'
    | 'colorVariant'
    | 'spacing'
    | 'spacingOffset'
    | 'withoutPadding'
    | 'withoutAdditionalInlinePadding'
    | 'withFullWidth'
    | 'children'
    | 'before'
    | 'textSize'
    | 'after'

export type Props<NAME> = Omit<RawButtonProps<NAME>, 'elementRef' | 'children'>
& Pick<ButtonLayoutProps, PickedButtonLayoutProps>
& {
    layoutElementRef?: ButtonLayoutProps['elementRef'];
};

function Button<const NAME>(props: Props<NAME>) {
    const {
        colorVariant: colorVariantFromProps,
        styleVariant = 'outline',
        spacing,
        spacingOffset = -3,
        withoutPadding,
        withFullWidth,
        withoutAdditionalInlinePadding,
        before,
        after,
        textSize,

        layoutElementRef,

        name,
        onClick,
        children,
        disabled,

        className,
        type = 'button',

        ...rawButtonProps
    } = props;

    const colorVariant = useMemo<ButtonColorVariant>(() => {
        if (isDefined(colorVariantFromProps)) {
            return colorVariantFromProps;
        }

        if (styleVariant === 'action' || styleVariant === 'transparent') {
            return 'text';
        }

        return 'primary';
    }, [styleVariant, colorVariantFromProps]);

    return (
        <RawButton
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rawButtonProps}
            className={styles.button}
            name={name}
            onClick={onClick}
            type={type}
            disabled={disabled}
        >
            <ButtonLayout
                className={className}
                elementRef={layoutElementRef}
                colorVariant={colorVariant}
                styleVariant={styleVariant}
                spacing={spacing}
                spacingOffset={spacingOffset}
                withoutPadding={withoutPadding}
                withoutAdditionalInlinePadding={withoutAdditionalInlinePadding}
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
