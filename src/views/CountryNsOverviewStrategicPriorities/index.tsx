import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    DownloadLineIcon,
    CheckboxFillIcon,
} from '@ifrc-go/icons';
import {
    isDefined,
    isNotDefined,
    listToMap,
    isTruthyString,
} from '@togglecorp/fujs';

import KeyFigure from '#components/KeyFigure';
import Link from '#components/Link';
import BlockLoading from '#components/BlockLoading';
import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';
import { resolveToString } from '#utils/translation';
import { useRequest } from '#utils/restRequest';
import { type CountryOutletContext } from '#utils/outletContext';

import StrategicPrioritiesTable from './StrategicPrioritiesTable';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryId, countryResponse } = useOutletContext<CountryOutletContext>();
    const strings = useTranslation(i18n);

    const {
        pending: latestPerPending,
        response: latestPerResponse,
        // error: latestPerResponseError,
    } = useRequest({
        skip: isNotDefined(countryId),
        url: '/api/v2/latest-per-overview/',
        query: { country_id: Number(countryId) },
    });

    // const countryHasNoPer = latestPerResponse?.results?.length === 0;
    const perId = latestPerResponse?.results?.[0]?.id;

    const {
        pending: perProcessStatusPending,
        response: processStatusResponse,
    } = useRequest({
        skip: isNotDefined(perId),
        url: '/api/v2/per-process-status/{id}/',
        pathVariables: {
            id: Number(perId),
        },
    });

    const {
        pending: assessmentResponsePending,
        response: assessmentResponse,
    } = useRequest({
        skip: isNotDefined(processStatusResponse?.assessment),
        url: '/api/v2/per-assessment/{id}/',
        pathVariables: {
            id: Number(processStatusResponse?.assessment),
        },
    });

    const {
        pending: prioritizationResponsePending,
        response: prioritizationResponse,
    } = useRequest({
        skip: isNotDefined(processStatusResponse?.prioritization),
        url: '/api/v2/per-prioritization/{id}/',
        pathVariables: {
            id: Number(processStatusResponse?.prioritization),
        },
    });

    const perPending = assessmentResponsePending
        || perProcessStatusPending
        || prioritizationResponsePending
        || latestPerPending;

    const componentMap = useMemo(
        () => {
            if (isNotDefined(assessmentResponse)) {
                return undefined;
            }

            const componentResponses = assessmentResponse.area_responses?.map(
                (areaResponse) => (
                    areaResponse.component_responses
                ),
            ).flat().filter(isDefined);

            return listToMap(
                componentResponses,
                (componentResponse) => componentResponse?.component,

            );
        },
        [assessmentResponse],
    );

    const strengthComponents = useMemo(
        () => {
            if (isNotDefined(assessmentResponse)) {
                return undefined;
            }

            const componentResponses = assessmentResponse.area_responses?.map(
                (areaResponse) => (
                    areaResponse.component_responses
                ),
            ).flat().filter(isDefined);

            const STRENGTH_THRESHOLD = 4.5;

            return componentResponses?.filter(
                (componentResponse) => isDefined(componentResponse)
                    && isDefined(componentResponse.rating)
                    && componentResponse.rating >= STRENGTH_THRESHOLD,
            );
        },
        [assessmentResponse],
    );

    const {
        pending: countryPlanPending,
        response: countryPlanResponse,
    } = useRequest({
        skip: isNotDefined(countryId) || !countryResponse?.has_country_plan,
        url: '/api/v2/country-plan/{country}/',
        pathVariables: {
            country: Number(countryId),
        },
    });

    return (
        <div className={styles.countryNsOverviewStrategicPriorities}>
            {perPending && (
                <BlockLoading />
            )}
            <Container
                className={styles.countryNsOverviewStrategicPriorities}
                heading={strings.nsStrategicPrioritiesHeading}
                withHeaderBorder
            >
                {countryPlanPending && (
                    <BlockLoading />
                )}
                {isDefined(countryPlanResponse) && (
                    <div className={styles.countryPlan}>
                        <div className={styles.downloadLinksAndKeyFigures}>
                            <div className={styles.countryPlanDownloadLink}>
                                {isDefined(countryPlanResponse.public_plan_file) && (
                                    <Link
                                        variant="secondary"
                                        href={countryPlanResponse.public_plan_file}
                                        external
                                        className={styles.downloadLink}
                                        icons={<DownloadLineIcon className={styles.icon} />}
                                    >
                                        {resolveToString(
                                            strings.countryPlanDownloadPlan,
                                            { countryName: countryResponse?.name ?? '--' },
                                        )}
                                    </Link>
                                )}
                                {isTruthyString(countryPlanResponse.internal_plan_file) && (
                                    <Link
                                        variant="secondary"
                                        href={countryPlanResponse.internal_plan_file}
                                        external
                                        className={styles.downloadLink}
                                        icons={<DownloadLineIcon className={styles.icon} />}
                                    >
                                        {resolveToString(
                                            strings.countryPlanDownloadPlanInternal,
                                            { countryName: countryResponse?.name ?? '--' },
                                        )}
                                    </Link>
                                )}
                            </div>
                            <div className={styles.keyFigures}>
                                <KeyFigure
                                    className={styles.keyFigure}
                                    value={countryPlanResponse.requested_amount}
                                    label={strings.countryPlanKeyFigureRequestedAmount}
                                    compactValue
                                />
                                <KeyFigure
                                    className={styles.keyFigure}
                                    value={countryPlanResponse.people_targeted}
                                    label={strings.countryPlanPeopleTargeted}
                                    compactValue
                                />
                            </div>
                        </div>
                        <StrategicPrioritiesTable
                            className={styles.strategicPriorityTable}
                            priorityData={countryPlanResponse.strategic_priorities}
                        />
                    </div>
                )}
            </Container>
            {isDefined(strengthComponents) && (
                <Container
                    heading={strings.strengthsHeading}
                    withHeaderBorder
                    contentViewType="grid"
                    numPreferredGridContentColumns={5}
                >
                    {strengthComponents?.map(
                        (strengthComponent) => (
                            <Container
                                heading={strengthComponent?.component_details.title}
                                headingLevel={5}
                                key={strengthComponent.component}
                                withHeaderBorder
                                withInternalPadding
                                icons={<CheckboxFillIcon className={styles.icon} />}
                                withoutWrapInHeading
                                className={styles.strengthComponent}
                            >
                                {strengthComponent?.rating_details.title}
                            </Container>
                        ),
                    )}
                </Container>
            )}
            {isDefined(prioritizationResponse) && (
                <Container
                    heading={strings.keyDevelopmentPrioritiesHeading}
                    withHeaderBorder
                    contentViewType="grid"
                    numPreferredGridContentColumns={5}
                >
                    {prioritizationResponse?.prioritized_action_responses?.map(
                        (prioritizedAction) => (
                            <Container
                                key={prioritizedAction.id}
                                heading={prioritizedAction.component_details.title}
                                headingLevel={5}
                                withHeaderBorder
                                withInternalPadding
                                icons={<CheckboxFillIcon className={styles.icon} />}
                                withoutWrapInHeading
                                className={styles.priorityComponent}
                            >
                                {componentMap?.[prioritizedAction.component]?.rating_details?.title}
                            </Container>
                        ),
                    )}
                </Container>
            )}
        </div>
    );
}

Component.displayName = 'CountryNsOverviewStrategicPriorities';
