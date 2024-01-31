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
        indicatorResponse?.population,
    );

    return (
        <Container
            className={styles.countryIndicators}
            childrenContainerClassName={styles.indicatorContent}
            heading={strings.countryIndicatorsTitle}
            headingLevel={4}
            withHeaderBorder
        >
            {indicatorPending && <BlockLoading className={styles.loading} />}
            <TextOutput
                label={strings.countryIndicatorsPopulationLabel}
                value={indicatorResponse?.population}
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
                value={indicatorResponse?.urban_population}
                valueType="number"
                strongValue
            />
            <TextOutput
                label={strings.countryIndicatorsGDPLabel}
                prefix="$"
                maximumFractionDigits={0}
                value={indicatorResponse?.gdp}
                valueType="number"
                strongValue
            />
            <TextOutput
                label={strings.countryIndicatorsCapitaLabel}
                prefix="$"
                value={indicatorResponse?.gnipc}
                valueType="number"
                strongValue
            />
            <TextOutput
                label={strings.countryIndicatorsPovertyLabel}
                suffix=" %"
                maximumFractionDigits={2}
                value={indicatorResponse?.poverty}
                valueType="number"
                strongValue
            />
            <TextOutput
                label={strings.countryIndicatorsLifeExpectancyLabel}
                value={indicatorResponse?.life_expectancy}
                valueType="number"
                strongValue
            />
            <TextOutput
                label={strings.countryIndicatorsLiteracyLabel}
                suffix=" %"
                maximumFractionDigits={2}
                value={indicatorResponse?.literacy}
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
