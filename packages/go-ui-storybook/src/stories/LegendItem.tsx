import {
    LegendItem as PureLegendItem,
    LegendItemProps as PureLegendItemProps,
} from '@ifrc-go/ui';

interface LegendItemProps extends PureLegendItemProps {}

function LegendItem(props: LegendItemProps) {
    return (
        <PureLegendItem {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default LegendItem;
