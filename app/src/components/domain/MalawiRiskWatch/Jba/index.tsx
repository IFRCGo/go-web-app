import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    InfoPopup,
    ListView,
    SelectInput,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { formatDate } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import type { LngLatBoundsLike } from 'mapbox-gl';
import { useQuery } from 'urql';

import RiskImminentEventMap, { type EventPointFeature } from '#components/domain/RiskImminentEventMap';
import { type RiskLayerProperties } from '#components/domain/RiskImminentEventMap/utils';
import { MAX_PAGE_LIMIT } from '#utils/constants';

import {
    JBA_DEFAULT_LEAD_TIME_DAYS,
    JBA_IMPACT_THRESHOLD,
    JBA_RUNS_LIMIT,
} from '../constants';
import LayersPanel from '../LayersPanel';
import ThematicLayers from '../ThematicLayers';
import ThematicLegend from '../ThematicLegend';
import useMalawiAdminAreas from '../useMalawiAdminAreas';
import { type SourceMetric } from '../useThematicLayers';
import {
    getAdminAreaBbox,
    getAdminAreaCentroid,
} from '../utils';
import EventDetails from './EventDetails';
import EventListItem from './EventListItem';
import ForecastDayInput from './ForecastDayInput';
import {
    JBA_FORECAST_IMPACTS_QUERY,
    JBA_INGESTION_RUNS_QUERY,
} from './queries';
import {
    getDistrictEvents,
    getForecastDays,
    getImpactValues,
    groupRowsByDistrict,
    type JbaDistrictEvent,
} from './utils';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface IngestionRun {
    id: string;
    runDate: string;
    status: string;
}

function runKeySelector(run: IngestionRun) {
    return run.id;
}
function runLabelSelector(run: IngestionRun) {
    return formatDate(run.runDate) ?? run.runDate;
}
function eventKeySelector(event: JbaDistrictEvent) {
    return event.id;
}
function hazardTypeSelector() {
    return 'FL' as const;
}

interface Props {
    title: React.ReactNode;
    bbox: LngLatBoundsLike | undefined;
}

function Jba(props: Props) {
    const {
        title,
        bbox,
    } = props;

    const strings = useTranslation(i18n);

    const [selectedRunId, setSelectedRunId] = useState<string | undefined>();
    const [leadTimeDays, setLeadTimeDays] = useState(JBA_DEFAULT_LEAD_TIME_DAYS);
    const [activeEventId, setActiveEventId] = useState<string | undefined>();

    const [runsResult] = useQuery({
        query: JBA_INGESTION_RUNS_QUERY,
        variables: { limit: JBA_RUNS_LIMIT },
    });
    const runs = runsResult.data?.jbaIngestionRuns.results;
    const activeRun = useMemo(
        () => runs?.find((run) => run.id === selectedRunId) ?? runs?.[0],
        [runs, selectedRunId],
    );

    const [impactsResult] = useQuery({
        query: JBA_FORECAST_IMPACTS_QUERY,
        variables: {
            issueDate: activeRun?.runDate ?? '',
            limit: MAX_PAGE_LIMIT,
        },
        pause: isNotDefined(activeRun),
    });

    const {
        adminAreaByCode,
        pending: adminAreasPending,
    } = useMalawiAdminAreas();

    const districts = useMemo(
        () => groupRowsByDistrict(impactsResult.data?.floodForecastImpacts.results),
        [impactsResult.data],
    );
    const forecastDays = useMemo(
        () => getForecastDays(districts),
        [districts],
    );
    const events = useMemo(
        () => getDistrictEvents(districts, adminAreaByCode, leadTimeDays, JBA_IMPACT_THRESHOLD),
        [districts, adminAreaByCode, leadTimeDays],
    );
    const forecastMetric = useMemo<SourceMetric>(
        () => ({
            label: strings.jbaForecastMetricLabel,
            ...getImpactValues(districts, leadTimeDays),
        }),
        [districts, leadTimeDays, strings.jbaForecastMetricLabel],
    );
    const activeEvent = events.find((event) => event.id === activeEventId);

    const pointFeatureSelector = useCallback(
        (event: JbaDistrictEvent): EventPointFeature | undefined => {
            const centroid = getAdminAreaCentroid(event.adminArea);
            if (isNotDefined(centroid)) {
                return undefined;
            }
            return {
                type: 'Feature',
                geometry: centroid,
                properties: {
                    id: event.id,
                    hazard_type: 'FL',
                },
            };
        },
        [],
    );

    const footprintSelector = useCallback(
        () => {
            const districtBbox = getAdminAreaBbox(activeEvent?.adminArea);
            if (isNotDefined(districtBbox)) {
                return undefined;
            }
            const footprint: GeoJSON.FeatureCollection<GeoJSON.Geometry, RiskLayerProperties> = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    geometry: districtBbox,
                    properties: {
                        type: 'exposure',
                        severity: 'unknown',
                    },
                }],
            };
            return footprint;
        },
        [activeEvent],
    );

    const pending = runsResult.fetching
        || impactsResult.fetching
        || adminAreasPending;
    const errored = isDefined(runsResult.error) || isDefined(impactsResult.error);

    return (
        <RiskImminentEventMap
            events={events}
            keySelector={eventKeySelector}
            hazardTypeSelector={hazardTypeSelector}
            pointFeatureSelector={pointFeatureSelector}
            footprintSelector={footprintSelector}
            activeEventExposure={undefined}
            activeEventExposurePending={false}
            listItemRenderer={EventListItem}
            detailRenderer={EventDetails}
            pending={pending}
            errored={errored}
            errorMessage={strings.jbaLoadFailedMessage}
            emptyMessage={strings.jbaNoImpactMessage}
            sidePanelHeading={title}
            headerActions={(
                <SelectInput
                    className={styles.runSelect}
                    name={undefined}
                    options={runs}
                    keySelector={runKeySelector}
                    labelSelector={runLabelSelector}
                    value={activeRun?.id}
                    onChange={setSelectedRunId}
                    disabled={runsResult.fetching}
                    nonClearable
                    actions={isDefined(activeRun) && (
                        <InfoPopup
                            title={strings.jbaRunInfoTitle}
                            description={(
                                <ListView
                                    layout="block"
                                    spacing="xs"
                                >
                                    <TextOutput
                                        label={strings.jbaForecastIssuedLabel}
                                        value={activeRun.runDate}
                                        valueType="date"
                                        strongValue
                                    />
                                    <TextOutput
                                        label={strings.jbaRunStatusLabel}
                                        value={activeRun.status}
                                        strongValue
                                    />
                                </ListView>
                            )}
                        />
                    )}
                />
            )}
            headerDescription={forecastDays.length > 0 && (
                <ForecastDayInput
                    name={undefined}
                    days={forecastDays}
                    value={leadTimeDays}
                    onChange={setLeadTimeDays}
                />
            )}
            bbox={bbox}
            onActiveEventChange={setActiveEventId}
            mapChildren={(
                <ThematicLayers
                    sourceMetric={forecastMetric}
                    adminAreaByCode={adminAreaByCode}
                />
            )}
            mapLegend={<ThematicLegend sourceMetric={forecastMetric} />}
            layerSelection={<LayersPanel sourceMetricLabel={forecastMetric.label} />}
        />
    );
}

export default Jba;
