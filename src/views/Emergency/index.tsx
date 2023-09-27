import { useMemo, useContext } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import {
    FundingIcon,
    FundingCoverageIcon,
    TargetedPopulationIcon,
    PencilFillIcon,
} from '@ifrc-go/icons';
import {
    isNotDefined,
    isDefined,
    listToMap,
} from '@togglecorp/fujs';

import DomainContext from '#contexts/domain';
import Breadcrumbs from '#components/Breadcrumbs';
import Page from '#components/Page';
import Button from '#components/Button';
import NavigationTabList from '#components/NavigationTabList';
import KeyFigure from '#components/KeyFigure';
import Link from '#components/Link';
import NavigationTab from '#components/NavigationTab';
import useRegion from '#hooks/domain/useRegion';
import useAuth from '#hooks/domain/useAuth';
import useUserMe from '#hooks/domain/useUserMe';
import useTranslation from '#hooks/useTranslation';
import {
    useRequest,
    useLazyRequest,
} from '#utils/restRequest';
import { sumSafe } from '#utils/common';
import { resolveUrl } from '#utils/resolveUrl';
import { type EmergencyOutletContext } from '#utils/outletContext';
import { adminUrl } from '#config';

import i18n from './i18n.json';
import styles from './styles.module.css';

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

        const tabOneTitle = emergencyResponse.tab_one_title || 'Tab One';
        const tabTwoTitle = emergencyResponse.tab_two_title || 'Tab Two';
        const tabThreeTitle = emergencyResponse.tab_three_title || 'Tab Three';

        return [
            {
                name: tabOneTitle,
                routeName: 'emergencyAdditionalInfoOne' as const,
                infoPageId: 1 as const,
                snippets: emergencySnippetResponse.results.filter((snippet) => snippet.tab === 1),
            },
            {
                name: tabTwoTitle,
                routeName: 'emergencyAdditionalInfoTwo' as const,
                infoPageId: 2 as const,
                snippets: emergencySnippetResponse.results.filter((snippet) => snippet.tab === 2),
            },
            {
                name: tabThreeTitle,
                routeName: 'emergencyAdditionalInfoThree' as const,
                infoPageId: 3 as const,
                snippets: emergencySnippetResponse.results.filter((snippet) => snippet.tab === 3),
            },
        ].filter((tabInfo) => tabInfo.snippets.length > 0);
    }, [emergencyResponse, emergencySnippetResponse]);

    const outletContext = useMemo<EmergencyOutletContext>(
        () => ({
            emergencyResponse,
            emergencyAdditionalTabs,
        }),
        [emergencyResponse, emergencyAdditionalTabs],
    );

    return (
        <Page
            className={styles.emergency}
            title={strings.emergencyPageTitle}
            breadCrumbs={(
                <Breadcrumbs>
                    <Link
                        to="home"
                    >
                        {strings.home}
                    </Link>
                    <Link
                        to="emergencies"
                    >
                        {strings.emergencies}
                    </Link>
                    <Link
                        to="emergencyDetails"
                        urlParams={{ emergencyId }}
                    >
                        {emergencyResponse?.name}
                    </Link>
                </Breadcrumbs>
            )}
            actions={isAuthenticated && (
                <>
                    {/* <WikiLink href="" /> */}
                    <Button
                        name={Number(emergencyId)}
                        variant="secondary"
                        disabled={subscriptionPending}
                        onClick={isSubscribed ? triggerRemoveSubscription : triggerAddSubscription}
                    >
                        {isSubscribed ? strings.emergencyUnfollow : strings.emergencyFollow}
                    </Button>
                    <Link
                        external
                        href={resolveUrl(adminUrl, `api/event/${emergencyId}/change/`)}
                        variant="secondary"
                        icons={<PencilFillIcon />}
                        disabled={isPending}
                    >
                        {strings.emergencyEdit}
                    </Link>
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
                    <KeyFigure
                        icon={<TargetedPopulationIcon />}
                        className={styles.keyFigure}
                        value={peopleTargeted}
                        compactValue
                        label={strings.emergencyPeopleTargetedLabel}
                    />
                    <KeyFigure
                        icon={<FundingIcon />}
                        className={styles.keyFigure}
                        value={fundingRequirements}
                        compactValue
                        label={strings.emergencyFundingRequirementsLabel}
                    />
                    <KeyFigure
                        icon={<FundingCoverageIcon />}
                        className={styles.keyFigure}
                        value={funding}
                        compactValue
                        label={strings.emergencyFundingLabel}
                    />
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
                <NavigationTab
                    to="emergencyActivities"
                    urlParams={{ emergencyId }}
                >
                    {strings.emergencyTabActivities}
                </NavigationTab>
                <NavigationTab
                    to="emergencySurge"
                    urlParams={{ emergencyId }}
                >
                    {strings.emergencyTabSurge}
                </NavigationTab>
                {emergencyAdditionalTabs.map((tab) => (
                    <NavigationTab
                        key={tab.routeName}
                        to={tab.routeName}
                        urlParams={{
                            emergencyId,
                        }}
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
