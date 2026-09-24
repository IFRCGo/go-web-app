import {
    ButtonLayout,
    RawButton,
} from '@ifrc-go/ui';

interface Props<NAME extends string | number> {
    name: NAME;
    onClick: (name: NAME) => void;
    value: boolean;
    title?: string;
    children?: React.ReactNode;
    disabled?: boolean;
    readOnly?: boolean;
}

// Radio without the radio icon: the outline marks the selected chip
function ChipRadio<NAME extends string | number>(props: Props<NAME>) {
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
                styleVariant={value ? 'outline' : 'transparent'}
                colorVariant="primary"
                textSize="sm"
                spacing="xs"
                disabled={disabled}
                withoutAdditionalInlinePadding
            >
                {children}
            </ButtonLayout>
        </RawButton>
    );
}

export default ChipRadio;
