import {
    ChartAxisY as PureChartAxisY,
    ChartAxisYProps as PureChartAxisYProps,
} from '@ifrc-go/ui';

interface ChartAxisYProps extends PureChartAxisYProps {}

function WrappedChartAxisY(props: ChartAxisYProps) {
    return (
        <PureChartAxisY
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default WrappedChartAxisY;
