import {
    InlineView as PureInlineView,
    InlineViewProps,
} from '@ifrc-go/ui';

function InlineView(props: InlineViewProps) {
    return (
        <PureInlineView {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default InlineView;
