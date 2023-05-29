import { useParams, Outlet, generatePath } from 'react-router-dom';
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
import { useRequest } from '#utils/restRequest';

import routes from '#routes';

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

    return (
        <Page
            className={styles.country}
            title={strings.countryPageTitle}
            heading={countryResponse?.name ?? '--'}
            infoContainerClassName={styles.keyFigureList}
            info={(
                <>
                    {aggregatedAppealPending && <BlockLoading className={styles.loading} />}
                    {!aggregatedAppealPending && aggregatedAppealResponse && (
                        <>
                            <KeyFigure
                                icon={<DrefIcon />}
                                className={styles.keyFigure}
                                value={aggregatedAppealResponse.active_drefs}
                                description={strings.keyFiguresActiveDrefs}
                            />
                            <KeyFigure
                                icon={<AppealsIcon />}
                                className={styles.keyFigure}
                                value={aggregatedAppealResponse.active_appeals}
                                description={strings.keyFiguresActiveAppeals}
                            />
                            <KeyFigure
                                icon={<FundingIcon />}
                                className={styles.keyFigure}
                                value={aggregatedAppealResponse.amount_requested_dref_included}
                                normalize
                                description={strings.keyFiguresBudget}
                            />
                            <KeyFigure
                                icon={<FundingCoverageIcon />}
                                className={styles.keyFigure}
                                value={aggregatedAppealResponse.amount_funded}
                                normalize
                                description={strings.keyFiguresAppealsFunding}
                            />
                            <KeyFigure
                                icon={<TargetedPopulationIcon />}
                                className={styles.keyFigure}
                                value={aggregatedAppealResponse.target_population}
                                normalize
                                description={strings.keyFiguresTargetPop}
                            />
                            <KeyFigure
                                icon={<AppealsTwoIcon />}
                                className={styles.keyFigure}
                                // TODO: add country plan in response
                                value={undefined}
                                normalize
                                description={strings.keyFiguresCountryPlan}
                            />
                        </>
                    )}
                </>
            )}
        >
            <NavigationTabList>
                <NavigationTab
                    to={generatePath(
                        routes.countryOperations.absolutePath,
                        { countryId },
                    )}
                >
                    {strings.countryOperationsTab}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        routes.countryThreeW.absolutePath,
                        { countryId },
                    )}
                >
                    {strings.country3WTab}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        routes.countryRiskWatch.absolutePath,
                        { countryId },
                    )}
                >
                    {strings.countryRiskTab}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        routes.countryPreparedness.absolutePath,
                        { countryId },
                    )}
                >
                    {strings.countryPreparednessTab}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        routes.countryPlan.absolutePath,
                        { countryId },
                    )}
                >
                    {strings.countryCountryPlanTab}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        routes.countryAdditionalData.absolutePath,
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
