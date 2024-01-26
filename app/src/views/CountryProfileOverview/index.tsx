import { useOutletContext } from 'react-router-dom';
import {
    BlockLoading,
    Container,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
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
                label={strings.countryIndicatorsUrbanPopulationLabel}
                value={isDefined(indicatorResponse?.urban_population) ? `${indicatorResponse?.urban_population} %` : undefined}
                valueType="text"
                strongValue
            />
            <TextOutput
                label={strings.countryIndicatorsGDPLabel}
                value={isDefined(indicatorResponse?.gdp) ? `$ ${indicatorResponse?.gdp}` : undefined}
                valueType="text"
                strongValue
            />
            <TextOutput
                label={strings.countryIndicatorsCapitaLabel}
                value={isDefined(indicatorResponse?.gnipc) ? `$ ${indicatorResponse?.gnipc}` : undefined}
                valueType="text"
                strongValue
            />
            <TextOutput
                label={strings.countryIndicatorsPovertyLabel}
                value={isDefined(indicatorResponse?.poverty) ? `${indicatorResponse?.poverty} %` : undefined}
                valueType="text"
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
                value={isDefined(indicatorResponse?.literacy) ? `${indicatorResponse?.literacy} %` : undefined}
                valueType="text"
                strongValue
            />
        </Container>
    );
}

Component.displayName = 'CountryProfileOverview';
