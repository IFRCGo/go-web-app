import { useCallback } from 'react';
import {
    BlockLoading,
    Container,
    List,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isDefined } from '@togglecorp/fujs';

import Link from '#components/Link';
import { type RiskApiResponse } from '#utils/restRequest';

import LayerInput, { Props as LayerInputProps } from './LayerDetails';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Option {
    key: number;
    label: string;
}

const options: Option[] = [
    {
        key: 1,
        label: 'nodes',
    },
    {
        key: 2,
        label: 'tracks',
    },
    {
        key: 3,
        label: 'buffers',
    },
    {
        key: 4,
        label: 'forecast uncertainty',
    },
];

type GdacsResponse = RiskApiResponse<'/api/v1/gdacs/'>;
type GdacsItem = NonNullable<GdacsResponse['results']>[number];
export type GdacsExposure = RiskApiResponse<'/api/v1/gdacs/{id}/exposure/'>;

export interface GdacsEventDetails {
    Class?: string;
    affectedcountries?: {
        iso3: string;
        countryname: string;
    }[];
    alertlevel?: string;
    alertscore?: number;
    country?: string;
    countryonland?: string;
    description?: string;
    episodealertlevel?: string;
    episodealertscore?: number;
    episodeid?: number;
    eventid?: number;
    eventname?: string;
    eventtype?: string;
    fromdate?: string;
    glide?: string;
    htmldescription?: string;
    icon?: string;
    iconoverall?: null,
    iscurrent?: string;
    iso3?: string;
    istemporary?: string;
    name?: string;
    polygonlabel?: string;
    todate?: string;
    severitydata?: {
        severity?: number;
        severitytext?: string;
        severityunit?: string;
    },
    source?: string;
    sourceid?: string;
    url?: {
        report?: string;
        details?: string;
        geometry?: string;
    },
}
interface GdacsPopulationExposure {
    death?: number;
    displaced?: number;
    exposed_population?: string;
    people_affected?: string;
    impact?: string;
}

interface Props {
    data: GdacsItem;
    exposure: GdacsExposure | undefined;
    pending: boolean;
    onLayerChange: (value: boolean, name: number) => void;
    layer: {[key: string]: boolean};
}

type Footprint = GeoJSON.FeatureCollection<GeoJSON.Geometry> | undefined;

function EventDetails(props: Props) {
    const {
        data: {
            hazard_name,
            start_date,
            event_details,
        },
        exposure,
        pending,
        onLayerChange,
        layer,
    } = props;

    const strings = useTranslation(i18n);

    const populationExposure = exposure?.population_exposure as GdacsPopulationExposure | undefined;
    const eventDetails = event_details as GdacsEventDetails | undefined;

    const layerRendererParams = useCallback(
        (_: number, layerOptions: Option): LayerInputProps => ({
            options: layerOptions,
            value: layer,
            onChange: onLayerChange,
            exposure: exposure as Footprint,

        }),
        [layer, onLayerChange, exposure],
    );

    return (
        <Container
            className={styles.eventDetails}
            childrenContainerClassName={styles.content}
            heading={hazard_name}
            headingLevel={4}
            spacing="compact"
            headerDescription={(
                <TextOutput
                    label={strings.eventStartOnLabel}
                    value={start_date}
                    valueType="date"
                    strongValue
                />
            )}
        >
            {pending && <BlockLoading />}
            <div className={styles.eventDetails}>
                {isDefined(eventDetails?.source) && (
                    <TextOutput
                        label={strings.eventSourceLabel}
                        value={eventDetails?.source}
                    />
                )}
                {isDefined(populationExposure?.death) && (
                    <TextOutput
                        label={strings.eventDeathLabel}
                        value={populationExposure?.death}
                        maximumFractionDigits={2}
                        compact
                        valueType="number"
                    />
                )}
                {isDefined(populationExposure?.displaced) && (
                    <TextOutput
                        label={strings.eventDisplacedLabel}
                        value={populationExposure?.displaced}
                        maximumFractionDigits={2}
                        compact
                        valueType="number"
                    />
                )}
                {isDefined(populationExposure?.exposed_population) && (
                    <TextOutput
                        label={strings.eventPopulationLabel}
                        value={populationExposure?.exposed_population}
                    />
                )}
                {isDefined(populationExposure?.people_affected) && (
                    <TextOutput
                        label={strings.eventPeopleAffectedLabel}
                        value={populationExposure?.people_affected}
                    />
                )}
                {isDefined(populationExposure?.impact) && (
                    <TextOutput
                        label={strings.eventImpactLabel}
                        value={populationExposure?.impact}
                    />
                )}
                {isDefined(eventDetails?.severitydata)
                    && (isDefined(eventDetails) && (eventDetails?.eventtype) && !(eventDetails.eventtype === 'FL')) && (
                    <TextOutput
                        label={strings.eventSeverityLabel}
                        value={eventDetails?.severitydata?.severitytext}
                    />
                )}
                {isDefined(eventDetails?.alertlevel) && (
                    <TextOutput
                        label={strings.eventAlertType}
                        value={eventDetails?.alertlevel}
                    />
                )}
            </div>
            {isDefined(eventDetails)
                && isDefined(eventDetails.url)
                && isDefined(eventDetails.url.report)
                && (
                    <Link
                        href={eventDetails?.url.report}
                        external
                        withLinkIcon
                    >
                        {strings.eventMoreDetailsLink}
                    </Link>
                )}
            {eventDetails?.eventtype === 'TC' && (
                <List
                    data={options}
                    renderer={LayerInput}
                    rendererParams={layerRendererParams}
                    keySelector={(item) => item.key}
                    withoutMessage
                    compact
                    pending={false}
                    errored={false}
                    filtered={false}
                />
            )}
        </Container>
    );
}

export default EventDetails;
