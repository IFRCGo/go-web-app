import {
    List as PureList,
    type ListProps as PureListProps,
} from '@ifrc-go/ui';

type ListKey = string | number | boolean
type ListProps<
    DATUM,
    KEY extends ListKey,
    RENDERER_PROPS
> = PureListProps<DATUM, KEY, RENDERER_PROPS>

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
