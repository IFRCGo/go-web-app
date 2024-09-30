import {
    RawFileInput as PureRawFileInput,
    type RawFileInputProps,
} from '@ifrc-go/ui';

function RawFileInput< const N>(props: RawFileInputProps<N>) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <PureRawFileInput {...props} />

    );
}

export default RawFileInput;
