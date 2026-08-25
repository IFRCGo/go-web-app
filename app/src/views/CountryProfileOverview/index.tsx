import { useOutletContext } from 'react-router-dom';
import {
    Container,
    ListView,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    getPercentage,
    joinList,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import CountrySeasonalCalendar from '#components/domain/CountrySeasonalCalendar';
import Link from '#components/Link';
import TabPage from '#components/TabPage';
import { type CountryOutletContext } from '#utils/outletContext';
import { useRequest } from '#utils/restRequest';

import ClimateChart from './ClimateChart';
import PopulationMap from './PopulationMap';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const { countryId } = useOutletContext<CountryOutletContext>();

    const {
        pending: databankResponsePending,
        response: databankResponse,
        error: databankResponseError,
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

    return (
        <TabPage
            pending={databankResponsePending}
            errored={isDefined(databankResponseError)}
            errorMessage={databankResponseError?.value?.messageForNotification}
            wikiLinkPathName="user_guide/Country_Pages#country-profile"
        >
            {isDefined(databankResponse) && (
                <Container
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
                <CountrySeasonalCalendar
                    acapsEvents={databankResponse?.acaps}
                />
            )}
        </TabPage>
    );
}

Component.displayName = 'CountryProfileOverview';
