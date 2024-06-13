import {
    BlockLoading as PureBlockLoading,
    BlockLoadingProps as PureBlockLoadingProps,
} from '@ifrc-go/ui';

interface BlockloadingProps extends PureBlockLoadingProps {}

function Blockloading(props: BlockloadingProps) {
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <PureBlockLoading {...props} />
    );
}
export default Blockloading;
