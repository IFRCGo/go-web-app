import {
    LegendItem as PureLegendItem,
    type LegendItemProps,
} from '@ifrc-go/ui';

function LegendItem(props: LegendItemProps) {
    return (
        <PureLegendItem {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default LegendItem;
