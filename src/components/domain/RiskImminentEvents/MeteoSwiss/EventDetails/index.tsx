import { useMemo } from 'react';
import { isDefined, isNotDefined } from '@togglecorp/fujs';

import BlockLoading from '#components/BlockLoading';
import Link from '#components/Link';
import Container from '#components/Container';
import TextOutput from '#components/TextOutput';
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

    // FIXME: use translation?
    const hazardName = `${hazard_type_display} - ${country_details?.name ?? hazard_name}`;

    const impactList = useMemo(
        () => (
            // FIXME: typings should be fixed in the server
            (event_details as unknown as unknown[])?.map((event: unknown, i: number) => {
                if (
                    typeof event !== 'object'
                    || isNotDefined(event)
                    || !('mean' in event)
                    || !('impact_type' in event)
                ) {
                    return undefined;
                }

                const {
                    impact_type,
                    mean,
                } = event;

                const valueSafe = typeof mean === 'number' ? Math.round(mean) : undefined;
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
                        label: strings.meteoSwissEconomicLossLabel,
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
                        label: resolveToString(
                            strings.meteoSwissExposureLabel,
                            { windspeed },
                        ),
                    };
                }

                return undefined;
            }).filter(isDefined)
        ),
        [event_details, strings],
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
                        // FIXME: use translation
                        label="Started on"
                        value={start_date}
                        valueType="date"
                        strongValue
                    />
                    <TextOutput
                        // FIXME: use translation
                        label="Updated at"
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
                                label={impact.label}
                                value={impact.value}
                                valueType="number"
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
                                        href="https://community.wmo.int/en/latest-advisories-rsmcs-and-tcwcs"
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
