import {
    RawFileInput as PureRawFileInput,
    RawFileInputProps as PureRawFileInputProps,
} from '@ifrc-go/ui';

type RawFileInputProps<N> = PureRawFileInputProps<N>;

function RawFileInput< const N>(props: RawFileInputProps<N>) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <PureRawFileInput {...props} />

    );
}

export default RawFileInput;
