import {
    useParams,
    Outlet,
    Navigate,
    generatePath,
} from 'react-router-dom';
import { useContext, useMemo } from 'react';
import {
    DrefIcon,
    AppealsIcon,
    FundingIcon,
    FundingCoverageIcon,
    TargetedPopulationIcon,
    AppealsTwoIcon,
    PencilFillIcon,
} from '@ifrc-go/icons';
import {
    isDefined,
    isNotDefined,
    isTruthyString,
    isFalsyString,
} from '@togglecorp/fujs';

import { resolveUrl } from '#utils/resolveUrl';
import BlockLoading from '#components/BlockLoading';
import Breadcrumbs from '#components/Breadcrumbs';
import InfoPopup from '#components/InfoPopup';
import KeyFigure from '#components/KeyFigure';
import Link from '#components/Link';
import Message from '#components/Message';
import NavigationTab from '#components/NavigationTab';
import NavigationTabList from '#components/NavigationTabList';
import Page from '#components/Page';
import useAuth from '#hooks/domain/useAuth';
import useCountry from '#hooks/domain/useCountry';
import useRegion from '#hooks/domain/useRegion';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';
import { type CountryOutletContext } from '#utils/outletContext';
import { resolveToString } from '#utils/translation';
import { getPercentage } from '#utils/common';
import { countryIdToRegionIdMap, isCountryIdRegion } from '#utils/domain/country';
import { adminUrl } from '#config';
import RouteContext from '#contexts/route';

import i18n from './i18n.json';
import styles from './styles.module.css';

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

    const {
        pending: aggregatedAppealPending,
        response: aggregatedAppealResponse,
    } = useRequest({
        skip: isNotDefined(countryId) || isRegion,
        url: '/api/v2/appeal/aggregated',
        query: { country: Number(countryId) },
    });

    const outletContext = useMemo<CountryOutletContext>(
        () => ({
            countryResponse,
            countryResponsePending,
        }),
        [countryResponse, countryResponsePending],
    );

    const pending = countryResponsePending || aggregatedAppealPending;

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
                                info={(
                                    <InfoPopup
                                        title={strings.countryKeyFiguresDrefTitle}
                                        description={strings.countryKeyFiguresDrefDescription}
                                    />
                                )}
                                label={strings.countryKeyFiguresActiveDrefs}
                            />
                            <KeyFigure
                                icon={<AppealsIcon />}
                                className={styles.keyFigure}
                                value={aggregatedAppealResponse.active_appeals}
                                info={(
                                    <InfoPopup
                                        title={strings.countryKeyFiguresActiveAppealsTitle}
                                        description={
                                            strings.countryKeyFigureActiveAppealDescription
                                        }
                                    />
                                )}
                                label={strings.countryKeyFiguresActiveAppeals}
                            />
                            <KeyFigure
                                icon={<FundingIcon />}
                                className={styles.keyFigure}
                                value={aggregatedAppealResponse?.amount_requested_dref_included}
                                compactValue
                                label={strings.countryKeyFiguresBudget}
                            />
                            <KeyFigure
                                icon={<FundingCoverageIcon />}
                                className={styles.keyFigure}
                                value={getPercentage(
                                    aggregatedAppealResponse?.amount_funded,
                                    aggregatedAppealResponse?.amount_requested,
                                )}
                                suffix="%"
                                compactValue
                                label={strings.countryKeyFiguresAppealsFunding}
                            />
                            <KeyFigure
                                icon={<TargetedPopulationIcon />}
                                className={styles.keyFigure}
                                value={aggregatedAppealResponse.target_population}
                                compactValue
                                label={strings.countryKeyFiguresTargetPop}
                            />
                            {countryResponse?.has_country_plan && (
                                <KeyFigure
                                    icon={<AppealsTwoIcon />}
                                    className={styles.keyFigure}
                                    value={1}
                                    compactValue
                                    label={strings.countryKeyFiguresCountryPlan}
                                />
                            )}
                        </>
                    )}
                </>
            )}
            actions={isAuthenticated && (
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
                    to="countryOperations"
                    urlParams={{ countryId }}
                >
                    {strings.countryOperationsTab}
                </NavigationTab>
                <NavigationTab
                    to="countriesThreeWLayout"
                    urlParams={{ countryId }}
                    parentRoute
                >
                    {strings.country3WTab}
                </NavigationTab>
                <NavigationTab
                    to="countryRiskWatch"
                    urlParams={{ countryId }}
                >
                    {strings.countryRiskTab}
                </NavigationTab>
                <NavigationTab
                    to="countryPreparedness"
                    urlParams={{ countryId }}
                >
                    {strings.countryPreparednessTab}
                </NavigationTab>
                <NavigationTab
                    to="countryPlan"
                    urlParams={{ countryId }}
                >
                    {strings.countryCountryPlanTab}
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
            {isDefined(countryResponse) && (
                <div className={styles.links}>
                    {isTruthyString(countryResponse.fdrs) && (
                        <Link
                            href={`https://data.ifrc.org/FDRS/national-society/${countryResponse.fdrs}`}
                            external
                            withLinkIcon
                        >
                            {strings.nationalSocietyPageOnFDRS}
                        </Link>
                    )}
                    {isTruthyString(countryResponse.url_ifrc) && (
                        <Link
                            href={countryResponse.url_ifrc}
                            external
                            withLinkIcon
                        >
                            {resolveToString(
                                strings.countryOnIFRC,
                                { countryName: countryResponse?.name ?? '-' },
                            )}
                        </Link>
                    )}
                    {isTruthyString(countryResponse.iso3) && (
                        <Link
                            href={`https://reliefweb.int/country/${countryResponse.iso3}`}
                            external
                            withLinkIcon
                        >
                            {resolveToString(
                                strings.countryOnReliefWeb,
                                { countryName: countryResponse?.name ?? '-' },
                            )}
                        </Link>
                    )}
                    {isTruthyString(countryResponse.society_url) && (
                        <Link
                            href={countryResponse?.society_url}
                            external
                            withLinkIcon
                        >
                            {resolveToString(
                                strings.countryRCHomepage,
                                { countryName: countryResponse?.name ?? '-' },
                            )}
                        </Link>
                    )}
                </div>
            )}
        </Page>
    );
}

Component.displayName = 'Country';
