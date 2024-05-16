import {
    TimeSeriesChart as PureTimeSeriesChart,
    TimeSeriesChartProps as PureTimeSeriesChartProps,
} from '@ifrc-go/ui';

interface TimeSeriesChartProps<K> extends PureTimeSeriesChartProps<K> {}

function WrappedTimeSeriesChart<const K extends string>(props: TimeSeriesChartProps<K>) {
    return (
        <PureTimeSeriesChart {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedTimeSeriesChart;
