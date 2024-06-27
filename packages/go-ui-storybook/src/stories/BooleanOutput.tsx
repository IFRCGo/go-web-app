import {
    BooleanOutput as PureBooleanOutput,
    BooleanOutputProps,
} from '@ifrc-go/ui';

function BooleanOutput(props: BooleanOutputProps) {
    return (
        <PureBooleanOutput {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default BooleanOutput;
