import { useMemo, useContext } from 'react';
import { useParams, Outlet, generatePath } from 'react-router-dom';
import {
    DrefIcon,
    AppealsIcon,
    FundingIcon,
    FundingCoverageIcon,
    TargetedPopulationIcon,
    AppealsTwoIcon,
} from '@ifrc-go/icons';
import { isNotDefined } from '@togglecorp/fujs';

import Page from '#components/Page';
import BlockLoading from '#components/BlockLoading';
import KeyFigure from '#components/KeyFigure';
import NavigationTabList from '#components/NavigationTabList';
import NavigationTab from '#components/NavigationTab';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';
import { useRequest } from '#utils/restRequest';
import { type RegionOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';
import styles from './styles.module.css';

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
    } = useRequest({
        skip: !regionId,
        url: '/api/v2/region/{id}/',
        // FIXME: the request is not triggered when pathVariables change
        pathVariables: {
            id: Number(regionId),
        },
    });

    const {
        pending: aggregatedAppealPending,
        response: aggregatedAppealResponse,
    } = useRequest({
        skip: isNotDefined(regionId),
        url: '/api/v2/appeal/aggregated',
        // FIXME: typings should be fixed in server
        query: { region: Number(regionId) } as never,
    });

    const outletContext: RegionOutletContext = useMemo(
        () => ({
            regionResponse,
        }),
        [regionResponse],
    );

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
                    parentRoute
                >
                    {strings.regionRiskTab}
                </NavigationTab>
                {(regionResponse && regionResponse?.preparedness_snippets.length > 0) ? (
                    <NavigationTab
                        to={generatePath(
                            regionPreparednessRoute.absolutePath,
                            { regionId },
                        )}
                    >
                        {strings.regionPreparednessTab}
                    </NavigationTab>
                ) : null}
                <NavigationTab
                    to={generatePath(
                        regionProfileRoute.absolutePath,
                        { regionId },
                    )}
                >
                    {strings.regionProfileTab}
                </NavigationTab>
            </NavigationTabList>
            <Outlet
                context={outletContext}
            />
        </Page>
    );
}

Component.displayName = 'Region';
