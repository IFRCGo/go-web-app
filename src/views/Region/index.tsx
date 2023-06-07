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
import KeyFigure from '#components/KeyFigure';
import NavigationTabList from '#components/NavigationTabList';
import NavigationTab from '#components/NavigationTab';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Snippet {
    region: number;
    id: number;
    snippet: string;
    title: string;
}

interface RegionResponse {
    additional_tab_name: string | null;
    contacts: unknown[];
    country_cluster_count: number;
    country_plan_count: number;
    emergency_snippets: Snippet[];
    id: string;
    links: unknown[];
    name: number;
    national_society_count: number;
    preparedness_snippets: Snippet[];
    profile_snippets: Snippet[];
    region_name: string;
    snippets: Snippet[];
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
    const { regionId } = useParams<{ regionId: string }>();
    const strings = useTranslation(i18n);

    const {
        regionOperations: regionOperationsRoute,
        regionThreeW: regionThreeWRoute,
        regionRiskWatch: regionRiskWatchRoute,
        regionPreparedness: regionPreparednessRoute,
        regionProfile: regionProfileRoute,
    } = useContext(RouteContext);

    const {
        pending: regionPending,
        response: regionResponse,
    } = useRequest<RegionResponse>({
        skip: !regionId,
        url: `api/v2/region/${regionId}/`,
    });

    const {
        pending: aggregatedAppealPending,
        response: aggregatedAppealResponse,
    } = useRequest<AggregatedAppealResponse>({
        skip: !regionId,
        url: 'api/v2/appeal/aggregated/',
        query: { region: regionId },
    });

    const pending = regionPending || aggregatedAppealPending;

    return (
        <Page
            className={styles.region}
            title={strings.regionTitle}
            heading={regionResponse?.region_name ?? '--'}
            infoContainerClassName={styles.keyFigureList}
            info={(
                <>
                    {pending && <BlockLoading />}
                    {!pending && aggregatedAppealResponse && regionResponse && (
                        <>
                            <KeyFigure
                                icon={<DrefIcon />}
                                className={styles.keyFigure}
                                value={aggregatedAppealResponse.active_drefs}
                                description={strings.regionKeyFiguresActiveDrefs}
                            />
                            <KeyFigure
                                icon={<AppealsIcon />}
                                className={styles.keyFigure}
                                value={aggregatedAppealResponse.active_appeals}
                                description={strings.regionKeyFiguresActiveAppeals}
                            />
                            <KeyFigure
                                icon={<FundingIcon />}
                                className={styles.keyFigure}
                                value={aggregatedAppealResponse.amount_requested_dref_included}
                                compactValue
                                description={strings.regionKeyFiguresBudget}
                            />
                            <KeyFigure
                                icon={<FundingCoverageIcon />}
                                className={styles.keyFigure}
                                value={aggregatedAppealResponse.amount_funded}
                                compactValue
                                description={strings.regionKeyFiguresAppealsFunding}
                            />
                            <KeyFigure
                                icon={<TargetedPopulationIcon />}
                                className={styles.keyFigure}
                                value={aggregatedAppealResponse.target_population}
                                compactValue
                                description={strings.regionKeyFiguresTargetPop}
                            />
                            <KeyFigure
                                icon={<AppealsTwoIcon />}
                                className={styles.keyFigure}
                                value={regionResponse.country_plan_count}
                                compactValue
                                description={strings.regionKeyFiguresCountryPlan}
                            />
                        </>
                    )}
                </>
            )}
        >
            <NavigationTabList>
                <NavigationTab
                    to={generatePath(
                        regionOperationsRoute.absolutePath,
                        { regionId },
                    )}
                >
                    {strings.regionOperationsTab}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        regionThreeWRoute.absolutePath,
                        { regionId },
                    )}
                >
                    {strings.region3WTab}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        regionRiskWatchRoute.absolutePath,
                        { regionId },
                    )}
                >
                    {strings.regionRiskTab}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        regionPreparednessRoute.absolutePath,
                        { regionId },
                    )}
                >
                    {strings.regionPreparednessTab}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        regionProfileRoute.absolutePath,
                        { regionId },
                    )}
                >
                    {strings.regionProfileTab}
                </NavigationTab>
            </NavigationTabList>
            <Outlet />
        </Page>
    );
}

Component.displayName = 'Region';
