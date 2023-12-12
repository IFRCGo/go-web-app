import { useMemo } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { isDefined, isNotDefined, mapToList } from '@togglecorp/fujs';
import getBbox from '@turf/bbox';

import Container from '#components/Container';
import Link from '#components/Link';
import RiskImminentEvents, { type ImminentEventSource } from '#components/domain/RiskImminentEvents';
import HistoricalDataChart from '#components/domain/HistoricalDataChart';
import BlockLoading from '#components/BlockLoading';
import useTranslation from '#hooks/useTranslation';
import useInputState from '#hooks/useInputState';
import type { CountryOutletContext } from '#utils/outletContext';
import { useRiskRequest } from '#utils/restRequest';

import MultiMonthSelectInput from './MultiMonthSelectInput';
import RiskTable from './RiskTable';
import RiskBarChart from './RiskBarChart';
import PossibleEarlyActionTable from './PossibleEarlyActionTable';
import ReturnPeriodTable from './ReturnPeriodTable';

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
        query: {
            // FIXME: why do we need to use lowercase?
            iso3: countryResponse?.iso3?.toLowerCase(),
        },
    });

    const {
        pending: pendingImminentEventCounts,
        response: imminentEventCountsResponse,
    } = useRiskRequest({
        apiType: 'risk',
        url: '/api/v1/country-imminent-counts/',
        query: {
            iso3: countryResponse?.iso3?.toLowerCase(),
        },
    });

    const hasImminentEvents = useMemo(
        () => {
            if (isNotDefined(imminentEventCountsResponse)) {
                return false;
            }

            const eventCounts = mapToList(
                imminentEventCountsResponse,
                (value) => value,
            ).filter(isDefined).filter(
                (value) => value > 0,
            );

            return eventCounts.length > 0;
        },
        [imminentEventCountsResponse],
    );

    const defaultImminentEventSource = useMemo<ImminentEventSource | undefined>(
        () => {
            if (isNotDefined(imminentEventCountsResponse)) {
                return undefined;
            }

            const {
                pdc,
                adam,
                gdacs,
                meteoswiss,
            } = imminentEventCountsResponse;

            if (isDefined(pdc) && pdc > 0) {
                return 'pdc';
            }

            if (isDefined(adam) && adam > 0) {
                return 'wfpAdam';
            }

            if (isDefined(gdacs) && gdacs > 0) {
                return 'gdacs';
            }

            if (isDefined(meteoswiss) && meteoswiss > 0) {
                return 'meteoSwiss';
            }

            return undefined;
        },
        [imminentEventCountsResponse],
    );

    // NOTE: we always get 1 child in the response
    const riskResponse = countryRiskResponse?.[0];
    const bbox = useMemo(
        () => (countryResponse ? getBbox(countryResponse.bbox) : undefined),
        [countryResponse],
    );

    return (
        <div className={styles.countryRiskWatch}>
            {pendingImminentEventCounts && (
                <BlockLoading />
            )}
            {hasImminentEvents && isDefined(countryResponse) && isDefined(countryResponse.iso3) && (
                <RiskImminentEvents
                    variant="country"
                    iso3={countryResponse.iso3}
                    title={countryResponse.name}
                    bbox={bbox}
                    defaultSource={defaultImminentEventSource}
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
                    withInternalPadding
                    spacing="comfortable"
                    actions={(
                        <Link
                            href="https://www.ifrc.org/appeals?date_from=&date_to=&type%5B%5D=30&appeal_code=&text="
                            external
                            withLinkIcon
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
            <HistoricalDataChart
                variant="country"
                countryId={Number(countryId)}
            />
        </div>
    );
}

Component.displayName = 'CountryRiskWatch';
