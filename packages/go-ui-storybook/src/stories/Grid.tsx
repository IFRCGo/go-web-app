import {
    Grid as PureGrid,
    GridProps as PureGridProps,
    ListKey,
} from '@ifrc-go/ui';

interface GridProps< DATUM, KEY extends ListKey, RENDERER_PROPS>
extends PureGridProps< DATUM, KEY, RENDERER_PROPS> {}

function Grid
// eslint-disable-next-line max-len
<DATUM, KEY extends ListKey, RENDERER_PROPS>(props: GridProps<DATUM, KEY, RENDERER_PROPS>) {
    return (
        <PureGrid {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Grid;
