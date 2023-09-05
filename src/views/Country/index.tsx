import { useParams, Outlet } from 'react-router-dom';
import { useMemo } from 'react';
import {
    DrefIcon,
    AppealsIcon,
    FundingIcon,
    FundingCoverageIcon,
    TargetedPopulationIcon,
    AppealsTwoIcon,
} from '@ifrc-go/icons';
import { isDefined, isNotDefined, isTruthyString } from '@togglecorp/fujs';
import Page from '#components/Page';
import BlockLoading from '#components/BlockLoading';
import NavigationTabList from '#components/NavigationTabList';
import NavigationTab from '#components/NavigationTab';
import KeyFigure from '#components/KeyFigure';
import Message from '#components/Message';
import Link from '#components/Link';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';
import { type CountryOutletContext } from '#utils/outletContext';
import { resolveToString } from '#utils/translation';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryId } = useParams<{ countryId: string }>();

    const strings = useTranslation(i18n);

    const {
        pending: countryResponsePending,
        response: countryResponse,
        error: countryResponseError,
    } = useRequest({
        // FIXME: need to check if countryId can be ''
        skip: isNotDefined(countryId),
        url: '/api/v2/country/{id}/',
        pathVariables: {
            id: Number(countryId),
        },
    });

    const {
        pending: aggregatedAppealPending,
        response: aggregatedAppealResponse,
    } = useRequest({
        // FIXME: need to check if countryId can be ''
        skip: isNotDefined(countryId),
        url: '/api/v2/appeal/aggregated',
        // FIXME: typings should be fixed in the server
        query: { country: Number(countryId) } as never,
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
        { countryName: countryResponse?.name ?? strings.countryPageTitleFallbackCountry },
    );

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

    return (
        <Page
            className={styles.country}
            title={pageTitle}
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
                        to="countryAdditionalData"
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
                            to={`https://data.ifrc.org/FDRS/national-society/${countryResponse.fdrs}`}
                            external
                            withExternalLinkIcon
                        >
                            {strings.nationalSocietyPageOnFDRS}
                        </Link>
                    )}
                    {isTruthyString(countryResponse.url_ifrc) && (
                        <Link
                            to={countryResponse.url_ifrc}
                            external
                            withExternalLinkIcon
                        >
                            {resolveToString(
                                strings.countryOnIFRC,
                                { countryName: countryResponse?.name ?? '-' },
                            )}
                        </Link>
                    )}
                    {isTruthyString(countryResponse.iso3) && (
                        <Link
                            to={`https://reliefweb.int/country/${countryResponse.iso3}`}
                            external
                            withExternalLinkIcon
                        >
                            {resolveToString(
                                strings.countryOnReliefWeb,
                                { countryName: countryResponse?.name ?? '-' },
                            )}
                        </Link>
                    )}
                    {isTruthyString(countryResponse.society_url) && (
                        <Link
                            to={countryResponse?.society_url}
                            external
                            withExternalLinkIcon
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
