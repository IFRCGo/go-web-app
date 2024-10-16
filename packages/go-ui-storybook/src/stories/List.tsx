import {
    List as PureList,
    ListProps as PureListProps,
} from '@ifrc-go/ui';

type ListKey = string | number | boolean
interface ListProps<DATUM, KEY extends ListKey, RENDERER_PROPS>
    extends PureListProps<DATUM, KEY, RENDERER_PROPS> {}

function List<
    DATUM,
    KEY extends ListKey,
    RENDERER_PROPS,
>(props: ListProps<DATUM, KEY, RENDERER_PROPS>) {
    return (
        <PureList {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default List;
