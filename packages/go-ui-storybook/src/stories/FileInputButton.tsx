import {
    FileInputButton as PureFileInputButton,
    FileInputButtonProps,
} from '@ifrc-go/ui';

function FileInputButton< const N>(props: FileInputButtonProps<N>) {
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <PureFileInputButton {...props} />

    );
}

export default FileInputButton;
