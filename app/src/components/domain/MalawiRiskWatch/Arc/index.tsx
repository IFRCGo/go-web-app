import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { TextOutput } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { formatDate } from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';
import type { LngLatBoundsLike } from 'mapbox-gl';
import { useQuery } from 'urql';

import RiskImminentEventMap from '#components/domain/RiskImminentEventMap';
import { MAX_PAGE_LIMIT } from '#utils/constants';

import LayersPanel from '../LayersPanel';
import RunSelectInput from '../RunSelectInput';
import ThematicLayers from '../ThematicLayers';
import ThematicLegend from '../ThematicLegend';
import useMalawiAdminAreas from '../useMalawiAdminAreas';
import { type SourceMetric } from '../useThematicLayers';
import {
    getDistrictFootprint,
    getDistrictPointFeature,
} from '../utils';
import EventDetails from './EventDetails';
import EventListItem from './EventListItem';
import {
    ARC_OBSERVATIONS_QUERY,
    ARC_TRIGGER_EVENTS_QUERY,
} from './queries';
import TriggerStatus from './TriggerStatus';
import {
    type ArcDistrictEvent,
    getDistrictEvents,
    getImpactValues,
    getNationalReturnPeriod,
    getObservationDates,
    getTriggeredDistrictCount,
    toObservations,
} from './utils';

import i18n from './i18n.json';

interface DateOption {
    date: string;
}

function dateKeySelector(option: DateOption) {
    return option.date;
}
function dateLabelSelector(option: DateOption) {
    return formatDate(option.date) ?? option.date;
}
function eventKeySelector(event: ArcDistrictEvent) {
    return event.id;
}
function hazardTypeSelector() {
    return 'FL' as const;
}

interface Props {
    title: React.ReactNode;
    bbox: LngLatBoundsLike | undefined;
}

function Arc(props: Props) {
    const {
        title,
        bbox,
    } = props;

    const strings = useTranslation(i18n);

    const [selectedDate, setSelectedDate] = useState<string | undefined>();
    const [activeEventId, setActiveEventId] = useState<string | undefined>();

    const [observationsResult] = useQuery({
        query: ARC_OBSERVATIONS_QUERY,
        variables: { limit: MAX_PAGE_LIMIT },
    });
    const [triggerEventsResult] = useQuery({
        query: ARC_TRIGGER_EVENTS_QUERY,
        variables: { limit: MAX_PAGE_LIMIT },
    });

    const {
        adminAreaByCode,
        pending: adminAreasPending,
    } = useMalawiAdminAreas();

    const observations = useMemo(
        () => toObservations(observationsResult.data?.arcRainfallObservations.results),
        [observationsResult.data],
    );
    const dates = useMemo(
        () => getObservationDates(observations),
        [observations],
    );
    const dateOptions = useMemo<DateOption[]>(
        () => dates.map((date) => ({ date })),
        [dates],
    );
    const activeDate = isDefined(selectedDate) && dates.includes(selectedDate)
        ? selectedDate
        : dates[0];

    const triggerEvent = triggerEventsResult.data?.arcTriggerEvents.results
        .find((item) => item.triggerDate === activeDate);
    const events = useMemo(
        () => getDistrictEvents(observations, activeDate, adminAreaByCode, triggerEvent),
        [observations, activeDate, adminAreaByCode, triggerEvent],
    );
    const nationalReturnPeriod = useMemo(
        () => getNationalReturnPeriod(observations, activeDate),
        [observations, activeDate],
    );
    const triggeredCount = useMemo(
        () => getTriggeredDistrictCount(observations, activeDate),
        [observations, activeDate],
    );
    const districtCount = useMemo(
        () => observations
            .filter((observation) => observation.observationDate === activeDate)
            .length,
        [observations, activeDate],
    );

    const sourceMetric = useMemo<SourceMetric>(
        () => ({
            label: strings.arcMetricLabel,
            ...getImpactValues(observations, activeDate),
        }),
        [observations, activeDate, strings.arcMetricLabel],
    );

    const activeEvent = events.find((event) => event.id === activeEventId);
    const footprintSelector = useCallback(
        () => getDistrictFootprint(activeEvent?.adminArea),
        [activeEvent],
    );

    const pending = observationsResult.fetching
        || triggerEventsResult.fetching
        || adminAreasPending;
    const errored = isDefined(observationsResult.error) || isDefined(triggerEventsResult.error);

    return (
        <RiskImminentEventMap
            events={events}
            keySelector={eventKeySelector}
            hazardTypeSelector={hazardTypeSelector}
            pointFeatureSelector={getDistrictPointFeature}
            footprintSelector={footprintSelector}
            activeEventExposure={undefined}
            activeEventExposurePending={false}
            listItemRenderer={EventListItem}
            detailRenderer={EventDetails}
            pending={pending}
            errored={errored}
            errorMessage={strings.arcLoadFailedMessage}
            emptyMessage={dates.length > 0
                ? strings.arcNoImpactMessage
                : strings.arcNoObservationsMessage}
            sidePanelHeading={title}
            headerActions={(
                <RunSelectInput
                    options={dateOptions}
                    keySelector={dateKeySelector}
                    labelSelector={dateLabelSelector}
                    value={activeDate}
                    onChange={setSelectedDate}
                    disabled={observationsResult.fetching}
                    infoTitle={strings.arcObservationInfoTitle}
                    infoDetails={(
                        <TextOutput
                            label={strings.arcObservationDateLabel}
                            value={activeDate}
                            valueType="date"
                            strongValue
                        />
                    )}
                />
            )}
            headerDescription={isDefined(activeDate) && (
                <TriggerStatus
                    returnPeriod={nationalReturnPeriod}
                    triggeredCount={triggeredCount}
                    districtCount={districtCount}
                    triggerEvent={triggerEvent}
                />
            )}
            bbox={bbox}
            onActiveEventChange={setActiveEventId}
            withoutActiveEventFit
            mapChildren={(
                <ThematicLayers
                    sourceMetric={sourceMetric}
                    adminAreaByCode={adminAreaByCode}
                />
            )}
            mapLegend={<ThematicLegend sourceMetric={sourceMetric} />}
            layerSelection={<LayersPanel sourceMetricLabel={sourceMetric.label} />}
        />
    );
}

export default Arc;
