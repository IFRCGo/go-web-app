import {
    ChartAxes as PureChartAxes,
    ChartAxesProps as PureChartAxesProps,
} from '@ifrc-go/ui';

type ChartAxesProps = PureChartAxesProps

function WrappedChartAxes(props: ChartAxesProps) {
    return (
        <PureChartAxes {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedChartAxes;
