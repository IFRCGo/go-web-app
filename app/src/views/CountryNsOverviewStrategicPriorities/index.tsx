import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    CheckboxFillIcon,
    DownloadLineIcon,
} from '@ifrc-go/icons';
import {
    Container,
    KeyFigure,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    compareNumber,
    isDefined,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import useDebouncedValue from '#hooks/useDebouncedValue';
import { type CountryOutletContext } from '#utils/outletContext';
import { useRequest } from '#utils/restRequest';

import StrategicPrioritiesTable from './StrategicPrioritiesTable';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryId, countryResponse } = useOutletContext<CountryOutletContext>();
    const strings = useTranslation(i18n);

    const {
        pending: publicPerStatsPending,
        response: publicPerStatsResponse,
    } = useRequest({
        skip: isNotDefined(countryId),
        url: '/api/v2/public-per-stats/',
        query: isDefined(countryId) ? { country: [Number(countryId)] } : undefined,
    });

    // NOTE: we assume the public-per-overview is ordered by assessment date
    const perId = publicPerStatsResponse?.results?.[0]?.id;

    const {
        pending: perProcessStatusPending,
        response: perProcessStatusResponse,
    } = useRequest({
        skip: isNotDefined(perId),
        url: '/api/v2/public-per-process-status/{id}/',
        pathVariables: {
            id: Number(perId),
        },
    });

    const {
        pending: assessmentResponsePending,
        response: assessmentResponse,
    } = useRequest({
        skip: isNotDefined(perProcessStatusResponse?.assessment),
        url: '/api/v2/public-per-assessment/{id}/',
        pathVariables: {
            id: Number(perProcessStatusResponse?.assessment),
        },
    });

    const perPending = assessmentResponsePending
        || perProcessStatusPending
        || publicPerStatsPending;

    const strengthComponents = useMemo(
        () => {
            if (
                isNotDefined(assessmentResponse)
                || isNotDefined(assessmentResponse.area_responses)
            ) {
                return undefined;
            }

            const componentResponses = assessmentResponse.area_responses.map(
                (areaResponse) => (
                    areaResponse.component_responses
                ),
            ).flat();

            const componentResponsesWithDefinedRating = componentResponses.map(
                (componentResponse) => {
                    if (
                        isNotDefined(componentResponse)
                        || isNotDefined(componentResponse.rating_details)
                    ) {
                        return undefined;
                    }

                    return {
                        ...componentResponse,
                        rating_details: componentResponse.rating_details,
                    };
                },
            ).filter(isDefined);

            return componentResponsesWithDefinedRating.sort(
                (a, b) => compareNumber(a.rating_details.value, b.rating_details.value, -1),
            ).slice(0, 5);
        },
        [assessmentResponse],
    );

    const keyDevelopmentComponents = useMemo(
        () => {
            if (
                isNotDefined(assessmentResponse)
                || isNotDefined(assessmentResponse.area_responses)
            ) {
                return undefined;
            }

            const componentResponses = assessmentResponse.area_responses.map(
                (areaResponse) => (
                    areaResponse.component_responses
                ),
            ).flat().filter(isDefined).sort(
                (a, b) => compareNumber(a?.rating_details?.value, b?.rating_details?.value),
            );

            return componentResponses.slice(0, 5);
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

    const hasStrengthComponents = isDefined(strengthComponents) && strengthComponents.length > 0;
    const hasKeyDevelopmentComponents = isDefined(keyDevelopmentComponents)
        && keyDevelopmentComponents.length > 0;
    const perContentsDefined = hasStrengthComponents || hasKeyDevelopmentComponents;

    const hasCountryPlan = countryResponse?.has_country_plan;
    const pending = useDebouncedValue(countryPlanPending || perPending);

    return (
        <Container
            className={styles.strategicPriorities}
            childrenContainerClassName={styles.countryNsOverviewStrategicPriorities}
            headerDescription={strings.strategicPrioritiesDescription}
            withCenteredHeaderDescription
            pending={pending}
            empty={!pending && !hasCountryPlan && !perContentsDefined}
            contentViewType="vertical"
            spacing="loose"
        >
            {hasCountryPlan && isDefined(countryPlanResponse) && (
                <Container
                    childrenContainerClassName={styles.countryPlanContent}
                    heading={strings.nsStrategicPrioritiesHeading}
                    footerActions={(
                        <TextOutput
                            label={strings.source}
                            value={strings.unifiedPlanning}
                            strongValue
                        />
                    )}
                    withHeaderBorder
                >
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
                                    {strings.countryPlan}
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
                                    {strings.countryPlanInternal}
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
                </Container>
            )}
            {perContentsDefined && (
                <div className={styles.perComponents}>
                    {hasStrengthComponents && (
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
                                        {strengthComponent?.rating_details?.title}
                                    </Container>
                                ),
                            )}
                        </Container>
                    )}
                    {hasKeyDevelopmentComponents && (
                        <Container
                            heading={strings.keyDevelopmentPrioritiesHeading}
                            withHeaderBorder
                            contentViewType="grid"
                            numPreferredGridContentColumns={5}
                        >
                            {keyDevelopmentComponents?.map(
                                (keyDevelopmentComponent) => (
                                    <Container
                                        heading={keyDevelopmentComponent?.component_details.title}
                                        headingLevel={5}
                                        key={keyDevelopmentComponent.component}
                                        withHeaderBorder
                                        withInternalPadding
                                        icons={<CheckboxFillIcon className={styles.icon} />}
                                        withoutWrapInHeading
                                        className={styles.priorityComponent}
                                    >
                                        {keyDevelopmentComponent?.rating_details?.title}
                                    </Container>
                                ),
                            )}
                        </Container>
                    )}
                </div>
            )}
        </Container>
    );
}

Component.displayName = 'CountryNsOverviewStrategicPriorities';
