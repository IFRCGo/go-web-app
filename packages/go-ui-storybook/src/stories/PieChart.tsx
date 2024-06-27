import {
    PieChart as PurePieChart,
    PieChartProps,
} from '@ifrc-go/ui';

function PieChart<const D>(props: PieChartProps<D>) {
    return (
        <PurePieChart {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default PieChart;
