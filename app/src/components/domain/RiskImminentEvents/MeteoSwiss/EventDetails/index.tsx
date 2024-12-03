import {
    useCallback,
    useMemo,
} from 'react';
import {
    BlockLoading,
    Container,
    DateOutput,
    NumberOutput,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    resolveToComponent,
    resolveToString,
} from '@ifrc-go/ui/utils';
import {
    compareString,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import { type RiskApiResponse } from '#utils/restRequest';

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

    const getSaffirSimpsonScaleDescription = useCallback((windspeed: number) => {
        if (windspeed < 33) {
            return strings.tropicalStormDescription;
        }
        if (windspeed < 43) {
            return strings.categoryOneDescription;
        }
        if (windspeed < 50) {
            return strings.categoryTwoDescription;
        }
        if (windspeed < 59) {
            return strings.categoryThreeDescription;
        }
        if (windspeed < 71) {
            return strings.categoryFourDescription;
        }
        return strings.categoryFiveDescription;
    }, [
        strings.tropicalStormDescription,
        strings.categoryOneDescription,
        strings.categoryTwoDescription,
        strings.categoryThreeDescription,
        strings.categoryFourDescription,
        strings.categoryFiveDescription,
    ]);

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
                            {
                                windspeed,
                                saffirSimpsonScale: getSaffirSimpsonScaleDescription(windspeed),
                            },
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
            getSaffirSimpsonScaleDescription,
        ],
    );

    // TODO: add exposure details
    return (
        <Container
            className={styles.eventDetails}
            childrenContainerClassName={styles.content}
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
                                classificationLink: (
                                    <Link
                                        href="https://community.wmo.int/en/classification-tropical-cyclones"
                                        external
                                    >
                                        {strings.meteoSwissTropicalStorm}
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
