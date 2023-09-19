import { useMemo } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import {
    DrefIcon,
    AppealsIcon,
    FundingIcon,
    FundingCoverageIcon,
    TargetedPopulationIcon,
    AppealsTwoIcon,
} from '@ifrc-go/icons';
import { isNotDefined, isTruthyString } from '@togglecorp/fujs';

import Page from '#components/Page';
import BlockLoading from '#components/BlockLoading';
import KeyFigure from '#components/KeyFigure';
import InfoPopup from '#components/InfoPopup';
import NavigationTabList from '#components/NavigationTabList';
import NavigationTab from '#components/NavigationTab';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';
import { type RegionOutletContext } from '#utils/outletContext';
import { getPercentage } from '#utils/common';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { regionId } = useParams<{ regionId: string }>();
    const strings = useTranslation(i18n);

    const {
        pending: regionPending,
        response: regionResponse,
    } = useRequest({
        skip: isNotDefined(regionId),
        url: '/api/v2/region/{id}/',
        pathVariables: {
            id: Number(regionId),
        },
    });

    const {
        pending: regionKeyFigurePending,
        response: regionKeyFigureResponse,
    } = useRequest({
        skip: isNotDefined(regionId),
        url: '/api/v2/region_key_figure/',
        query: { region: Number(regionId) },
    });

    const {
        pending: aggregatedAppealPending,
        response: aggregatedAppealResponse,
    } = useRequest({
        skip: isNotDefined(regionId),
        url: '/api/v2/appeal/aggregated',
        query: { region: Number(regionId) },
    });

    const outletContext: RegionOutletContext = useMemo(
        () => ({
            regionResponse,
            regionKeyFigureResponse,
        }),
        [regionResponse, regionKeyFigureResponse],
    );

    const pending = regionPending || aggregatedAppealPending || regionKeyFigurePending;
    const additionalInfoTabName = regionResponse?.additional_tab_name
        || strings.regionAdditionalInfoTab;
    const hasPreparednessSnippet = (
        regionResponse
        && regionResponse.preparedness_snippets.length > 0
    );
    const hasAdditionalInfoSnippet = (
        isTruthyString(regionResponse?.additional_tab_name)
        || (regionKeyFigureResponse?.results
            && regionKeyFigureResponse.results.length > 0)
    );

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
                                info={(
                                    <InfoPopup
                                        title={strings.regionKeyFiguresDrefTitle}
                                        description={strings.regionKeyFiguresDrefDescription}
                                    />
                                )}
                                description={strings.regionKeyFiguresActiveDrefs}
                            />
                            <KeyFigure
                                icon={<AppealsIcon />}
                                className={styles.keyFigure}
                                value={aggregatedAppealResponse.active_appeals}
                                info={(
                                    <InfoPopup
                                        title={strings.regionKeyFiguresActiveAppealsTitle}
                                        description={strings.regionKeyFigureActiveAppealDescription}
                                    />
                                )}
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
                                value={getPercentage(
                                    aggregatedAppealResponse?.amount_funded,
                                    aggregatedAppealResponse?.amount_requested_dref_included,
                                )}
                                suffix="%"
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
                    to="regionOperations"
                    urlParams={{ regionId }}
                >
                    {strings.regionOperationsTab}
                </NavigationTab>
                <NavigationTab
                    to="regionThreeW"
                    urlParams={{ regionId }}
                >
                    {strings.region3WTab}
                </NavigationTab>
                <NavigationTab
                    to="regionRiskWatchLayout"
                    urlParams={{ regionId }}
                    parentRoute
                >
                    {strings.regionRiskTab}
                </NavigationTab>
                {hasPreparednessSnippet && (
                    <NavigationTab
                        to="regionPreparedness"
                        urlParams={{ regionId }}
                    >
                        {strings.regionPreparednessTab}
                    </NavigationTab>
                )}
                <NavigationTab
                    to="regionProfile"
                    urlParams={{ regionId }}
                >
                    {strings.regionProfileTab}
                </NavigationTab>
                {hasAdditionalInfoSnippet && (
                    <NavigationTab
                        to="regionAdditionalInfo"
                        urlParams={{ regionId }}
                    >
                        {additionalInfoTabName}
                    </NavigationTab>
                )}
            </NavigationTabList>
            <Outlet
                context={outletContext}
            />
        </Page>
    );
}

Component.displayName = 'Region';
