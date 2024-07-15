import {
    Image as PureImage,
    ImageProps,
} from '@ifrc-go/ui';

function Image(props: ImageProps) {
    return (
        <PureImage {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Image;
