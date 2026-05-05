import {
    useContext,
    useMemo,
} from 'react';
import {
    Outlet,
    useParams,
} from 'react-router-dom';
import { PencilFillIcon } from '@ifrc-go/icons';
import {
    Breadcrumbs,
    Button,
    Container,
    KeyFigure,
    Label,
    ListView,
    NavigationTabList,
    ProgressBar,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    resolveToString,
    sumSafe,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import { APPEAL_TYPE_DREF } from '#components/domain/ActiveOperationMap/utils';
import Link from '#components/Link';
import NavigationTab from '#components/NavigationTab';
import Page from '#components/Page';
import { adminUrl } from '#config';
import DomainContext from '#contexts/domain';
import useAuth from '#hooks/domain/useAuth';
import usePermissions from '#hooks/domain/usePermissions';
import useRegion from '#hooks/domain/useRegion';
import useUserMe from '#hooks/domain/useUserMe';
import { DREF_TYPE_IMMINENT } from '#utils/constants';
import { getLatestAppeal } from '#utils/domain/emergency';
import { type EmergencyOutletContext } from '#utils/outletContext';
import { resolveUrl } from '#utils/resolveUrl';
import {
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';

import TimelineProgressBar from './TimelineProgressBar';

import i18n from './i18n.json';

/*
function getRouteIdFromName(text: string) {
    return text.toLowerCase().trim().split(' ').join('-');
}
*/

/** @knipignore */
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

    const showSurgeTab = (surgeAlertsResponse?.count ?? 0) > 0
        || (emergencyResponse?.active_deployments ?? 0) > 0;

    const pageTitle = (isDefined(emergencyResponse) && isDefined(emergencyResponse.name))
        ? resolveToString(
            strings.emergencyPageTitle,
            { emergencyName: emergencyResponse.name },
        ) : strings.emergencyPageTitleFallback;

    const latestAppeal = getLatestAppeal(emergencyResponse?.appeals);

    const emergencyStage = useMemo(() => {
        if (!emergencyResponse) {
            return undefined;
        }

        const {
            appeals,
            field_reports,
        } = emergencyResponse;

        const hasAppeals = isDefined(appeals) && appeals.length !== 0;

        const hasFieldReports = isDefined(field_reports) && field_reports.length !== 0;

        if (!hasAppeals && !hasFieldReports) {
            return undefined;
        }

        if (!hasAppeals) {
            return 'field-report';
        }

        if (isNotDefined(latestAppeal)) {
            return undefined;
        }

        // FIXME(frozenhelium): add more stages
        if (latestAppeal?.atype === APPEAL_TYPE_DREF) {
            return 'dref';
        }

        return 'emergency-appeal';
    }, [emergencyResponse, latestAppeal]);

    const { response: activeDrefResponse } = useRequest({
        skip: emergencyStage !== 'dref' || isNotDefined(latestAppeal?.code),
        url: '/api/v2/active-dref/',
        query: isDefined(latestAppeal?.code) ? ({
            appeal_code: latestAppeal.code,
        }) : undefined,
    });

    const currentDref = activeDrefResponse?.results?.[0];
    const drefStage = useMemo(() => {
        if (isNotDefined(currentDref)) {
            return undefined;
        }

        if (currentDref.has_final_report) {
            return 'final-report';
        }

        if (currentDref.has_ops_update) {
            return 'ops-update';
        }

        return 'application';
    }, [currentDref]);

    const { response: drefApplicationResponse } = useRequest({
        skip: isNotDefined(currentDref?.id),
        url: '/api/v2/dref/{id}/',
        pathVariables: isDefined(currentDref?.id) ? ({
            id: String(currentDref.id),
        }) : undefined,
    });

    // FIXME(frozenhelium): verify this logic
    const latestOpsUpdate = currentDref?.operational_update_details?.[0];

    const { response: drefOpsUpdateResponse } = useRequest({
        skip: isNotDefined(currentDref?.id) || drefStage === 'application' || isNotDefined(latestOpsUpdate?.id),
        url: '/api/v2/dref-op-update/{id}/',
        pathVariables: isDefined(latestOpsUpdate?.id) ? ({
            id: String(latestOpsUpdate.id),
        }) : undefined,
    });

    const finalReport = currentDref?.final_report_details;
    const { response: drefFinalReportResponse } = useRequest({
        skip: isNotDefined(currentDref?.id)
            || drefStage !== 'final-report'
            || isNotDefined(finalReport?.id),
        url: '/api/v2/dref-final-report/{id}/',
        pathVariables: isDefined(finalReport?.id) ? ({
            id: String(finalReport.id),
        }) : undefined,
    });

    const outletContext = useMemo<EmergencyOutletContext>(
        () => ({
            emergencyResponse,
            emergencyAdditionalTabs,
            emergencyStage,
            emergencyResponsePending: emergencyPending,
            activeDrefOperation: currentDref,
            drefStage,
            drefApplication: drefApplicationResponse,
            drefOpsUpdate: drefOpsUpdateResponse,
            drefFinalReport: drefFinalReportResponse,
        }),
        [
            emergencyResponse,
            emergencyAdditionalTabs,
            emergencyStage,
            emergencyPending,
            currentDref,
            drefStage,
            drefApplicationResponse,
            drefOpsUpdateResponse,
            drefFinalReportResponse,
        ],
    );

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

    const hasResponseActivity = isDefined(emergencyResponse?.response_activity_count)
        && emergencyResponse.response_activity_count > 0;

    const operationTypeLabel = useMemo(() => {
        if (latestAppeal?.atype !== APPEAL_TYPE_DREF) {
            return latestAppeal?.atype_display;
        }

        if (drefStage === 'application') {
            if (drefApplicationResponse?.type_of_dref === DREF_TYPE_IMMINENT) {
                return strings.operationLabelImminentDref;
            }

            return strings.operationLabelDref;
        }

        if (drefStage === 'ops-update') {
            return strings.operationLabelOpsUpdate;
        }

        if (drefStage === 'final-report') {
            return strings.operationLabelFinalReport;
        }

        return '--';
    }, [latestAppeal, drefStage, drefApplicationResponse, strings]);

    return (
        <Page
            title={pageTitle}
            breadCrumbs={(
                <Breadcrumbs>
                    <Link to="home">
                        {strings.home}
                    </Link>
                    <Link to="emergencies">
                        {strings.emergencies}
                    </Link>
                    <Link
                        to="emergencyOverview"
                        urlParams={{ emergencyId }}
                    >
                        {emergencyResponse?.name}
                    </Link>
                </Breadcrumbs>
            )}
            actions={isAuthenticated && (
                <>
                    <Button
                        name={Number(emergencyId)}
                        disabled={subscriptionPending}
                        onClick={isSubscribed ? triggerRemoveSubscription : triggerAddSubscription}
                    >
                        {isSubscribed ? strings.emergencyUnfollow : strings.emergencyFollow}
                    </Button>
                    {!isGuestUser && (
                        <Link
                            external
                            href={resolveUrl(adminUrl, `api/event/${emergencyId}/change/`)}
                            colorVariant="primary"
                            styleVariant="outline"
                            before={<PencilFillIcon />}
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
            info={emergencyStage !== 'field-report' && (
                <ListView
                    layout="grid"
                    numPreferredGridColumns={3}
                >
                    <Container
                        withPadding
                        withShadow
                        withBackground
                    >
                        <ListView withSpaceBetweenContents>
                            <Label>
                                {strings.operationTimelineLabel}
                            </Label>
                            <Label strong>
                                {operationTypeLabel}
                            </Label>
                        </ListView>
                        <TimelineProgressBar
                            startDate={latestAppeal?.start_date}
                            endDate={latestAppeal?.end_date}
                        />
                    </Container>
                    <Container
                        withPadding
                        withShadow
                        withBackground
                    >
                        <Label>
                            {strings.emergencyFundingRequirementsLabel}
                        </Label>
                        <ProgressBar
                            totalValue={fundingRequirements}
                            value={funding}
                        />
                        <ListView withCenteredContents>
                            <KeyFigure
                                value={fundingRequirements}
                                valueType="number"
                                valueOptions={{ compact: true }}
                            />
                        </ListView>
                    </Container>
                    <Container
                        withPadding
                        withShadow
                        withBackground
                    >
                        <Label>
                            {strings.emergencyPeopleTargetedLabel}
                        </Label>
                        <ListView withCenteredContents>
                            <KeyFigure
                                value={peopleTargeted}
                                valueType="number"
                                valueOptions={{ compact: true }}
                            />
                        </ListView>
                    </Container>
                </ListView>
            )}
            contentOriginalLanguage={emergencyResponse?.translation_module_original_language}
            headerBackgroundUrl={drefApplicationResponse?.cover_image_file?.file}
        >
            <NavigationTabList>
                <NavigationTab
                    to="emergencyOverview"
                    urlParams={{ emergencyId }}
                >
                    {strings.emergencyTabDetails}
                </NavigationTab>
                {emergencyStage === 'field-report' && (
                    <NavigationTab
                        to="emergencyActionsSummary"
                        urlParams={{ emergencyId }}
                    >
                        {strings.emergencyTabActionsSummary}
                    </NavigationTab>
                )}
                {emergencyStage === 'dref' && (
                    <NavigationTab
                        to="emergencyOperationStrategy"
                        urlParams={{ emergencyId }}
                    >
                        {strings.emergencyTabOperationStrategy}
                    </NavigationTab>
                )}
                {(emergencyStage === 'emergency-appeal' || emergencyStage === 'dref') && (
                    <>
                        <NavigationTab
                            to="emergencyDocuments"
                            urlParams={{ emergencyId }}
                        >
                            {strings.emergencyTabReports}
                        </NavigationTab>
                        {showSurgeTab && (
                            <NavigationTab
                                to="emergencySurge"
                                urlParams={{ emergencyId }}
                            >
                                {strings.emergencyTabSurge}
                            </NavigationTab>
                        )}
                    </>
                )}
                {emergencyStage === 'emergency-appeal' && hasResponseActivity && (
                    <NavigationTab
                        to="emergencyActivities"
                        urlParams={{ emergencyId }}
                    >
                        {strings.emergencyTabActivities}
                    </NavigationTab>
                )}
                <NavigationTab
                    to="emergencyBackground"
                    urlParams={{ emergencyId }}
                >
                    {strings.emergencyTabBackground}
                </NavigationTab>
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
            <Outlet context={outletContext} />
        </Page>
    );
}

Component.displayName = 'Emergency';
