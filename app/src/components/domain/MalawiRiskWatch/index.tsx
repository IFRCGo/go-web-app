import {
    useMemo,
    useState,
} from 'react';
import { useTranslation } from '@ifrc-go/ui/hooks';
import type { LngLatBoundsLike } from 'mapbox-gl';

import RiskImminentEventMap from '#components/domain/RiskImminentEventMap';

import {
    DEFAULT_BUBBLE_COLOR,
    DEFAULT_SHADE_COLOR,
    FORECAST_METRIC_KEY,
    type LayerColor,
} from './constants';
import MalawiLayersContext, { type LayerSelection } from './context';
import Jba from './Jba';
import { type MalawiRiskWatchSource } from './utils';

import i18n from './i18n.json';

// Placeholder until the ARC source is added
const noEvents: never[] = [];
function keySelector(event: never): string {
    return event;
}
function hazardTypeSelector() {
    return 'FL' as const;
}
function noFeatureSelector() {
    return undefined;
}
function noop() {}
function EmptyRenderer() {
    return null;
}

interface Props {
    source: MalawiRiskWatchSource;
    title: React.ReactNode;
    bbox: LngLatBoundsLike | undefined;
}

function MalawiRiskWatch(props: Props) {
    const {
        source,
        title,
        bbox,
    } = props;

    const strings = useTranslation(i18n);

    const [shadeEnabled, setShadeEnabled] = useState(true);
    const [shadeLayer, setShadeLayer] = useState<LayerSelection | undefined>(
        { key: FORECAST_METRIC_KEY, format: 'number' },
    );
    const [shadeColor, setShadeColor] = useState<LayerColor>(DEFAULT_SHADE_COLOR);
    const [bubbleEnabled, setBubbleEnabled] = useState(true);
    const [bubbleLayer, setBubbleLayer] = useState<LayerSelection | undefined>();
    const [bubbleColor, setBubbleColor] = useState<LayerColor>(DEFAULT_BUBBLE_COLOR);
    const [showLocalUnits, setShowLocalUnits] = useState(false);
    const layersContextValue = useMemo(
        () => ({
            shadeEnabled,
            setShadeEnabled,
            shadeLayer,
            setShadeLayer,
            shadeColor,
            setShadeColor,
            bubbleEnabled,
            setBubbleEnabled,
            bubbleLayer,
            setBubbleLayer,
            bubbleColor,
            setBubbleColor,
            showLocalUnits,
            setShowLocalUnits,
        }),
        [
            shadeEnabled,
            shadeLayer,
            shadeColor,
            bubbleEnabled,
            bubbleLayer,
            bubbleColor,
            showLocalUnits,
        ],
    );

    if (source === 'jba') {
        return (
            <MalawiLayersContext.Provider value={layersContextValue}>
                <Jba
                    title={title}
                    bbox={bbox}
                />
            </MalawiLayersContext.Provider>
        );
    }

    return (
        <RiskImminentEventMap
            events={noEvents}
            keySelector={keySelector}
            hazardTypeSelector={hazardTypeSelector}
            pointFeatureSelector={noFeatureSelector}
            footprintSelector={noFeatureSelector}
            activeEventExposure={undefined}
            activeEventExposurePending={false}
            listItemRenderer={EmptyRenderer}
            detailRenderer={EmptyRenderer}
            pending={false}
            sidePanelHeading={title}
            emptyMessage={strings.noDataMessage}
            bbox={bbox}
            onActiveEventChange={noop}
        />
    );
}

export default MalawiRiskWatch;
