import {
    PERStackedHorizontalBarChart as PurePERStackedHorizontalBarChart,
    PERStackedHorizontalBarChartProps,
} from '@ifrc-go/ui';

function PERStackedHorizontalBarChart(props: PERStackedHorizontalBarChartProps) {
    return (
        <PurePERStackedHorizontalBarChart
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default PERStackedHorizontalBarChart;
