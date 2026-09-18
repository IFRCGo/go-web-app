import BubbleLayer from '../BubbleLayer';
import { MALAWI_ISO3 } from '../constants';
import DistrictChoroplethLayer from '../DistrictChoroplethLayer';
import LocalUnitsLayer from '../LocalUnitsLayer';
import useThematicLayers, { type SourceMetric } from '../useThematicLayers';
import { type AdminArea } from '../utils';

interface Props {
    sourceMetric: SourceMetric | undefined;
    adminAreaByCode: Record<string, AdminArea | undefined>;
}

function ThematicLayers(props: Props) {
    const {
        sourceMetric,
        adminAreaByCode,
    } = props;

    const {
        shade,
        bubble,
        showLocalUnits,
    } = useThematicLayers(sourceMetric);

    return (
        <>
            <DistrictChoroplethLayer
                iso3={MALAWI_ISO3}
                colorByPcode={shade.colorByPcode}
            />
            <BubbleLayer
                valueByPcode={bubble.valueByPcode}
                maxValue={bubble.maxValue}
                color={bubble.color}
                adminAreaByCode={adminAreaByCode}
            />
            {showLocalUnits && <LocalUnitsLayer />}
        </>
    );
}

export default ThematicLayers;
