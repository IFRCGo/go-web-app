import { useParams, Outlet, generatePath } from 'react-router-dom';
import { useContext, useMemo } from 'react';
import {
    DrefIcon,
    AppealsIcon,
    FundingIcon,
    FundingCoverageIcon,
    TargetedPopulationIcon,
    AppealsTwoIcon,
} from '@ifrc-go/icons';

import Page from '#components/Page';
import BlockLoading from '#components/BlockLoading';
import NavigationTabList from '#components/NavigationTabList';
import NavigationTab from '#components/NavigationTab';
import KeyFigure from '#components/KeyFigure';
import RouteContext from '#contexts/route';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';
import type { CountryOutletContext } from '#utils/outletContext';
import type { paths } from '#generated/types';

import i18n from './i18n.json';
import styles from './styles.module.css';

type CountryResponse = paths['/api/v2/country/{id}/']['get']['responses']['200']['content']['application/json'];
type AggregatedAppealResponse = paths['/api/v2/appeal/aggregated']['get']['responses']['200']['content']['application/json'];

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryId } = useParams<{ countryId: string }>();

    const strings = useTranslation(i18n);

    const {
        countryOperations: countryOperationsRoute,
        countryThreeW: countryThreeWRoute,
        countryRiskWatch: countryRiskWatchRoute,
        countryPreparedness: countryPreparednessRoute,
        countryPlan: countryPlanRoute,
        countryAdditionalData: countryAdditionalDataRoute,
    } = useContext(RouteContext);

    const {
        pending: countryResponsePending,
        response: countryResponse,
    } = useRequest<CountryResponse>({
        skip: !countryId,
        url: '/api/v2/country/{id}/',
        pathVariables: {
            id: countryId,
        },
    });

    const {
        pending: aggregatedAppealPending,
        response: aggregatedAppealResponse,
    } = useRequest<AggregatedAppealResponse>({
        skip: !countryId,
        url: '/api/v2/appeal/aggregated',
        query: { country: countryId },
    });

    const outletContext = useMemo<CountryOutletContext>(
        () => ({
            countryResponse,
        }),
        [countryResponse],
    );

    const pending = countryResponsePending || aggregatedAppealPending;

    return (
        <Page
            className={styles.country}
            title={strings.countryPageTitle}
            heading={countryResponse?.name ?? '--'}
            infoContainerClassName={styles.keyFigureList}
            info={(
                <>
                    {pending && <BlockLoading />}
                    {!pending && aggregatedAppealResponse && (
                        <>
                            <KeyFigure
                                icon={<DrefIcon />}
                                className={styles.keyFigure}
                                value={aggregatedAppealResponse.active_drefs}
                                description={strings.countryKeyFiguresActiveDrefs}
                            />
                            <KeyFigure
                                icon={<AppealsIcon />}
                                className={styles.keyFigure}
                                value={aggregatedAppealResponse.active_appeals}
                                description={strings.countryKeyFiguresActiveAppeals}
                            />
                            <KeyFigure
                                icon={<FundingIcon />}
                                className={styles.keyFigure}
                                value={aggregatedAppealResponse.amount_requested_dref_included}
                                compactValue
                                description={strings.countryKeyFiguresBudget}
                            />
                            <KeyFigure
                                icon={<FundingCoverageIcon />}
                                className={styles.keyFigure}
                                value={aggregatedAppealResponse.amount_funded}
                                compactValue
                                description={strings.countryKeyFiguresAppealsFunding}
                            />
                            <KeyFigure
                                icon={<TargetedPopulationIcon />}
                                className={styles.keyFigure}
                                value={aggregatedAppealResponse.target_population}
                                compactValue
                                description={strings.countryKeyFiguresTargetPop}
                            />
                            {countryResponse?.has_country_plan && (
                                <KeyFigure
                                    icon={<AppealsTwoIcon />}
                                    className={styles.keyFigure}
                                    value={1}
                                    compactValue
                                    description={strings.countryKeyFiguresCountryPlan}
                                />
                            )}
                        </>
                    )}
                </>
            )}
        >
            <NavigationTabList>
                <NavigationTab
                    to={generatePath(
                        countryOperationsRoute.absolutePath,
                        { countryId },
                    )}
                >
                    {strings.countryOperationsTab}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        countryThreeWRoute.absolutePath,
                        { countryId },
                    )}
                >
                    {strings.country3WTab}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        countryRiskWatchRoute.absolutePath,
                        { countryId },
                    )}
                >
                    {strings.countryRiskTab}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        countryPreparednessRoute.absolutePath,
                        { countryId },
                    )}
                >
                    {strings.countryPreparednessTab}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        countryPlanRoute.absolutePath,
                        { countryId },
                    )}
                >
                    {strings.countryCountryPlanTab}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        countryAdditionalDataRoute.absolutePath,
                        { countryId },
                    )}
                >
                    {strings.countryAdditionalInfoTab}
                </NavigationTab>
            </NavigationTabList>
            <Outlet
                context={outletContext}
            />
        </Page>
    );
}

Component.displayName = 'Country';
