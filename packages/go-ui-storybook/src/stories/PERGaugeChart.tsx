import {
    PERGaugeChart as PurePERGaugeChart,
    type PERGaugeChartProps,
} from '@ifrc-go/ui';

function StoryPERGaugeChart(props: PERGaugeChartProps) {
    return (
        <PurePERGaugeChart {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default StoryPERGaugeChart;
