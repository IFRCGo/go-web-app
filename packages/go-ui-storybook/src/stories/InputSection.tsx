import {
    InputSection as PureInputSection,
    InputSectionProps as PureInputSectionProps,
} from '@ifrc-go/ui';

type InputSectionProps = PureInputSectionProps

function WrappedInputSection(props: InputSectionProps) {
    return (
        <PureInputSection {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedInputSection;