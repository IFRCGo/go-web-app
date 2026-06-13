import {
    Tag as PureTag,
    TagProps,
} from '@ifrc-go/ui';

function Tag(props: TagProps) {
    return (
        <PureTag {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Tag;
