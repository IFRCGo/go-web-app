import { useTranslation } from '@ifrc-go/ui/hooks';
import type { LngLatBoundsLike } from 'mapbox-gl';

import RiskImminentEventMap from '#components/domain/RiskImminentEventMap';

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

    if (source === 'jba') {
        return (
            <Jba
                title={title}
                bbox={bbox}
            />
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
