import {
    RawFileInput as PureRawFileInput,
    RawFileInputProps,
} from '@ifrc-go/ui';

function RawFileInput< const N>(props: RawFileInputProps<N>) {
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <PureRawFileInput {...props} />

    );
}

export default RawFileInput;
