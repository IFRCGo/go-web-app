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
import KeyFigure from '#components/KeyFigure';
import NavigationTabList from '#components/NavigationTabList';
import NavigationTab from '#components/NavigationTab';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';

import routes from '#routes';

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
                                normalize
                                description={strings.regionKeyFiguresBudget}
                            />
                            <KeyFigure
                                icon={<FundingCoverageIcon />}
                                className={styles.keyFigure}
                                value={aggregatedAppealResponse.amount_funded}
                                normalize
                                description={strings.regionKeyFiguresAppealsFunding}
                            />
                            <KeyFigure
                                icon={<TargetedPopulationIcon />}
                                className={styles.keyFigure}
                                value={aggregatedAppealResponse.target_population}
                                normalize
                                description={strings.regionKeyFiguresTargetPop}
                            />
                            <KeyFigure
                                icon={<AppealsTwoIcon />}
                                className={styles.keyFigure}
                                value={regionResponse.country_plan_count}
                                normalize
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
                        routes.regionOperations.absolutePath,
                        { regionId },
                    )}
                >
                    {strings.regionOperationsTab}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        routes.regionThreeW.absolutePath,
                        { regionId },
                    )}
                >
                    {strings.region3WTab}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        routes.regionRiskWatch.absolutePath,
                        { regionId },
                    )}
                >
                    {strings.regionRiskTab}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        routes.regionPreparedness.absolutePath,
                        { regionId },
                    )}
                >
                    {strings.regionPreparednessTab}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        routes.regionProfile.absolutePath,
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
