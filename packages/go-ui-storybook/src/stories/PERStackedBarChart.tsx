import {
    PERStackedBarChart as PurePERStackedBarChart,
    PERStackedBarChartProps,
} from '@ifrc-go/ui';

function StoryPERStackedBarChart(props: PERStackedBarChartProps) {
    return (
        <PurePERStackedBarChart {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default StoryPERStackedBarChart;
