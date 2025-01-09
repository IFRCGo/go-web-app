import PERGaugeChart from '../../../ui/src/components/PERGaugeChart';
import type { Props as PERGaugeChartProps } from '../../../ui/src/components/PERGaugeChart';

function StoryPERGaugeChart(props: PERGaugeChartProps) {
    return (
        <PERGaugeChart {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default StoryPERGaugeChart;
