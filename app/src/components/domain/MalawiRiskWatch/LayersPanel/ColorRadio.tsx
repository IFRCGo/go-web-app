import {
    ButtonLayout,
    RawButton,
} from '@ifrc-go/ui';

import { type LayerColor } from '../constants';

interface Props {
    name: LayerColor;
    onClick: (name: LayerColor) => void;
    value: boolean;
    title: string;
    children?: React.ReactNode;
    disabled?: boolean;
    readOnly?: boolean;
}

// Swatch-only radio: the colour itself is the label
function ColorRadio(props: Props) {
    const {
        name,
        onClick,
        value,
        title,
        children,
        disabled,
        readOnly,
    } = props;

    return (
        <RawButton
            name={name}
            title={title}
            onClick={onClick}
            disabled={disabled || readOnly}
        >
            <ButtonLayout
                styleVariant={value ? 'translucent' : 'transparent'}
                colorVariant="primary"
                textSize="sm"
                disabled={disabled}
                withoutAdditionalInlinePadding
            >
                {children}
            </ButtonLayout>
        </RawButton>
    );
}

export default ColorRadio;
