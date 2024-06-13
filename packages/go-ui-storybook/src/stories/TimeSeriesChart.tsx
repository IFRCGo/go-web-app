import { ComponentProps } from 'react';
import { TimeSeriesChart as PureTimeSeriesChart } from '@ifrc-go/ui';

// FIXME: let's export TimeSeriesChartProps from @ifrc-go/ui
type TimeSeriesChartProps<K extends string> = ComponentProps<typeof PureTimeSeriesChart<K>>

function TimeSeriesChart<const K extends string>(props: TimeSeriesChartProps<K>) {
    return (
        <PureTimeSeriesChart {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default TimeSeriesChart;
