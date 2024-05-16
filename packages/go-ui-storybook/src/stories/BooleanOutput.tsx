import {
    BooleanOutput as PureBooleanOutput,
    BooleanOutputProps as PureBooleanOutputProps,
} from '@ifrc-go/ui';

interface BooleanOutputProps extends PureBooleanOutputProps{}

function WrappedBooleanOutput(props: BooleanOutputProps) {
    return (
        <PureBooleanOutput {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedBooleanOutput;
