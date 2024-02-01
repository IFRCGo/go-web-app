import { useOutletContext } from 'react-router-dom';
import {
    BlockLoading,
    Container,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { getPercentage } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import { type CountryOutletContext } from '#utils/outletContext';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const { countryId } = useOutletContext<CountryOutletContext>();

    const {
        pending: indicatorPending,
        response: indicatorResponse,
    } = useRequest({
        url: '/api/v2/country/{id}/databank/',
        skip: isNotDefined(countryId),
        pathVariables: isDefined(countryId) ? {
            id: Number(countryId),
        } : undefined,
    });

    const populationUnder18Percent = getPercentage(
        indicatorResponse?.unicef_population_under_18,
        indicatorResponse?.world_bank_population,
    );

    return (
        <Container
            className={styles.countryIndicators}
            heading={strings.countryIndicatorsTitle}
            headingLevel={4}
            withHeaderBorder
            contentViewType="grid"
            numPreferredGridContentColumns={3}
            footerContentClassName={styles.footerContent}
            footerContent={(
                <TextOutput
                    label={strings.sources}
                    valueClassName={styles.links}
                    value={(
                        <>
                            <Link
                                variant="tertiary"
                                href="https://data.worldbank.org"
                                external
                                withUnderline
                            >
                                {strings.dataBank}
                            </Link>
                            <Link
                                variant="tertiary"
                                href="https://sdmx.data.unicef.org/overview.html"
                                external
                                withUnderline
                            >
                                {strings.unicef}
                            </Link>
                            <Link
                                variant="tertiary"
                                href="https://hdr.undp.org/data-center"
                                external
                                withUnderline
                            >
                                {strings.hdr}
                            </Link>
                        </>
                    )}
                />
            )}
        >
            {indicatorPending && <BlockLoading className={styles.loading} />}
            <TextOutput
                label={strings.countryIndicatorsPopulationLabel}
                value={indicatorResponse?.world_bank_population}
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
                value={indicatorResponse?.world_bank_urban_population_percentage}
                valueType="number"
                strongValue
            />
            <TextOutput
                label={strings.countryIndicatorsGDPLabel}
                prefix="$"
                maximumFractionDigits={0}
                value={indicatorResponse?.world_bank_gdp}
                valueType="number"
                strongValue
            />
            <TextOutput
                label={strings.countryIndicatorsCapitaLabel}
                prefix="$"
                maximumFractionDigits={0}
                value={indicatorResponse?.world_bank_gni}
                valueType="number"
                strongValue
            />
            <TextOutput
                label={strings.countryIndicatorsPovertyLabel}
                suffix=" %"
                maximumFractionDigits={2}
                value={indicatorResponse?.world_bank_poverty_rate}
                valueType="number"
                strongValue
            />
            <TextOutput
                label={strings.countryIndicatorsLifeExpectancyLabel}
                value={indicatorResponse?.world_bank_life_expectancy}
                valueType="number"
                strongValue
            />
            <TextOutput
                label={strings.countryIndicatorsLiteracyLabel}
                suffix=" %"
                maximumFractionDigits={2}
                value={indicatorResponse?.world_bank_literacy_rate}
                valueType="number"
                strongValue
            />
            <TextOutput
                label={strings.countryIndicatorsGenderInequalityIndexLabel}
                value={indicatorResponse?.hdr_gii}
                valueType="number"
                strongValue
            />
        </Container>
    );
}

Component.displayName = 'CountryProfileOverview';
