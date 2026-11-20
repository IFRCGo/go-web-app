import { ButtonLayout } from '@ifrc-go/ui';

interface Props {
    label: React.ReactNode;
    colorVariant?: 'primary' | 'success' | 'text';
}

// Small translucent label, not interactive
function Tag(props: Props) {
    const {
        label,
        colorVariant = 'text',
    } = props;

    return (
        <ButtonLayout
            styleVariant="translucent"
            colorVariant={colorVariant}
            textSize="xs"
            spacing="2xs"
            withoutAdditionalInlinePadding
        >
            {label}
        </ButtonLayout>
    );
}

export default Tag;
