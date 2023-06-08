import { useCallback } from 'react';

import RawButton, { Props as RawButtonProps } from '#components/RawButton';
import useButtonFeatures, { Props as ButtonFeatureProps } from '#hooks/useButtonFeatures';

export interface Props<N> extends ButtonFeatureProps, RawButtonProps<N> {
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
        type,
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
