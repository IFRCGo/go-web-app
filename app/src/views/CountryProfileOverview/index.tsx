import { useOutletContext } from 'react-router-dom';
import {
    Container,
    LegendItem,
    ListView,
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
import TabPage from '#components/TabPage';
import { type CountryOutletContext } from '#utils/outletContext';
import {
    type GoApiResponse,
    useGoRequest,
} from '#utils/restRequest';

import ClimateChart from './ClimateChart';
import PopulationMap from './PopulationMap';

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
                backgroundColor: colorMap[event_type[0]!],
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

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const { countryId } = useOutletContext<CountryOutletContext>();

    const {
        pending: databankResponsePending,
        response: databankResponse,
        error: databankResponseError,
    } = useGoRequest({
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

    // FIXME(frozenhelium): useMemo removed for React Compiler compatibility
    const seasonalCalendarData = (
        databankResponse?.acaps?.map(
            ({ month, event_type, ...otherProps }) => {
                if (isNotDefined(month) || isNotDefined(event_type)) {
                    return undefined;
                }

                // FIXME: this sort will mutate the data
                const orderedMonth = month.sort(
                    (a, b) => compareNumber(monthToOrderMap[a], monthToOrderMap[b]),
                );

                const monthIndices = orderedMonth.map(
                    (monthName) => monthToOrderMap[monthName]!,
                );

                const discreteMonthIndices = splitList<number, number>(
                    monthIndices,
                    (item, index): item is number => (
                        index === 0
                            ? false
                            : (item - monthIndices[index - 1]!) > 1
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
                            start: continuousList[0]!,
                            end: continuousList[continuousList.length - 1]! + 1,
                        }),
                    ).sort((a, b) => compareNumber(a.start, b.start)),
                    startMonth: monthToOrderMap[orderedMonth[0]!],
                };
            },
        ).filter(isDefined).sort(
            (a, b) => compareNumber(a.startMonth, b.startMonth),
        )
    );

    const eventTypeGroupedData = mapToList(
        listToGroupList(
            seasonalCalendarData,
            ({ event_type }) => event_type[0]!,
        ),
        (list, key) => ({
            event_type: key,
            events: list,
        }),
    );

    return (
        <TabPage
            pending={databankResponsePending}
            errored={isDefined(databankResponseError)}
            errorMessage={databankResponseError?.value?.messageForNotification}
            wikiLinkPathName="user_guide/Country_Pages#country-profile"
        >
            {isDefined(databankResponse) && (
                <Container
                    className={styles.countryIndicators}
                    heading={strings.countryIndicatorsHeading}
                    withHeaderBorder
                    footerActions={(
                        <TextOutput
                            label={strings.sources}
                            value={joinList([
                                <Link
                                    key="link-databank"
                                    styleVariant="action"
                                    href="https://data.worldbank.org"
                                    external
                                    withUnderline
                                    withLinkIcon
                                >
                                    {strings.dataBank}
                                </Link>,
                                <Link
                                    key="link-unicef"
                                    styleVariant="action"
                                    href="https://sdmx.data.unicef.org/overview.html"
                                    external
                                    withUnderline
                                    withLinkIcon
                                >
                                    {strings.unicef}
                                </Link>,
                                <Link
                                    key="link-hdr"
                                    styleVariant="action"
                                    href="https://hdr.undp.org/data-center"
                                    external
                                    withUnderline
                                    withLinkIcon
                                >
                                    {strings.hdr}
                                </Link>,
                            ], ', ')}
                        />
                    )}
                >
                    <ListView
                        layout="grid"
                        numPreferredGridColumns={3}
                        withSpacingOpticalCorrection
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
                            value={databankResponse?.world_bank_gni_capita}
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
                            value={databankResponse?.world_bank_life_expectancy}
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
                    </ListView>
                </Container>
            )}
            <ListView
                layout="grid"
                spacing="lg"
                minGridColumnSize="20rem"
            >
                {isDefined(databankResponse) && (
                    <PopulationMap
                        data={databankResponse.wb_population}
                    />
                )}
                {isDefined(databankResponse) && (
                    <ClimateChart
                        data={databankResponse.key_climate}
                    />
                )}
            </ListView>
            {isDefined(databankResponse) && isDefined(databankResponse.acaps) && (
                <Container
                    heading={strings.seasonalCalendarHeading}
                    footerActions={(
                        <TextOutput
                            label={strings.source}
                            value={(
                                <Link
                                    styleVariant="action"
                                    href="https://www.acaps.org/en/thematics/all-topics/seasonal-calendar"
                                    external
                                    withUnderline
                                    withLinkIcon
                                >
                                    {strings.acaps}
                                </Link>
                            )}
                        />
                    )}
                    footer={(
                        <ListView
                            withWrap
                            withSpacingOpticalCorrection
                            spacing="sm"
                        >
                            {colorList.map(
                                ({ label, color }) => (
                                    <LegendItem
                                        key={label}
                                        color={color}
                                        label={label}
                                    />
                                ),
                            )}
                        </ListView>
                    )}
                >
                    <div className={styles.seasonalCalendarContent}>
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
                        {(isNotDefined(eventTypeGroupedData)
                            || eventTypeGroupedData.length === 0
                        ) && (
                            <Message
                                title={strings.seasonalCalenderDataNotAvailable}
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
                    </div>
                </Container>
            )}
        </TabPage>
    );
}

Component.displayName = 'CountryProfileOverview';
