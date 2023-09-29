import { useMemo } from 'react';
import { compareString, isDefined, isNotDefined } from '@togglecorp/fujs';

import BlockLoading from '#components/BlockLoading';
import Link from '#components/Link';
import Container from '#components/Container';
import TextOutput from '#components/TextOutput';
import NumberOutput from '#components/NumberOutput';
import DateOutput from '#components/DateOutput';
import { type RiskApiResponse } from '#utils/restRequest';
import useTranslation from '#hooks/useTranslation';
import { resolveToComponent, resolveToString } from '#utils/translation';

import i18n from './i18n.json';
import styles from './styles.module.css';

type MeteoSwissResponse = RiskApiResponse<'/api/v1/meteoswiss/'>;
type MeteoSwissItem = NonNullable<MeteoSwissResponse['results']>[number];
// type MeteoSwissExposure = RiskApiResponse<'/api/v1/meteoswiss/{id}/exposure/'>;

const UPDATED_AT_FORMAT = 'yyyy-MM-dd, hh:mm';

interface Props {
    data: MeteoSwissItem;
    // exposure: MeteoSwissExposure | undefined;
    pending: boolean;
}

function EventDetails(props: Props) {
    const {
        data: {
            // id,
            hazard_type_display,
            country_details,
            start_date,
            updated_at,
            hazard_name,
            model_name,
            event_details,
        },
        pending,
    } = props;

    const strings = useTranslation(i18n);

    const hazardName = resolveToString(
        strings.meteoSwissHazardName,
        {
            hazardType: hazard_type_display,
            hazardName: country_details?.name ?? hazard_name,
        },
    );

    const impactList = useMemo(
        () => (
            // FIXME: typings should be fixed in the server
            (event_details as unknown as unknown[])?.map((event: unknown, i: number) => {
                if (
                    typeof event !== 'object'
                    || isNotDefined(event)
                    || !('mean' in event)
                    || !('impact_type' in event)
                    || !('five_perc' in event)
                    || !('ninety_five_perc' in event)
                ) {
                    return undefined;
                }

                const {
                    impact_type,
                    five_perc,
                    ninety_five_perc,
                    mean,
                } = event;

                const valueSafe = typeof mean === 'number' ? Math.round(mean) : undefined;
                const fivePercentValue = typeof five_perc === 'number' ? Math.round(five_perc) : undefined;
                const ninetyFivePercentValue = typeof ninety_five_perc === 'number' ? Math.round(ninety_five_perc) : undefined;
                if (isNotDefined(valueSafe) || valueSafe === 0) {
                    return undefined;
                }

                if (typeof impact_type !== 'string') {
                    return undefined;
                }

                if (impact_type === 'direct_economic_damage') {
                    return {
                        key: i,
                        type: 'economic',
                        value: valueSafe,
                        fivePercentValue,
                        ninetyFivePercentValue,
                        label: strings.meteoSwissEconomicLossLabel,
                        unit: strings.usd,
                    };
                }

                if (impact_type.startsWith('exposed_population_')) {
                    const windspeed = Number.parseInt(
                        impact_type.split('exposed_population_')[1],
                        10,
                    );

                    if (isNotDefined(windspeed)) {
                        return undefined;
                    }

                    return {
                        key: i,
                        type: 'exposure',
                        value: valueSafe,
                        fivePercentValue,
                        ninetyFivePercentValue,
                        label: resolveToString(
                            strings.meteoSwissExposureLabel,
                            { windspeed },
                        ),
                        unit: strings.people,
                    };
                }

                return undefined;
            }).filter(isDefined).sort((a, b) => compareString(b.type, a.type))
        ),
        [
            event_details,
            strings.meteoSwissEconomicLossLabel,
            strings.usd,
            strings.meteoSwissExposureLabel,
            strings.people,
        ],
    );

    // TODO: add exposure details
    return (
        <Container
            className={styles.eventDetails}
            childrenContainerClassName={styles.content}
            heading={hazardName}
            headingLevel={4}
            headerDescription={(
                <>
                    <TextOutput
                        label={strings.meteoSwissEventDetailsStartedOnLabel}
                        value={start_date}
                        valueType="date"
                        strongValue
                    />
                    <TextOutput
                        label={strings.meteoSwissEventDetailsUpdatedAtLabel}
                        value={updated_at}
                        valueType="date"
                        format={UPDATED_AT_FORMAT}
                        strongValue
                    />
                </>
            )}
            contentViewType="vertical"
        >
            {pending && <BlockLoading />}
            {!pending && (
                <>
                    <Container
                        heading={strings.meteoSwissimpactHeading}
                        spacing="compact"
                        contentViewType="vertical"
                        headingLevel={5}
                        withHeaderBorder
                    >
                        {impactList.map((impact) => (
                            <TextOutput
                                key={impact.key}
                                label={resolveToComponent(
                                    strings.impactLabel,
                                    {
                                        label: impact.label,
                                        beta: <span className={styles.beta}>{strings.beta}</span>,
                                    },
                                )}
                                valueClassName={styles.impactValue}
                                value={resolveToComponent(
                                    strings.meteoSwissImpactValue,
                                    {
                                        value: (
                                            <NumberOutput
                                                value={impact.value}
                                                compact
                                                maximumFractionDigits={2}
                                            />
                                        ),
                                        fivePercent: (
                                            <NumberOutput
                                                value={impact.fivePercentValue}
                                                compact
                                                maximumFractionDigits={2}
                                            />
                                        ),
                                        ninetyFivePercent: (
                                            <NumberOutput
                                                value={impact.ninetyFivePercentValue}
                                                compact
                                                maximumFractionDigits={2}
                                            />
                                        ),
                                        unit: impact.unit,
                                    },
                                )}
                                strongValue
                            />
                        ))}
                        <div className={styles.estimationNote}>
                            {strings.meteoSwissEstimatesNote}
                        </div>
                    </Container>
                    <div>
                        {resolveToComponent(
                            strings.meteoSwissEventDescription,
                            {
                                model: model_name ?? '--',
                                updatedAt: (
                                    <DateOutput
                                        value={updated_at}
                                        format={UPDATED_AT_FORMAT}
                                    />
                                ),
                                eventName: hazard_name,
                                countryName: country_details?.name ?? '--',
                                eventDate: <DateOutput value={start_date} />,
                            },
                        )}
                    </div>
                    <div>
                        {resolveToComponent(
                            strings.meteoSwissAuthoritativeMessage,
                            {
                                link: (
                                    <Link
                                        href="https://severeweather.wmo.int"
                                        external
                                    >
                                        {strings.meteoSwissAuthoritativeLinkLabel}
                                    </Link>
                                ),
                            },
                        )}
                    </div>
                </>
            )}
        </Container>
    );
}

export default EventDetails;
