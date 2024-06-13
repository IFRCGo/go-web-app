import {
    PieChart as PurePieChart,
    PieChartProps as PurePieChartProps,
} from '@ifrc-go/ui';

interface PieChartProps<D> extends PurePieChartProps<D> {}

function PieChart<const D>(props: PieChartProps<D>) {
    return (
        <PurePieChart {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default PieChart;
