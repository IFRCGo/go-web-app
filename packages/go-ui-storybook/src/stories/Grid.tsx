import {
    Grid as PureGrid,
    GridProps,
    ListKey,
} from '@ifrc-go/ui';

function Grid<
DATUM,
KEY extends
ListKey,
RENDERER_PROPS,
>(props: GridProps<DATUM, KEY, RENDERER_PROPS>) {
    return (
        <PureGrid {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Grid;
