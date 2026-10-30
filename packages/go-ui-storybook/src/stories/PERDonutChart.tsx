import {
    PERDonutChart as PurePERDonutChart,
    PERDonutChartProps,
} from '@ifrc-go/ui';

function StoryPERDonutChart(props: PERDonutChartProps) {
    return (
        <PurePERDonutChart {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default StoryPERDonutChart;
