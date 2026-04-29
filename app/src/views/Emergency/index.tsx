import {
    useContext,
    useMemo,
    useRef,
} from 'react';
import {
    Outlet,
    useParams,
} from 'react-router-dom';
import { PencilFillIcon } from '@ifrc-go/icons';
import {
    Breadcrumbs,
    Button,
    ButtonLayout,
    Container,
    KeyFigure,
    Label,
    ListView,
    Message,
    NavigationTabList,
    ProgressBar,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    isTruthyString,
    listToMap,
} from '@togglecorp/fujs';

import EmergencyOperationType from '#components/domain/EmergencyOperationType';
import Link from '#components/Link';
import NavigationTab from '#components/NavigationTab';
import Page from '#components/Page';
import { adminUrl } from '#config';
import DomainContext from '#contexts/domain';
import useAuth from '#hooks/domain/useAuth';
import usePermissions from '#hooks/domain/usePermissions';
import useRegion from '#hooks/domain/useRegion';
import useUserMe from '#hooks/domain/useUserMe';
import {
    getEmergencyMeta,
    getEmergencyOperationType,
    isDrefSummaryInProgress,
    STAGE_DREF_APPLICATION,
    STAGE_EMERGENCY_APPEAL,
    STAGE_FIELD_REPORT,
    STAGE_FINAL_REPORT,
    STAGE_OPERATIONAL_UPDATE,
} from '#utils/domain/emergency';
import { type EmergencyOutletContext } from '#utils/outletContext';
import { resolveUrl } from '#utils/resolveUrl';
import {
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';

import HeaderBackground from './HeaderBackground';
import TimelineProgressBar from './TimelineProgressBar';

import i18n from './i18n.json';

const DREF_SUMMARY_POLL_INTERVAL = 5000;
// a generation task killed mid-run leaves the row PROCESSING indefinitely
// (go-api documents this as PROCESSING_STALE_AFTER), so the poll needs a bound
const DREF_SUMMARY_POLL_TIMEOUT = 2 * 60 * 1000;

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

    const summaryPollDeadlineRef = useRef<number | undefined>(undefined);

    const {
        response: emergencyResponse,
        error: emergencyResponseError,
        pending: emergencyPending,
    } = useRequest({
        // FIXME: need to check if emergencyId can be ''
        skip: isNotDefined(emergencyId),
        url: '/api/v2/emergency/{id}/',
        pathVariables: {
            id: Number(emergencyId),
        },
        shouldPoll: (attempt) => {
            if (attempt.errored || !isDrefSummaryInProgress(attempt.value)) {
                summaryPollDeadlineRef.current = undefined;
                return -1;
            }

            if (isNotDefined(summaryPollDeadlineRef.current)) {
                summaryPollDeadlineRef.current = Date.now() + DREF_SUMMARY_POLL_TIMEOUT;
            }

            if (Date.now() >= summaryPollDeadlineRef.current) {
                return -1;
            }

            return DREF_SUMMARY_POLL_INTERVAL;
        },
    });

    // FIXME: this can be moved to EmergencySnippet component
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

    const showSurgeTab = (emergencyResponse?.surge_alerts_count ?? 0) > 0
        || (emergencyResponse?.active_deployments_count ?? 0) > 0;

    const pageTitle = (isDefined(emergencyResponse) && isDefined(emergencyResponse.name))
        ? resolveToString(
            strings.emergencyPageTitle,
            { emergencyName: emergencyResponse.name },
        ) : strings.emergencyPageTitleFallback;

    const meta = useMemo(() => (
        getEmergencyMeta(emergencyResponse)
    ), [emergencyResponse]);

    const operationType = useMemo(() => (
        getEmergencyOperationType(emergencyResponse)
    ), [emergencyResponse]);

    const outletContext = useMemo<EmergencyOutletContext>(
        () => ({
            emergencyResponse,
            emergencyAdditionalTabs,
            emergencyResponsePending: emergencyPending,
        }),
        [
            emergencyResponse,
            emergencyAdditionalTabs,
            emergencyPending,
        ],
    );

    const hasResponseActivity = isDefined(emergencyResponse?.response_activity_count)
        && emergencyResponse.response_activity_count > 0;

    if (isDefined(emergencyResponseError)) {
        // FIXME: we need to implement error display in Page itself
        return (
            <Page title={pageTitle}>
                <Message
                    errored
                    erroredTitle={strings.emergencyLoadFailureTitle}
                    erroredDescription={emergencyResponseError.value.messageForNotification}
                />
            </Page>
        );
    }

    // eslint-disable-next-line max-len
    const headerBackgroundUrl = emergencyResponse?.dref?.final_report_details?.cover_image_file?.file
        ?? emergencyResponse?.dref?.operational_update_details?.cover_image_file?.file
        ?? emergencyResponse?.dref?.cover_image_file?.file;

    const withBackgroundImage = isTruthyString(headerBackgroundUrl);

    return (
        <Page
            title={pageTitle}
            breadCrumbs={(
                <Breadcrumbs
                    colorVariant={withBackgroundImage ? 'text-on-dark' : undefined}
                >
                    <Link
                        to="home"
                        colorVariant={withBackgroundImage ? 'text-on-dark' : undefined}
                    >
                        {strings.home}
                    </Link>
                    <Link
                        to="emergencies"
                        colorVariant={withBackgroundImage ? 'text-on-dark' : undefined}
                    >
                        {strings.emergencies}
                    </Link>
                    <Link
                        to="emergencyOverview"
                        urlParams={{ emergencyId }}
                        colorVariant={withBackgroundImage ? 'text-on-dark' : undefined}
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
                        // FIXME(frozenhelium): go-api, saving an event from
                        // the admin panel with a changed severity level but an
                        // empty severity level update date responds with 500;
                        // the validation in EventAdmin.save_model should move
                        // to the admin form
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
            headingColorVariant={withBackgroundImage ? 'text-on-dark' : undefined}
            description={(
                <ListView
                    layout="block"
                    withCenteredContents
                >
                    <ListView withWrap>
                        <Link
                            to="regionsLayout"
                            urlParams={{
                                regionId: region?.id,
                            }}
                            withLinkIcon
                            colorVariant={withBackgroundImage ? 'text-on-dark' : undefined}
                        >
                            {region?.region_name}
                        </Link>
                        <Link
                            to="countriesLayout"
                            urlParams={{
                                countryId: country?.id,
                            }}
                            withLinkIcon
                            colorVariant={withBackgroundImage ? 'text-on-dark' : undefined}
                        >
                            {country?.name}
                        </Link>
                    </ListView>
                    {emergencyResponse?.stage === STAGE_FINAL_REPORT && (
                        <ButtonLayout
                            colorVariant="secondary"
                            styleVariant="filled"
                            textSize="sm"
                            readOnly
                            spacingOffset={-2}
                        >
                            {strings.emergencyOperationEnded}
                        </ButtonLayout>
                    )}
                </ListView>
            )}
            info={isDefined(emergencyResponse?.stage)
                && emergencyResponse.stage !== STAGE_FIELD_REPORT
                && (
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
                                    {isDefined(operationType) && (
                                        <EmergencyOperationType type={operationType} />
                                    )}
                                </Label>
                            </ListView>
                            <TimelineProgressBar
                                startDate={meta?.startDate}
                                endDate={meta?.endDate}
                            />
                        </Container>
                        <Container
                            withPadding
                            withShadow
                            withBackground
                        >
                            <Label>
                                {operationType === 'emergency-appeal'
                                    ? strings.emergencyFundingRequirementsLabel
                                    : strings.emergencyFundingLabel}
                            </Label>
                            {operationType === 'emergency-appeal' && (
                                <ProgressBar
                                    totalValue={meta?.amountRequested}
                                    value={meta?.amountFunded}
                                />
                            )}
                            <ListView withCenteredContents>
                                <KeyFigure
                                    value={meta?.amountRequested}
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
                                    value={meta?.peopleTargeted}
                                    valueType="number"
                                    valueOptions={{ compact: true }}
                                />
                            </ListView>
                        </Container>
                    </ListView>
                )}
            contentOriginalLanguage={emergencyResponse?.translation_module_original_language}
            headerBackground={withBackgroundImage && (
                <HeaderBackground
                    backgroundImageUrl={headerBackgroundUrl}
                />
            )}
        >
            <NavigationTabList>
                <NavigationTab
                    to="emergencyOverview"
                    urlParams={{ emergencyId }}
                >
                    {strings.emergencyTabDetails}
                </NavigationTab>
                {emergencyResponse?.stage === STAGE_FIELD_REPORT && (
                    <NavigationTab
                        to="emergencyActionsSummary"
                        urlParams={{ emergencyId }}
                    >
                        {strings.emergencyTabActionsSummary}
                    </NavigationTab>
                )}
                {(emergencyResponse?.stage === STAGE_DREF_APPLICATION
                    || emergencyResponse?.stage === STAGE_OPERATIONAL_UPDATE
                    || emergencyResponse?.stage === STAGE_FINAL_REPORT
                ) && (
                    <NavigationTab
                        to="emergencyOperationStrategy"
                        urlParams={{ emergencyId }}
                    >
                        {strings.emergencyTabOperationStrategy}
                    </NavigationTab>
                )}
                {isDefined(emergencyResponse) && emergencyResponse.stage !== STAGE_FIELD_REPORT && (
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
                {emergencyResponse?.stage === STAGE_EMERGENCY_APPEAL && hasResponseActivity && (
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
