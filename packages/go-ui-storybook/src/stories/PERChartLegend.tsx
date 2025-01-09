import {
    PERChartLegend as PurePERChartLegend,
    PERChartLegendProps,
} from '@ifrc-go/ui';

function StoryPERChartLegend(props: PERChartLegendProps) {
    return (
        <PurePERChartLegend {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default StoryPERChartLegend;
