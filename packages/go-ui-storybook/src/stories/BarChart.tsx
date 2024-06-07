import {
    BarChart as PureBarChart,
    BarChartProps as PureBarChartProps,
} from '@ifrc-go/ui';

export type BarChartProps<D> = PureBarChartProps<D>

function BarChart<const D>(props: BarChartProps<D>) {
    return (
        <PureBarChart {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default BarChart;
