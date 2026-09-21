import {
    PERTreemapChart as PurePERTreemapChart,
    PERTreemapChartProps,
} from '@ifrc-go/ui';

function PERTreemapChart(props: PERTreemapChartProps) {
    return (
        <PurePERTreemapChart {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default PERTreemapChart;
