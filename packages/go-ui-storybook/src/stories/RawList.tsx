import {
    ListKey,
    RawList as PureRawList,
    RawListProps as PureRawListProps,
} from '@ifrc-go/ui';

interface RawListProps< DATUM, KEY extends ListKey, RENDERER_PROPS>
extends PureRawListProps< DATUM, KEY, RENDERER_PROPS> {}

function RawList
// eslint-disable-next-line max-len
<DATUM, KEY extends ListKey, RENDERER_PROPS>(props: RawListProps<DATUM, KEY, RENDERER_PROPS>) {
    return (
        <PureRawList {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default RawList;
