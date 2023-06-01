import { useParams, Outlet, generatePath } from 'react-router-dom';
import { useContext } from 'react';
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
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface CountryResponse {
    additional_tab_name: string;
    contacts: unknown[];
    has_country_plan: boolean;
    id: number;
    inform_score: number | null;
    iso: string;
    key_priorities: string;
    links: unknown[];
    name : string;
    nsi_annual_fdrs_reporting: null;
    nsi_branches : null;
    nsi_cmc_dashboard_compliance: null;
    nsi_domestically_generated_income: null;
    nsi_expenditures: null;
    nsi_gov_financial_support: null;
    nsi_income: null;
    nsi_policy_implementation: null;
    nsi_risk_management_framework: null;
    nsi_staff: null;
    nsi_trained_in_first_aid: null;
    nsi_volunteers: null;
    nsi_youth: null;
    overview: null;
    region: number;
    society_name: string;
    society_url: string;
    url_ifrc: string;
    wash_kit2: null;
    wash_kit5: null;
    wash_kit10: null;
    wash_ndrt_trained: null;
    wash_rdrt_trained: null;
    wash_staff_at_branch: null;
    wash_staff_at_hq: null;
}

interface AggregatedAppealResponse {
    active_appeals: number | null;
    active_drefs: number | null;
    amount_funded: number | null;
    amount_requested: number | null;
    amount_requested_dref_included: number | null;
    target_population: number | null;
    total_appeals: number | null;
}

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
        url: `api/v2/country/${countryId}/`,
    });

    const {
        pending: aggregatedAppealPending,
        response: aggregatedAppealResponse,
    } = useRequest<AggregatedAppealResponse>({
        skip: !countryId,
        url: 'api/v2/appeal/aggregated/',
        query: { country: countryId },
    });

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
                                normalize
                                description={strings.countryKeyFiguresBudget}
                            />
                            <KeyFigure
                                icon={<FundingCoverageIcon />}
                                className={styles.keyFigure}
                                value={aggregatedAppealResponse.amount_funded}
                                normalize
                                description={strings.countryKeyFiguresAppealsFunding}
                            />
                            <KeyFigure
                                icon={<TargetedPopulationIcon />}
                                className={styles.keyFigure}
                                value={aggregatedAppealResponse.target_population}
                                normalize
                                description={strings.countryKeyFiguresTargetPop}
                            />
                            {countryResponse?.has_country_plan && (
                                <KeyFigure
                                    icon={<AppealsTwoIcon />}
                                    className={styles.keyFigure}
                                    value={1}
                                    normalize
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
            <Outlet />
        </Page>
    );
}

Component.displayName = 'Country';
