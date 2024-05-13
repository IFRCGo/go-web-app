import {
    Image as PureImage,
    ImageProps as PureImageProps,
} from '@ifrc-go/ui';

interface ImageProps extends PureImageProps {}

function WrappedImage(props: ImageProps) {
    return (
        <PureImage {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedImage;
