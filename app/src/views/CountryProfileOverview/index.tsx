import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    BlockLoading,
    Container,
    LegendItem,
    Message,
    TextOutput,
    Tooltip,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    getPercentage,
    joinList,
    splitList,
} from '@ifrc-go/ui/utils';
import {
    compareNumber,
    isDefined,
    isNotDefined,
    listToGroupList,
    listToMap,
    mapToList,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import { type CountryOutletContext } from '#utils/outletContext';
import {
    GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import ClimateChart from './ClimateChart';
import PopulatioMap from './PopulationMap';

import i18n from './i18n.json';
import styles from './styles.module.css';

// NOTE: these labels should not be translated
const colorMap: Record<string, string> = {
    'Planting and growing': '#d8e800',
    Harvest: '#cbbb73',
    'Seasonal hazard': '#f69650',
    'Lean season': '#c88d5b',
    Livestock: '#fedf65',
    Outbreak: '#fd3900',
};

const colorList = mapToList(
    colorMap,
    (color, label) => ({ label, color }),
);

interface SeasonalCalendarEventProps {
    data: GoApiResponse<'/api/v2/country/{id}/databank/'>['acaps'][number] & {
        monthIndices: { key: number; start: number; end: number; }[];
    }
}

function SeasonalCalendarEvent(props: SeasonalCalendarEventProps) {
    const { data } = props;
    const strings = useTranslation(i18n);

    if (isNotDefined(data)) {
        return null;
    }

    const {
        event_type,
    } = data;

    if (isNotDefined(event_type)) {
        return null;
    }

    return data.monthIndices.map(({ key, start, end }) => (
        <div
            key={key}
            className={styles.event}
            style={{
                gridColumnStart: start,
                gridColumnEnd: end,
                backgroundColor: colorMap[event_type[0]],
            }}
        >
            {data.label}
            <Tooltip
                title={data.label}
                description={(
                    <>
                        <TextOutput
                            strongLabel
                            label={strings.seasonalCalendarTooltipEventTypeLabel}
                            value={event_type}
                        />
                        <TextOutput
                            strongLabel
                            label={strings.seasonalCalendarTooltipEventLabel}
                            value={data.event?.join(', ')}
                        />
                        <TextOutput
                            strongLabel
                            label={strings.seasonalCalendarTooltipMonthsLabel}
                            value={data.month?.join(', ')}
                        />
                        <TextOutput
                            strongLabel
                            label={strings.seasonalCalendarTooltipSourceLabel}
                            value={data.source}
                        />
                    </>
                )}
            />
        </div>
    ));
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const { countryId } = useOutletContext<CountryOutletContext>();

    const {
        pending: databankResponsePending,
        response: databankResponse,
    } = useRequest({
        url: '/api/v2/country/{id}/databank/',
        skip: isNotDefined(countryId),
        pathVariables: isDefined(countryId) ? {
            id: Number(countryId),
        } : undefined,
    });

    const populationUnder18Percent = getPercentage(
        databankResponse?.unicef_population_under_18,
        databankResponse?.world_bank_population,
    );

    // NOTE: these are keys in the data
    const monthsWithOrder = [
        { month: 'January', order: 1 },
        { month: 'February', order: 2 },
        { month: 'March', order: 3 },
        { month: 'April', order: 4 },
        { month: 'May', order: 5 },
        { month: 'June', order: 6 },
        { month: 'July', order: 7 },
        { month: 'August', order: 8 },
        { month: 'September', order: 9 },
        { month: 'October', order: 10 },
        { month: 'November', order: 11 },
        { month: 'December', order: 12 },
    ];

    const monthToOrderMap = listToMap(
        monthsWithOrder,
        ({ month }) => month,
        ({ order }) => order,
    );

    const seasonalCalendarData = useMemo(
        () => (
            databankResponse?.acaps?.map(
                ({ month, event_type, ...otherProps }) => {
                    if (isNotDefined(month) || isNotDefined(event_type)) {
                        return undefined;
                    }

                    const orderedMonth = month.sort(
                        (a, b) => compareNumber(monthToOrderMap[a], monthToOrderMap[b]),
                    );

                    const monthIndices = orderedMonth.map(
                        (monthName) => monthToOrderMap[monthName],
                    );

                    const discreteMonthIndices = splitList<number, number>(
                        monthIndices,
                        (item, index): item is number => (
                            index === 0
                                ? false
                                : (item - monthIndices[index - 1]) > 1
                        ),
                        true,
                    );

                    return {
                        ...otherProps,
                        event_type,
                        month: orderedMonth,
                        monthIndices: discreteMonthIndices.map(
                            (continuousList, i) => ({
                                key: i,
                                start: continuousList[0],
                                end: continuousList[continuousList.length - 1] + 1,
                            }),
                        ).sort((a, b) => compareNumber(a.start, b.start)),
                        startMonth: monthToOrderMap[orderedMonth[0]],
                    };
                },
            ).filter(isDefined).sort(
                (a, b) => compareNumber(a.startMonth, b.startMonth),
            )
        ),
        [databankResponse, monthToOrderMap],
    );

    const eventTypeGroupedData = mapToList(
        listToGroupList(
            seasonalCalendarData,
            ({ event_type }) => event_type[0],
        ),
        (list, key) => ({
            event_type: key,
            events: list,
        }),
    );

    return (
        <div className={styles.countryProfileOverview}>
            {databankResponsePending && <BlockLoading />}
            {isDefined(databankResponse) && (
                <Container
                    className={styles.countryIndicators}
                    heading={strings.countryIndicatorsHeading}
                    withHeaderBorder
                    contentViewType="grid"
                    numPreferredGridContentColumns={3}
                    footerActions={(
                        <TextOutput
                            label={strings.sources}
                            value={joinList([
                                <Link
                                    variant="tertiary"
                                    href="https://data.worldbank.org"
                                    external
                                    withUnderline
                                >
                                    {strings.dataBank}
                                </Link>,
                                <Link
                                    variant="tertiary"
                                    href="https://sdmx.data.unicef.org/overview.html"
                                    external
                                    withUnderline
                                >
                                    {strings.unicef}
                                </Link>,
                                <Link
                                    variant="tertiary"
                                    href="https://hdr.undp.org/data-center"
                                    external
                                    withUnderline
                                >
                                    {strings.hdr}
                                </Link>,
                            ], ', ')}
                        />
                    )}
                >
                    <TextOutput
                        label={strings.countryIndicatorsPopulationLabel}
                        value={databankResponse?.world_bank_population}
                        valueType="number"
                        strongValue
                    />
                    <TextOutput
                        label={strings.countryIndicatorsPopulationUnder18Label}
                        suffix=" %"
                        maximumFractionDigits={2}
                        value={populationUnder18Percent}
                        valueType="number"
                        strongValue
                    />
                    <TextOutput
                        label={strings.countryIndicatorsUrbanPopulationLabel}
                        suffix=" %"
                        value={databankResponse?.world_bank_urban_population_percentage}
                        valueType="number"
                        strongValue
                    />
                    <TextOutput
                        label={strings.countryIndicatorsGDPLabel}
                        prefix="$"
                        maximumFractionDigits={0}
                        value={databankResponse?.world_bank_gdp}
                        valueType="number"
                        strongValue
                    />
                    <TextOutput
                        label={strings.countryIndicatorsCapitaLabel}
                        prefix="$"
                        maximumFractionDigits={0}
                        value={databankResponse?.world_bank_gni}
                        valueType="number"
                        strongValue
                    />
                    <TextOutput
                        label={strings.countryIndicatorsPovertyLabel}
                        suffix=" %"
                        maximumFractionDigits={2}
                        value={databankResponse?.world_bank_poverty_rate}
                        valueType="number"
                        strongValue
                    />
                    <TextOutput
                        label={strings.countryIndicatorsLifeExpectancyLabel}
                        value={databankResponse?.life_expectancy}
                        valueType="number"
                        strongValue
                    />
                    <TextOutput
                        label={strings.countryIndicatorsLiteracyLabel}
                        suffix=" %"
                        maximumFractionDigits={2}
                        value={databankResponse?.world_bank_literacy_rate}
                        valueType="number"
                        strongValue
                    />
                    <TextOutput
                        label={strings.countryIndicatorsGenderInequalityIndexLabel}
                        value={databankResponse?.hdr_gii}
                        valueType="number"
                        strongValue
                    />
                </Container>
            )}
            <Container
                contentViewType="grid"
                numPreferredGridContentColumns={2}
                spacing="relaxed"
            >
                {isDefined(databankResponse) && (
                    <PopulatioMap
                        data={databankResponse.wb_population}
                    />
                )}
                {isDefined(databankResponse) && (
                    <ClimateChart
                        data={databankResponse.key_climate}
                    />
                )}
            </Container>
            {isDefined(databankResponse) && isDefined(databankResponse.acaps) && (
                <Container
                    heading={strings.seasonalCalendarHeading}
                    childrenContainerClassName={styles.seasonalCalendarContent}
                    footerContentClassName={styles.legendContainer}
                    footerContent={colorList.map(
                        ({ label, color }) => (
                            <LegendItem
                                key={label}
                                color={color}
                                label={label}
                            />
                        ),
                    )}
                >
                    <div className={styles.eventList}>
                        {monthsWithOrder.map(
                            ({ month, order }) => (
                                <div
                                    key={order}
                                    className={styles.monthName}
                                >
                                    {month.substring(0, 3)}
                                </div>
                            ),
                        )}
                    </div>
                    {(isNotDefined(eventTypeGroupedData) || eventTypeGroupedData.length === 0) && (
                        <Message
                            // FIXME: use translation
                            title="Data is not available!"
                        />
                    )}
                    {eventTypeGroupedData?.map(
                        ({ event_type, events }) => (
                            <div
                                key={event_type}
                                className={styles.eventList}
                            >
                                {events.map((event) => (
                                    <SeasonalCalendarEvent
                                        key={event.id}
                                        data={event}
                                    />
                                ))}
                            </div>
                        ),
                    )}
                </Container>
            )}
        </div>
    );
}

Component.displayName = 'CountryProfileOverview';
