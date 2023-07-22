import { useParams, useOutletContext } from 'react-router-dom';

import Container from '#components/Container';
import Link from '#components/Link';
import useTranslation from '#hooks/useTranslation';
import useInputState from '#hooks/useInputState';
import type { paths } from '#generated/riskTypes';
import type { CountryOutletContext } from '#utils/country';
import { useRequest } from '#utils/restRequest';

import MultiMonthSelectInput from './MultiMonthSelectInput';
import RiskTable from './RiskTable';
import PossibleEarlyActionTable from './PossibleEarlyActionTable';
import ReturnPeriodTable from './ReturnPeriodTable';
import HistoricalDataChart from './HistoricalDataChart';

import i18n from './i18n.json';
import styles from './styles.module.css';
import RiskBarChart from './RiskBarChart';

type GetCountrySeasonal = paths['/api/v1/country-seasonal/']['get'];
// FIXME: query type not available
// type CountryRiskQuery = GetCountryRisk['parameters']['query'];
type CountrySeasonal = GetCountrySeasonal['responses']['200']['content']['application/json'];

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
    } = useRequest<CountrySeasonal>({
        apiType: 'risk',
        url: '/api/v1/country-seasonal/',
        query: {
            iso3: countryResponse?.iso3?.toLowerCase(),
        },
    });

    // NOTE: we always get 1 child in the response
    const riskResponse = countryRiskResponse?.[0];

    return (
        <div className={styles.countryRiskWatch}>
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
                riskData={riskResponse}
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
