import {
    ReducedListDisplay as PureReducedListDisplay,
    type ReducedListDisplayProps as PureReducedListDisplayProps,
} from '@ifrc-go/ui';

// eslint-disable-next-line max-len
type ReducedListDisplayProps<LIST_ITEM, RENDERER_PROPS> = PureReducedListDisplayProps<LIST_ITEM, RENDERER_PROPS>

function ReducedListDisplay
// eslint-disable-next-line max-len
<LIST_ITEM, RENDERER_PROPS>(props: ReducedListDisplayProps<LIST_ITEM, RENDERER_PROPS>) {
    return (
        <PureReducedListDisplay {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default ReducedListDisplay;
