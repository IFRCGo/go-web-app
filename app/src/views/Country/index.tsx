import {
    useContext,
    useMemo,
} from 'react';
import {
    generatePath,
    Navigate,
    Outlet,
    useParams,
} from 'react-router-dom';
import { PencilFillIcon } from '@ifrc-go/icons';
import {
    Breadcrumbs,
    Message,
    NavigationTabList,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isFalsyString,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import NavigationTab from '#components/NavigationTab';
import Page from '#components/Page';
import { adminUrl } from '#config';
import RouteContext from '#contexts/route';
import useAuth from '#hooks/domain/useAuth';
import useCountry from '#hooks/domain/useCountry';
import usePermissions from '#hooks/domain/usePermissions';
import useRegion from '#hooks/domain/useRegion';
import {
    countryIdToRegionIdMap,
    isCountryIdRegion,
} from '#utils/domain/country';
import { type CountryOutletContext } from '#utils/outletContext';
import { resolveUrl } from '#utils/resolveUrl';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryId } = useParams<{ countryId: string }>();
    const { regionIndex } = useContext(RouteContext);

    const strings = useTranslation(i18n);
    const country = useCountry({ id: Number(countryId) });
    const region = useRegion({ id: country?.region });

    const numericCountryId = isDefined(countryId) ? Number(countryId) : undefined;
    const isRegion = isCountryIdRegion(numericCountryId);

    const {
        pending: countryResponsePending,
        response: countryResponse,
        error: countryResponseError,
    } = useRequest({
        skip: isNotDefined(countryId) || isRegion,
        url: '/api/v2/country/{id}/',
        pathVariables: {
            id: Number(countryId),
        },
    });

    const { isAuthenticated } = useAuth();
    const { isGuestUser } = usePermissions();

    const outletContext = useMemo<CountryOutletContext>(
        () => ({
            countryId,
            countryResponse,
            countryResponsePending,
        }),
        [countryResponse, countryId, countryResponsePending],
    );

    const additionalInfoTabName = isTruthyString(countryResponse?.additional_tab_name)
        ? countryResponse?.additional_tab_name
        : strings.countryAdditionalInfoTab;

    const hasAdditionalInfoData = !!countryResponse && (
        isTruthyString(countryResponse.additional_tab_name)
        || (countryResponse.links && countryResponse.links.length > 0)
        || (countryResponse.contacts && countryResponse.contacts.length > 0)
    );

    const pageTitle = resolveToString(
        strings.countryPageTitle,
        { countryName: country?.name ?? strings.countryPageTitleFallbackCountry },
    );

    if (isDefined(numericCountryId) && isRegion) {
        const regionId = countryIdToRegionIdMap[numericCountryId];

        const regionPath = generatePath(
            regionIndex.absoluteForwardPath,
            { regionId },
        );

        return (
            <Navigate
                to={regionPath}
                replace
            />
        );
    }

    if (isDefined(countryResponseError)) {
        return (
            <Page
                title={pageTitle}
                className={styles.country}
            >
                <Message
                    title={strings.countryLoadingErrorMessage}
                    description={countryResponseError.value?.messageForNotification}
                />
            </Page>
        );
    }

    if (isDefined(countryResponse) && isFalsyString(countryResponse.iso3)) {
        return (
            <Page
                title={pageTitle}
                className={styles.country}
            >
                <Message
                    title={strings.countryLoadingErrorMessage}
                />
            </Page>
        );
    }

    return (
        <Page
            className={styles.country}
            title={pageTitle}
            heading={country?.name ?? '--'}
            breadCrumbs={(
                <Breadcrumbs>
                    <Link
                        to="home"
                    >
                        {strings.home}
                    </Link>
                    <Link
                        to="regionsLayout"
                        urlParams={{
                            regionId: country?.region,
                        }}
                    >
                        {region?.region_name}
                    </Link>
                    <Link
                        to="countriesLayout"
                        urlParams={{
                            countryId,
                        }}
                    >
                        {country?.name}
                    </Link>
                </Breadcrumbs>
            )}
            description={
                isDefined(countryResponse)
                && isDefined(countryResponse.regions_details?.id)
                && (
                    <Link
                        to="regionsLayout"
                        urlParams={{
                            regionId: countryResponse.regions_details.id,
                        }}
                        withLinkIcon
                    >
                        {countryResponse?.regions_details?.region_name}
                    </Link>
                )
            }
            actions={!isGuestUser && isAuthenticated && (
                <Link
                    external
                    href={resolveUrl(adminUrl, `api/country/${countryId}/change/`)}
                    variant="secondary"
                    icons={<PencilFillIcon />}
                >
                    {strings.editCountryLink}
                </Link>
            )}
        >
            <NavigationTabList>
                <NavigationTab
                    to="countryOngoingActivitiesLayout"
                    urlParams={{ countryId }}
                    parentRoute
                >
                    {strings.ongoingActivitiesTabTitle}
                </NavigationTab>
                <NavigationTab
                    to="countryNsOverviewLayout"
                    urlParams={{ countryId }}
                    parentRoute
                >
                    {strings.nsOverviewTabTitle}
                </NavigationTab>
                <NavigationTab
                    to="countryProfileLayout"
                    urlParams={{ countryId }}
                    parentRoute
                >
                    {strings.countryProfileTabTitle}
                </NavigationTab>
                {hasAdditionalInfoData && (
                    <NavigationTab
                        to="countryAdditionalInfo"
                        urlParams={{ countryId }}
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

Component.displayName = 'Country';
