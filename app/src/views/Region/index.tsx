import { useMemo } from 'react';
import {
    Outlet,
    useParams,
} from 'react-router-dom';
import {
    BlockLoading,
    NavigationTabList,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import RegionKeyFigures from '#components/domain/RegionKeyFigures';
import NavigationTab from '#components/NavigationTab';
import Page from '#components/Page';
import useRegion from '#hooks/domain/useRegion';
import { type RegionOutletContext } from '#utils/outletContext';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { regionId } = useParams<{ regionId: string }>();
    const strings = useTranslation(i18n);

    const region = useRegion({ id: Number(regionId) });

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

    const outletContext: RegionOutletContext = useMemo(
        () => ({
            regionResponse,
            regionKeyFigureResponse,
        }),
        [regionResponse, regionKeyFigureResponse],
    );

    const pending = regionPending || regionKeyFigurePending;
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
            heading={region?.region_name ?? '--'}
            infoContainerClassName={styles.keyFigureList}
            info={(
                <>
                    {pending && <BlockLoading />}
                    {isDefined(regionId) && (
                        <RegionKeyFigures
                            regionResponse={regionResponse}
                            regionId={regionId}
                        />
                    )}
                    {/* {strings.wikiJsLink?.length > 0 && (
                            <WikiLink
                                href=''
                            />
                    )} */}
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
