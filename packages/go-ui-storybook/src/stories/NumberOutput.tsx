import {
    NumberOutput as PureNumberOutput,
    NumberOutputProps as PureNumberOutputProps,
} from '@ifrc-go/ui';

type NumberOutputProps = PureNumberOutputProps

function NumberOutput(props: NumberOutputProps) {
    return (
        <PureNumberOutput {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default NumberOutput;
