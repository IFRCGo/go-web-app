import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { TextOutput } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { formatDate } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import type { LngLatBoundsLike } from 'mapbox-gl';
import { useQuery } from 'urql';

import RiskImminentEventMap from '#components/domain/RiskImminentEventMap';
import { MAX_PAGE_LIMIT } from '#utils/constants';

import {
    JBA_DEFAULT_LEAD_TIME_DAYS,
    JBA_IMPACT_THRESHOLD,
    JBA_RUNS_LIMIT,
} from '../constants';
import LayersPanel from '../LayersPanel';
import RunSelectInput from '../RunSelectInput';
import ThematicLayers from '../ThematicLayers';
import ThematicLegend from '../ThematicLegend';
import useMalawiAdminAreas from '../useMalawiAdminAreas';
import {
    type SourceMetric,
    type SourceRaster,
} from '../useThematicLayers';
import {
    getDistrictFootprint,
    getDistrictPointFeature,
} from '../utils';
import EventDetails from './EventDetails';
import EventListItem from './EventListItem';
import ForecastDayInput from './ForecastDayInput';
import {
    JBA_FORECAST_FILES_QUERY,
    JBA_FORECAST_IMPACTS_QUERY,
    JBA_INGESTION_RUNS_QUERY,
} from './queries';
import {
    getDistrictEvents,
    getForecastDays,
    getImpactValues,
    getLeadTimeDays,
    groupRowsByDistrict,
    type JbaDistrictEvent,
} from './utils';

import i18n from './i18n.json';

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

    const [filesResult] = useQuery({
        query: JBA_FORECAST_FILES_QUERY,
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
    // One raster per forecast day; the entry stays so the panel section does not flicker
    const rasters = useMemo<SourceRaster[]>(
        () => {
            const file = filesResult.data?.floodForecastFiles.results.find(
                (item) => getLeadTimeDays(
                    item.forecastIssueDate,
                    item.forecastTargetDate,
                ) === leadTimeDays,
            );
            return [{
                key: 'jba-forecast',
                label: strings.jbaRasterLabel,
                url: file?.tiff.url,
            }];
        },
        [filesResult.data, leadTimeDays, strings.jbaRasterLabel],
    );
    const activeEvent = events.find((event) => event.id === activeEventId);

    const footprintSelector = useCallback(
        () => getDistrictFootprint(activeEvent?.adminArea),
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
            pointFeatureSelector={getDistrictPointFeature}
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
                <RunSelectInput
                    options={runs}
                    keySelector={runKeySelector}
                    labelSelector={runLabelSelector}
                    value={activeRun?.id}
                    onChange={setSelectedRunId}
                    disabled={runsResult.fetching}
                    infoTitle={strings.jbaRunInfoTitle}
                    infoDetails={(
                        <>
                            <TextOutput
                                label={strings.jbaForecastIssuedLabel}
                                value={activeRun?.runDate}
                                valueType="date"
                                strongValue
                            />
                            <TextOutput
                                label={strings.jbaRunStatusLabel}
                                value={activeRun?.status}
                                strongValue
                            />
                        </>
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
                    rasters={rasters}
                />
            )}
            mapLegend={(
                <ThematicLegend
                    sourceMetric={forecastMetric}
                    rasters={rasters}
                />
            )}
            layerSelection={(
                <LayersPanel
                    sourceMetricLabel={forecastMetric.label}
                    rasters={rasters}
                />
            )}
        />
    );
}

export default Jba;
