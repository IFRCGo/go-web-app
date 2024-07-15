import {
    TimeSeriesChart as PureTimeSeriesChart,
    TimeSeriesChartProps,
} from '@ifrc-go/ui';

function TimeSeriesChart<const K extends string>(props: TimeSeriesChartProps<K>) {
    return (
        <PureTimeSeriesChart {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default TimeSeriesChart;
