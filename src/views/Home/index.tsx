import {
    useCallback,
    useState,
    useEffect,
    useRef,
} from 'react';
import {
    DrefIcon,
    AppealsIcon,
    FundingIcon,
    FundingCoverageIcon,
    CloseLineIcon,
    TargetedPopulationIcon,
} from '@ifrc-go/icons';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import Page from '#components/Page';
import Container from '#components/Container';
import IconButton from '#components/IconButton';
import BlockLoading from '#components/BlockLoading';
import InfoPopup from '#components/InfoPopup';
import KeyFigure from '#components/KeyFigure';
import HighlightedOperations from '#components/domain/HighlightedOperations';
import ActiveOperationMap from '#components/domain/ActiveOperationMap';
import AppealsTable from '#components/domain/AppealsTable';
import AppealsOverYearsChart from '#components/domain/AppealsOverYearsChart';
import OperationListItem, { type Props as OperationListItemProps } from '#components/OperationListItem';
import List from '#components/List';
import Pager from '#components/Pager';
import TextOutput from '#components/TextOutput';
import Link from '#components/Link';
import useAuth from '#hooks/domain/useAuth';
import useTranslation from '#hooks/useTranslation';
import { numericIdSelector } from '#utils/selectors';
import { getPercentage } from '#utils/common';
import useFilterState from '#hooks/useFilterState';
import { resolveToString } from '#utils/translation';
import { useRequest, type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type OperationsResponse = GoApiResponse<'/api/v2/event/'>;

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        page,
        setPage,
        limit,
        offset,
    } = useFilterState<object>({
        filter: {},
        pageSize: 5,
    });

    const { isAuthenticated } = useAuth();

    const {
        pending: aggregatedAppealPending,
        response: aggregatedAppealResponse,
    } = useRequest({
        url: '/api/v2/appeal/aggregated',
    });

    const {
        response: userResponse,
    } = useRequest({
        url: '/api/v2/user/me/',
    });

    const {
        error: subscribedEventsResponseError,
        response: subscribedEventsResponse,
        pending: subscribedEventsResponsePending,
        retrigger: updateSubscribedEventsResponse,
    } = useRequest({
        url: '/api/v2/event/',
        query: {
            limit,
            offset,
            is_subscribed: true,
        },
        preserveResponse: true,
    });

    const pending = aggregatedAppealPending;
    const eventList = subscribedEventsResponse?.results;

    const [
        presentationMode,
        setFullScreenMode,
    ] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    const handleFullScreenChange = useCallback(() => {
        setFullScreenMode(isDefined(document.fullscreenElement));
    }, [setFullScreenMode]);

    const handleFullScreenToggleClick = useCallback(() => {
        if (isNotDefined(containerRef.current)) {
            return;
        }
        const { current: viewerContainer } = containerRef;
        if (!presentationMode && isDefined(viewerContainer?.requestFullscreen)) {
            viewerContainer?.requestFullscreen();
        } else if (presentationMode && isDefined(document.exitFullscreen)) {
            document.exitFullscreen();
        }
    }, [presentationMode]);

    useEffect(() => {
        document.addEventListener('fullscreenchange', handleFullScreenChange);

        return (() => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
        });
    }, [handleFullScreenChange]);

    const infoBarElements = !pending && aggregatedAppealResponse && (
        <>
            <KeyFigure
                icon={<DrefIcon />}
                className={styles.keyFigure}
                value={aggregatedAppealResponse.active_drefs}
                info={(
                    <InfoPopup
                        title={strings.keyFiguresDrefTitle}
                        description={strings.keyFiguresDrefDescription}
                    />
                )}
                label={strings.homeKeyFiguresActiveDrefs}
            />
            <KeyFigure
                icon={<AppealsIcon />}
                className={styles.keyFigure}
                value={aggregatedAppealResponse.active_appeals}
                info={(
                    <InfoPopup
                        title={strings.keyFiguresActiveAppealsTitle}
                        description={strings.keyFigureActiveAppealDescription}
                    />
                )}
                label={strings.homeKeyFiguresActiveAppeals}
            />
            <KeyFigure
                icon={<FundingIcon />}
                className={styles.keyFigure}
                value={aggregatedAppealResponse.amount_requested_dref_included}
                compactValue
                label={strings.homeKeyFiguresBudget}
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
                label={strings.homeKeyFiguresAppealsFunding}
            />
            <KeyFigure
                icon={<TargetedPopulationIcon />}
                className={styles.keyFigure}
                value={aggregatedAppealResponse.target_population}
                compactValue
                label={strings.homeKeyFiguresTargetPop}
            />
        </>
    );

    const rendererParams = useCallback(
        (
            _: number,
            operation: NonNullable<OperationsResponse['results']>[number],
            i: number,
            data: unknown[],
        ): OperationListItemProps => ({
            eventItem: operation,
            updateSubscibedEvents: updateSubscribedEventsResponse,
            isLastItem: i === (data.length - 1),
        }),
        [updateSubscribedEventsResponse],
    );

    return (
        <>
            {isAuthenticated && (
                <Page
                    title={strings.homeTitle}
                    className={styles.home}
                    heading={resolveToString(
                        strings.homeUserNameHeading,
                        {
                            userName: userResponse?.username,
                        },
                    )}
                    mainSectionClassName={styles.content}
                    infoContainerClassName={styles.keyFigureList}
                    info={isAuthenticated && (
                        <div className={styles.operationsFollowing}>
                            <Container
                                className={styles.operationsCard}
                                heading={strings.homeOperationFollowingHeading}
                                withHeaderBorder
                                footerActions={(
                                    <Pager
                                        activePage={page}
                                        itemsCount={subscribedEventsResponse?.count ?? 0}
                                        maxItemsPerPage={limit}
                                        onActivePageChange={setPage}
                                    />
                                )}
                            >
                                <List
                                    className={styles.operationsList}
                                    data={eventList}
                                    pending={subscribedEventsResponsePending}
                                    errored={isDefined(subscribedEventsResponseError)}
                                    filtered={false}
                                    keySelector={numericIdSelector}
                                    renderer={OperationListItem}
                                    rendererParams={rendererParams}
                                />
                            </Container>
                            <Container
                                className={styles.operationsCard}
                                heading={strings.homeQuickLinksTitle}
                                childrenContainerClassName={styles.quickCard}
                            >
                                <TextOutput
                                    label={strings.homeYourCountryLabel}
                                    value={userResponse?.user_countries_regions?.map((country) => (
                                        <Link
                                            to="countriesLayout"
                                            urlParams={{
                                                countryId: country.country_details.id,
                                            }}
                                            withLinkIcon
                                        >
                                            {country.country_details.name}
                                        </Link>
                                    ))}
                                    strongValue
                                />
                                <TextOutput
                                    label={strings.homeFieldReportLabel}
                                    value={(
                                        <Link
                                            to="fieldReportFormNew"
                                            withLinkIcon
                                        >
                                            {strings.homeCreateFieldReport}
                                        </Link>
                                    )}
                                    strongValue
                                />
                                <TextOutput
                                    label={strings.homeYourRegionLabel}
                                    value={userResponse?.user_countries_regions?.map((region) => (
                                        <Link
                                            to="regionsLayout"
                                            withLinkIcon
                                            urlParams={{
                                                regionId: region.country_details.region,
                                            }}
                                        >
                                            {region.country_details.region_details.name}
                                        </Link>
                                    ))}
                                    strongValue
                                />
                                <TextOutput
                                    label={strings.homeFlashUpdateLabel}
                                    value={(
                                        <Link
                                            to="flashUpdateFormNew"
                                            withLinkIcon
                                        >
                                            {strings.homeCreateFlashUpdate}
                                        </Link>
                                    )}
                                    strongValue
                                />
                            </Container>
                            <Container
                                className={styles.loggedInHome}
                                headerClassName={styles.header}
                                heading={strings.homeHeading}
                                headingLevel={1}
                                headerDescription={strings.homeDescription}
                                childrenContainerClassName={styles.keyFigureList}
                            >

                                {pending && <BlockLoading />}
                                {infoBarElements}
                            </Container>
                        </div>
                    )}
                >
                    <HighlightedOperations variant="global" />
                    <ActiveOperationMap
                        variant="global"
                        onPresentationModeButtonClick={handleFullScreenToggleClick}
                        bbox={undefined}
                    />
                    <AppealsTable variant="global" />
                    <AppealsOverYearsChart />
                    <div
                        className={_cs(presentationMode && styles.presentationMode)}
                        ref={containerRef}
                    >
                        {presentationMode && (
                            <Container
                                heading={strings.fullScreenHeading}
                                actions={(
                                    <IconButton
                                        name={undefined}
                                        onClick={handleFullScreenToggleClick}
                                        title={strings.homeIconButtonLabel}
                                        variant="secondary"
                                        ariaLabel={strings.homeIconButtonLabel}
                                    >
                                        <CloseLineIcon />
                                    </IconButton>
                                )}
                                headerDescriptionContainerClassName={styles.keyFigureList}
                                headerDescription={infoBarElements}
                            >
                                <ActiveOperationMap
                                    variant="global"
                                    bbox={undefined}
                                    presentationMode
                                />
                            </Container>
                        )}
                    </div>
                </Page>
            )}
            <Page
                title={strings.homeTitle}
                className={styles.home}
                heading={strings.homeHeading}
                description={strings.homeDescription}
                mainSectionClassName={styles.content}
                infoContainerClassName={styles.keyFigureList}
                info={(
                    <>
                        {pending && <BlockLoading />}
                        {infoBarElements}
                    </>
                )}
            >
                <HighlightedOperations variant="global" />
                <ActiveOperationMap
                    variant="global"
                    onPresentationModeButtonClick={handleFullScreenToggleClick}
                    bbox={undefined}
                />
                <AppealsTable variant="global" />
                <AppealsOverYearsChart />
                <div
                    className={_cs(presentationMode && styles.presentationMode)}
                    ref={containerRef}
                >
                    {presentationMode && (
                        <Container
                            heading={strings.fullScreenHeading}
                            actions={(
                                <IconButton
                                    name={undefined}
                                    onClick={handleFullScreenToggleClick}
                                    title={strings.homeIconButtonLabel}
                                    variant="secondary"
                                    ariaLabel={strings.homeIconButtonLabel}
                                >
                                    <CloseLineIcon />
                                </IconButton>
                            )}
                            headerDescriptionContainerClassName={styles.keyFigureList}
                            headerDescription={infoBarElements}
                        >
                            <ActiveOperationMap
                                variant="global"
                                bbox={undefined}
                                presentationMode
                            />
                        </Container>
                    )}
                </div>
            </Page>
        </>
    );
}

Component.displayName = 'Home';
