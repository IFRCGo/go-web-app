import {
    useContext,
    useMemo,
} from 'react';
import {
    Outlet,
    useParams,
} from 'react-router-dom';
import {
    FundingCoverageIcon,
    FundingIcon,
    PencilFillIcon,
    TargetedPopulationIcon,
} from '@ifrc-go/icons';
import {
    Button,
    KeyFigure,
    NavigationTabList,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { sumSafe } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import GoBreadcrumbs from '#components/GoBreadcrumbs';
import Link, { type InternalLinkProps } from '#components/Link';
import NavigationTab from '#components/NavigationTab';
import Page from '#components/Page';
import { adminUrl } from '#config';
import DomainContext from '#contexts/domain';
import useAuth from '#hooks/domain/useAuth';
import usePermissions from '#hooks/domain/usePermissions';
import useRegion from '#hooks/domain/useRegion';
import useUserMe from '#hooks/domain/useUserMe';
import { type EmergencyOutletContext } from '#utils/outletContext';
import { resolveUrl } from '#utils/resolveUrl';
import {
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type BreadcrumbsDataType = {
        to: InternalLinkProps['to'];
        label: string;
        urlParams?: Record<string, string | number | null | undefined>;
};

/*
function getRouteIdFromName(text: string) {
    return text.toLowerCase().trim().split(' ').join('-');
}
*/

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { emergencyId } = useParams<{ emergencyId: string }>();
    const strings = useTranslation(i18n);
    const { invalidate } = useContext(DomainContext);

    const {
        response: emergencyResponse,
        pending: emergencyPending,
    } = useRequest({
        // FIXME: need to check if emergencyId can be ''
        skip: isNotDefined(emergencyId),
        url: '/api/v2/event/{id}/',
        pathVariables: {
            id: Number(emergencyId),
        },
    });

    const {
        response: emergencySnippetResponse,
        pending: emergencySnippetPending,
    } = useRequest({
        // FIXME: need to check if emergencyId can be ''
        skip: isNotDefined(emergencyId),
        url: '/api/v2/event_snippet/',
        query: {
            event: Number(emergencyId),
        },
    });

    // FIXME: show surge tab for the emergency if there is surge alerts to it
    // This could be done by adding surge alert count to the emergency instance API in future
    const {
        response: surgeAlertsResponse,
    } = useRequest({
        url: '/api/v2/surge_alert/',
        preserveResponse: true,
        query: {
            limit: 5,
            event: Number(emergencyId),
        },
    });

    const {
        pending: addSubscriptionPending,
        trigger: triggerAddSubscription,
    } = useLazyRequest({
        url: '/api/v2/add_subscription/',
        method: 'POST',
        body: (eventId: number) => ([{
            type: 'followedEvent',
            value: eventId,
        }]),
        onSuccess: () => {
            invalidate('user-me');
        },
    });

    const {
        pending: removeSubscriptionPending,
        trigger: triggerRemoveSubscription,
    } = useLazyRequest({
        url: '/api/v2/del_subscription/',
        method: 'POST',
        body: (eventId: number) => ([{
            value: eventId,
        }]),
        onSuccess: () => {
            invalidate('user-me');
        },
    });
    const meResponse = useUserMe();

    // FIXME: the subscription information should be sent from the server on
    // the emergency
    const subscriptionMap = listToMap(
        meResponse?.subscription?.filter(
            (sub) => isDefined(sub.event),
        ) ?? [],
        (sub) => sub.event ?? 'unknown',
        () => true,
    );

    const isSubscribed = isDefined(emergencyId) ? subscriptionMap[Number(emergencyId)] : false;

    const { isAuthenticated } = useAuth();
    const { isGuestUser } = usePermissions();
    const subscriptionPending = addSubscriptionPending || removeSubscriptionPending;
    const isPending = emergencyPending || emergencySnippetPending;

    const country = emergencyResponse?.countries[0];
    const region = useRegion({ id: Number(country?.region) });

    const peopleTargeted = sumSafe(
        emergencyResponse?.appeals.map(
            (appeal) => appeal.num_beneficiaries,
        ),
    );
    const fundingRequirements = sumSafe(
        emergencyResponse?.appeals.map(
            (appeal) => appeal.amount_requested,
        ),
    );

    const funding = sumSafe(
        emergencyResponse?.appeals.map(
            (appeal) => appeal.amount_funded,
        ),
    );

    const emergencyAdditionalTabs = useMemo(() => {
        if (
            isNotDefined(emergencyResponse)
            || isNotDefined(emergencySnippetResponse)
            || isNotDefined(emergencySnippetResponse.results)
        ) {
            return [];
        }

        const tabOneTitle = emergencyResponse.tab_one_title || 'Additional Info 1';
        const tabTwoTitle = emergencyResponse.tab_two_title || 'Additional Info 2';
        const tabThreeTitle = emergencyResponse.tab_three_title || 'Additional Info 3';

        function toKebabCase(str: string) {
            return str.toLocaleLowerCase().split(' ').join('-');
        }

        return [
            {
                name: tabOneTitle,
                tabId: toKebabCase(tabOneTitle),
                routeName: 'emergencyAdditionalInfoOne' as const,
                infoPageId: 1 as const,
                snippets: emergencySnippetResponse.results.filter(
                    (snippet) => snippet.tab === 1,
                ),
            },
            {
                name: tabTwoTitle,
                tabId: toKebabCase(tabTwoTitle),
                routeName: 'emergencyAdditionalInfoTwo' as const,
                infoPageId: 2 as const,
                snippets: emergencySnippetResponse.results.filter(
                    (snippet) => snippet.tab === 2,
                ),
            },
            {
                name: tabThreeTitle,
                tabId: toKebabCase(tabThreeTitle),
                routeName: 'emergencyAdditionalInfoThree' as const,
                infoPageId: 3 as const,
                snippets: emergencySnippetResponse.results.filter(
                    (snippet) => snippet.tab === 3,
                ),
            },
        ].filter((tabInfo) => tabInfo.snippets.length > 0);
    }, [emergencyResponse, emergencySnippetResponse]);

    const breadCrumbsData: BreadcrumbsDataType[] = useMemo(() => ([
        {
            to: 'home',
            label: strings.home,
        },
        {
            to: 'emergencies',
            label: strings.emergencies,
        },
        {
            to: 'emergencyDetails',
            label: emergencyResponse?.name ?? '-',
            urlParams: {
                emergencyId,
            },
        },
    ]), [
        strings.home,
        strings.emergencies,
        emergencyId,
        emergencyResponse?.name,
    ]);

    const outletContext = useMemo<EmergencyOutletContext>(
        () => ({
            emergencyResponse,
            emergencyAdditionalTabs,
        }),
        [emergencyResponse, emergencyAdditionalTabs],
    );

    const showSurgeTab = (surgeAlertsResponse?.count ?? 0) > 0
        || (emergencyResponse?.active_deployments ?? 0) > 0;

    return (
        <Page
            className={styles.emergency}
            title={strings.emergencyPageTitle}
            breadCrumbs={(
                <GoBreadcrumbs
                    routeData={breadCrumbsData}
                />
            )}
            actions={isAuthenticated && (
                <>
                    <Button
                        name={Number(emergencyId)}
                        variant="secondary"
                        disabled={subscriptionPending}
                        onClick={isSubscribed ? triggerRemoveSubscription : triggerAddSubscription}
                    >
                        {isSubscribed ? strings.emergencyUnfollow : strings.emergencyFollow}
                    </Button>
                    {!isGuestUser && (
                        <Link
                            external
                            href={resolveUrl(adminUrl, `api/event/${emergencyId}/change/`)}
                            variant="secondary"
                            icons={<PencilFillIcon />}
                            disabled={isPending}
                        >
                            {strings.emergencyEdit}
                        </Link>
                    )}
                </>
            )}
            heading={emergencyResponse?.name ?? '--'}
            description={(
                <>
                    <Link
                        to="regionsLayout"
                        urlParams={{
                            regionId: region?.id,
                        }}
                        withLinkIcon
                    >
                        {region?.region_name}
                    </Link>
                    <Link
                        to="countriesLayout"
                        urlParams={{
                            countryId: country?.id,
                        }}
                        withLinkIcon
                    >
                        {country?.name}
                    </Link>
                </>
            )}
            infoContainerClassName={styles.keyFigureList}
            info={(
                <>
                    {isDefined(peopleTargeted) && (
                        <KeyFigure
                            icon={<TargetedPopulationIcon />}
                            className={styles.keyFigure}
                            value={peopleTargeted}
                            compactValue
                            label={strings.emergencyPeopleTargetedLabel}
                        />
                    )}
                    {isDefined(fundingRequirements) && (
                        <KeyFigure
                            icon={<FundingIcon />}
                            className={styles.keyFigure}
                            value={fundingRequirements}
                            compactValue
                            label={strings.emergencyFundingRequirementsLabel}
                        />

                    )}
                    {isDefined(funding) && (
                        <KeyFigure
                            icon={<FundingCoverageIcon />}
                            className={styles.keyFigure}
                            value={funding}
                            compactValue
                            label={strings.emergencyFundingLabel}
                        />
                    )}
                </>
            )}
            contentOriginalLanguage={emergencyResponse?.translation_module_original_language}
        >
            <NavigationTabList>
                <NavigationTab
                    to="emergencyDetails"
                    urlParams={{ emergencyId }}
                >
                    {strings.emergencyTabDetails}
                </NavigationTab>
                <NavigationTab
                    to="emergencyReportsAndDocuments"
                    urlParams={{ emergencyId }}
                >
                    {strings.emergencyTabReports}
                </NavigationTab>
                {(emergencyResponse?.response_activity_count ?? 0) > 0 && (
                    <NavigationTab
                        to="emergencyActivities"
                        urlParams={{ emergencyId }}
                    >
                        {strings.emergencyTabActivities}
                    </NavigationTab>
                )}
                {(showSurgeTab) && (
                    <NavigationTab
                        to="emergencySurge"
                        urlParams={{ emergencyId }}
                    >
                        {strings.emergencyTabSurge}
                    </NavigationTab>
                )}
                {emergencyAdditionalTabs.map((tab) => (
                    <NavigationTab
                        key={tab.tabId}
                        to="emergencyAdditionalInfo"
                        urlParams={{
                            emergencyId,
                            tabId: tab.tabId,
                        }}
                        matchParam="tabId"
                    >
                        {tab.name}
                    </NavigationTab>
                ))}
            </NavigationTabList>
            <Outlet
                context={outletContext}
            />
        </Page>
    );
}

Component.displayName = 'Emergency';
