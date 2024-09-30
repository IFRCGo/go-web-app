import {
    type ListKey,
    RawList as PureRawList,
    type RawListProps,
} from '@ifrc-go/ui';

function RawList
// eslint-disable-next-line max-len
<DATUM, KEY extends ListKey, RENDERER_PROPS>(props: RawListProps<DATUM, KEY, RENDERER_PROPS>) {
    return (
        <PureRawList {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default RawList;
