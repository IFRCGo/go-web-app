import { useMemo } from 'react';
import {
    useOutletContext,
    useParams,
} from 'react-router-dom';
import { Container } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
    mapToList,
} from '@togglecorp/fujs';
import getBbox from '@turf/bbox';

import RiskImminentEvents, { type ImminentEventSource } from '#components/domain/RiskImminentEvents';
import Link from '#components/Link';
import WikiLink from '#components/WikiLink';
import useInputState from '#hooks/useInputState';
import { multiMonthSelectDefaultValue } from '#utils/constants';
import type { CountryOutletContext } from '#utils/outletContext';
import { useRiskRequest } from '#utils/restRequest';

import CountryRiskSourcesOutput from './CountryRiskSourcesOutput';
import MultiMonthSelectInput from './MultiMonthSelectInput';
import PossibleEarlyActionTable from './PossibleEarlyActionTable';
import ReturnPeriodTable from './ReturnPeriodTable';
import RiskBarChart from './RiskBarChart';
import RiskTable from './RiskTable';

import i18n from './i18n.json';
import styles from './styles.module.css';

function getCurrentMonth() {
    return new Date().getMonth();
}

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryResponse } = useOutletContext<CountryOutletContext>();
    const { countryId } = useParams<{ countryId: string }>();
    const strings = useTranslation(i18n);
    const [
        selectedMonths,
        setSelectedMonths,
    ] = useInputState<(typeof multiMonthSelectDefaultValue) | undefined>({
        ...multiMonthSelectDefaultValue,
        [getCurrentMonth()]: true,
    });

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
    const bbox = useMemo(() => (
        (countryResponse && countryResponse.bbox)
            ? getBbox(countryResponse.bbox)
            : undefined
    ), [countryResponse]);

    return (
        <Container
            className={styles.riskWatch}
            childrenContainerClassName={styles.countryRiskWatch}
            headerDescription={strings.riskWatchDescription}
            headerDescriptionContainerClassName={styles.riskWatchDescription}
            withCenteredHeaderDescription
            pending={pendingImminentEventCounts}
            contentViewType="vertical"
            spacing="loose"
            actions={(
                <WikiLink
                    href="user_guide/Country_Pages#risk-watch"
                />
            )}
        >
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
                footerActions={<CountryRiskSourcesOutput />}
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
        </Container>
    );
}

Component.displayName = 'CountryProfileRiskWatch';
