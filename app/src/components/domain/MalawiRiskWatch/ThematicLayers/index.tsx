import { isDefined } from '@togglecorp/fujs';

import BubbleLayer from '../BubbleLayer';
import CogRasterLayer from '../CogRasterLayer';
import { MALAWI_ISO3 } from '../constants';
import DistrictChoroplethLayer from '../DistrictChoroplethLayer';
import DistrictTriggerOutlineLayer from '../DistrictTriggerOutlineLayer';
import LocalUnitsLayer from '../LocalUnitsLayer';
import useCogInfo from '../useCogInfo';
import useThematicLayers, {
    type SourceMetric,
    type SourceRaster,
} from '../useThematicLayers';
import { type AdminArea } from '../utils';

interface Props {
    sourceMetric: SourceMetric | undefined;
    adminAreaByCode: Record<string, AdminArea | undefined>;
    rasters?: SourceRaster[];
    // Districts to highlight with a red trigger outline (ARC only)
    triggeredPcodes?: string[];
}

function ThematicLayers(props: Props) {
    const {
        sourceMetric,
        adminAreaByCode,
        rasters,
        triggeredPcodes,
    } = props;

    const {
        shade,
        bubble,
        raster,
        showLocalUnits,
    } = useThematicLayers(sourceMetric, rasters);
    const { cog } = useCogInfo(raster.option?.url);

    return (
        <>
            <DistrictChoroplethLayer
                iso3={MALAWI_ISO3}
                colorByPcode={shade.colorByPcode}
            />
            {isDefined(cog) && (
                <CogRasterLayer
                    sourceKey="malawi-raster"
                    cog={cog}
                    colors={raster.colors}
                    opacity={raster.opacity}
                />
            )}
            <BubbleLayer
                valueByPcode={bubble.valueByPcode}
                maxValue={bubble.maxValue}
                color={bubble.color}
                adminAreaByCode={adminAreaByCode}
            />
            {showLocalUnits && <LocalUnitsLayer />}
            {/* Last, with no `beneath`, so the trigger outline sits above all layers */}
            {isDefined(triggeredPcodes) && (
                <DistrictTriggerOutlineLayer
                    iso3={MALAWI_ISO3}
                    triggeredPcodes={triggeredPcodes}
                />
            )}
        </>
    );
}

export default ThematicLayers;
