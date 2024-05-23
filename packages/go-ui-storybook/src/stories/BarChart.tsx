import {
    BarChart as PureBarChart,
    BarChartProps as PureBarChartProps,
} from '@ifrc-go/ui';

type BarChartProps<D> = PureBarChartProps<D>

function WrappedBarChart<const D>(props: BarChartProps<D>) {
    return (
        <PureBarChart {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedBarChart;
