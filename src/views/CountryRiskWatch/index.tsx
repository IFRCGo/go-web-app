import { useMemo } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { isDefined } from '@togglecorp/fujs';
import getBbox from '@turf/bbox';

import Container from '#components/Container';
import Link from '#components/Link';
import useTranslation from '#hooks/useTranslation';
import useInputState from '#hooks/useInputState';
import type { CountryOutletContext } from '#utils/outletContext';
import { useRiskRequest } from '#utils/restRequest';
import PdcImminentEvents from '#components/PdcImminentEvents';

import MultiMonthSelectInput from './MultiMonthSelectInput';
import RiskTable from './RiskTable';
import RiskBarChart from './RiskBarChart';
import PossibleEarlyActionTable from './PossibleEarlyActionTable';
import ReturnPeriodTable from './ReturnPeriodTable';
import HistoricalDataChart from './HistoricalDataChart';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryResponse } = useOutletContext<CountryOutletContext>();
    const { countryId } = useParams<{ countryId: string }>();
    const strings = useTranslation(i18n);
    const [
        selectedMonths,
        setSelectedMonths,
    ] = useInputState<Record<number, boolean> | undefined>({ 0: true });

    const {
        pending: pendingCountryRiskResponse,
        response: countryRiskResponse,
    } = useRiskRequest({
        apiType: 'risk',
        url: '/api/v1/country-seasonal/',
        // FIXME: typings need to be fixed in the server
        query: {
            iso3: countryResponse?.iso3?.toLowerCase(),
        },
    });

    // NOTE: we always get 1 child in the response
    const riskResponse = countryRiskResponse?.[0];
    const bbox = useMemo(
        () => (countryResponse ? getBbox(countryResponse.bbox) : undefined),
        [countryResponse],
    );

    return (
        <div className={styles.countryRiskWatch}>
            {countryResponse && isDefined(countryResponse.iso3) && (
                <PdcImminentEvents
                    variant="country"
                    iso3={countryResponse.iso3}
                    title={countryResponse.name}
                    bbox={bbox}
                />
            )}
            <Container
                heading={strings.risksByMonthHeading}
                headingLevel={2}
                headerDescription={strings.risksByMonthDescription}
                withHeaderBorder
                childrenContainerClassName={styles.riskByMonthContent}
            >
                <MultiMonthSelectInput
                    name={undefined}
                    value={selectedMonths}
                    onChange={setSelectedMonths}
                />
                <RiskTable
                    riskData={riskResponse}
                    selectedMonths={selectedMonths}
                    dataPending={pendingCountryRiskResponse}
                />
            </Container>
            <div className={styles.eapSection}>
                <Container
                    className={styles.eapContainer}
                    heading={strings.eapHeading}
                    withHeaderBorder
                    actions={(
                        <Link
                            to="https://www.ifrc.org/appeals?date_from=&date_to=&type%5B%5D=30&appeal_code=&text="
                            withExternalLinkIcon
                            variant="primary"
                        >
                            {strings.eapDownloadButtonLabel}
                        </Link>
                    )}
                >
                    {strings.eapDescription}
                </Container>
            </div>
            <RiskBarChart
                pending={pendingCountryRiskResponse}
                seasonalRiskData={riskResponse}
            />
            <PossibleEarlyActionTable
                countryId={Number(countryId)}
                countryResponse={countryResponse}
            />
            <ReturnPeriodTable
                data={riskResponse?.return_period_data}
            />
            <HistoricalDataChart countryId={Number(countryId)} />
        </div>
    );
}

Component.displayName = 'CountryRiskWatch';
