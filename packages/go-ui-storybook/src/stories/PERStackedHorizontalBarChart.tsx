import {
    PERStackedHorizontalBarChart as PurePERStackedHorizontalBarChart,
    PERStackedHorizontalBarChartProps,
} from '@ifrc-go/ui';

function PERStackedHorizontalBarChart(props: PERStackedHorizontalBarChartProps) {
    return (
        <PurePERStackedHorizontalBarChart {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default PERStackedHorizontalBarChart;
