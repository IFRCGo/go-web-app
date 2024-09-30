import {
    BlockLoading as PureBlockLoading,
    type BlockLoadingProps,
} from '@ifrc-go/ui';

function Blockloading(props: BlockLoadingProps) {
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <PureBlockLoading {...props} />
    );
}
export default Blockloading;
