import {
    BlockView as PureBlockView,
    BlockViewProps,
} from '@ifrc-go/ui';

function BlockView(props: BlockViewProps) {
    return (
        <PureBlockView {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default BlockView;
