import {
    NumberOutput as PureNumberOutput,
    type NumberOutputProps,
} from '@ifrc-go/ui';

function NumberOutput(props: NumberOutputProps) {
    return (
        <PureNumberOutput {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default NumberOutput;
