import {
    TruncatedList as PureTruncatedList,
    TruncatedListProps as PureTruncatedListProps,
} from '@ifrc-go/ui';

// eslint-disable-next-line max-len
type TruncatedListProps<LIST_ITEM, RENDERER_PROPS> = PureTruncatedListProps<LIST_ITEM, RENDERER_PROPS>

function TruncatedList

<LIST_ITEM, RENDERER_PROPS>(props: TruncatedListProps<LIST_ITEM, RENDERER_PROPS>) {
    return (
        <PureTruncatedList {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default TruncatedList;
