import {
    ChartAxisX as PureChartAxisX,
    ChartAxisXProps as PureChartAxisXProps,
} from '@ifrc-go/ui';

interface ChartAxisXProps extends PureChartAxisXProps {}

function WrappedChartAxisX(props: ChartAxisXProps) {
    return (
        <PureChartAxisX
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default WrappedChartAxisX;
