import {
    List as PureList,
    ListKey,
    ListProps as PureListProps,
} from '@ifrc-go/ui';

interface ListProps< DATUM, KEY extends ListKey, RENDERER_PROPS>
extends PureListProps< DATUM, KEY, RENDERER_PROPS> {}

function WrappedList
// eslint-disable-next-line max-len
<DATUM, KEY extends ListKey, RENDERER_PROPS>(props: ListProps<DATUM, KEY, RENDERER_PROPS>) {
    return (
        <PureList {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedList;
