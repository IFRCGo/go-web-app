import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    CheckboxFillIcon,
    DownloadFillIcon,
} from '@ifrc-go/icons';
import {
    Container,
    Description,
    KeyFigureView,
    ListView,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    compareNumber,
    isDefined,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import TabPage from '#components/TabPage';
import useCountry from '#hooks/domain/useCountry';
import usePermissions from '#hooks/domain/usePermissions';
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
        isCountryPerAdmin,
        isSuperUser,
        isRegionPerAdmin,
    } = usePermissions();

    const countryDetails = useCountry({ id: Number(countryId) });
    const regionId = isDefined(countryDetails) ? Number(countryDetails?.region) : undefined;

    const isPerAdmin = isSuperUser
        || isCountryPerAdmin(Number(countryId))
        || isRegionPerAdmin(regionId);

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

    const {
        response: documentResponse,
        pending: documentResponsePending,
    } = useRequest({
        url: '/api/v2/country-document/',
        skip: isNotDefined(countryId),
        query: {
            country: isDefined(countryId) ? Number(countryId) : undefined,
            document_type: 'Our Strategic Plan',
            ordering: '-end_year',
        },
        preserveResponse: true,
    });

    const hasStrengthComponents = isDefined(strengthComponents) && strengthComponents.length > 0;
    const hasKeyDevelopmentComponents = isDefined(keyDevelopmentComponents)
        && keyDevelopmentComponents.length > 0;
    const perContentsDefined = hasStrengthComponents || hasKeyDevelopmentComponents;

    const hasCountryPlan = countryResponse?.has_country_plan;
    const pending = useDebouncedValue(countryPlanPending || perPending || documentResponsePending);

    return (
        <TabPage
            wikiLinkPathName="user_guide/Country_Pages#strategic-priorities"
            pending={pending}
            empty={!hasCountryPlan && !perContentsDefined}
        >
            <Description withCenteredContent>
                {strings.strategicPrioritiesDescription}
            </Description>
            {hasCountryPlan && isDefined(countryPlanResponse) && (
                <Container
                    filtered={false}
                    errored={false}
                    pending={false}
                    empty={false}
                    heading={strings.nsStrategicPrioritiesHeading}
                    footerActions={(
                        <TextOutput
                            label={strings.source}
                            value={strings.unifiedPlanning}
                            strongValue
                        />
                    )}
                    withHeaderBorder
                    withoutSpacingOpticalCorrection
                >
                    <ListView
                        layout="grid"
                        spacing="lg"
                    >
                        <ListView layout="block">
                            <ListView
                                withWrap
                                spacing="sm"
                            >
                                {(documentResponse?.results?.length ?? 0) > 0 && (
                                    <Link
                                        href={documentResponse?.results?.[0]?.url}
                                        external
                                        before={<DownloadFillIcon />}
                                        colorVariant="primary"
                                        styleVariant="outline"
                                    >
                                        {resolveToString(
                                            strings.strategicPlan,
                                            {
                                                year: documentResponse?.results?.[0]?.year_text,
                                            },
                                        )}
                                    </Link>
                                )}
                                {isDefined(countryPlanResponse.public_plan_file) && (
                                    <Link
                                        href={countryPlanResponse.public_plan_file}
                                        external
                                        before={<DownloadFillIcon />}
                                        colorVariant="primary"
                                        styleVariant="outline"
                                    >
                                        {strings.countryPlan}
                                    </Link>
                                )}
                                {isTruthyString(countryPlanResponse.internal_plan_file) && (
                                    <Link
                                        href={countryPlanResponse.internal_plan_file}
                                        external
                                        before={<DownloadFillIcon />}
                                        colorVariant="primary"
                                        styleVariant="outline"
                                    >
                                        {strings.countryPlanInternal}
                                    </Link>
                                )}
                            </ListView>
                            <ListView
                                layout="grid"
                                minGridColumnSize="6rem"
                            >
                                <KeyFigureView
                                    value={countryPlanResponse.requested_amount}
                                    label={strings.countryPlanKeyFigureRequestedAmount}
                                    valueType="number"
                                    valueOptions={{ compact: true }}
                                    withShadow
                                />
                                <KeyFigureView
                                    value={countryPlanResponse.people_targeted}
                                    label={strings.countryPlanPeopleTargeted}
                                    valueType="number"
                                    valueOptions={{ compact: true }}
                                    withShadow
                                />
                            </ListView>
                        </ListView>
                        <StrategicPrioritiesTable
                            priorityData={countryPlanResponse.strategic_priorities}
                        />
                    </ListView>
                </Container>
            )}
            {perContentsDefined && (
                <ListView
                    layout="grid"
                    spacing="lg"
                >
                    {hasStrengthComponents && (
                        <Container
                            empty={false}
                            errored={false}
                            filtered={false}
                            pending={false}
                            heading={strings.strengthsHeading}
                            withHeaderBorder
                        >
                            <ListView layout="grid">
                                {strengthComponents?.map(
                                    (strengthComponent) => {
                                        if (!isPerAdmin) {
                                            return (
                                                <Container
                                                    empty={false}
                                                    errored={false}
                                                    filtered={false}
                                                    pending={false}
                                                    key={strengthComponent.component}
                                                    className={styles.strengthComponent}
                                                    withPadding
                                                    withShadow
                                                    withBackground
                                                >
                                                    {strengthComponent?.component_details.title}
                                                </Container>
                                            );
                                        }

                                        return (
                                            <Container
                                                empty={false}
                                                errored={false}
                                                filtered={false}
                                                pending={false}
                                                heading={strengthComponent
                                                    ?.rating_details?.title}
                                                headingLevel={5}
                                                key={strengthComponent.component}
                                                withHeaderBorder
                                                headerIcons={(
                                                    <CheckboxFillIcon className={styles.icon} />
                                                )}
                                                className={styles.strengthComponent}
                                                withPadding
                                                withShadow
                                                withBackground
                                            >
                                                {strengthComponent?.component_details.title}
                                            </Container>
                                        );
                                    },
                                )}
                            </ListView>
                        </Container>
                    )}
                    {hasKeyDevelopmentComponents && (
                        <Container
                            empty={false}
                            errored={false}
                            filtered={false}
                            pending={false}
                            heading={strings.keyDevelopmentPrioritiesHeading}
                            withHeaderBorder
                        >
                            <ListView layout="grid">
                                {keyDevelopmentComponents?.map(
                                    (keyDevelopmentComponent) => {
                                        if (!isPerAdmin) {
                                            return (
                                                <Container
                                                    empty={false}
                                                    errored={false}
                                                    filtered={false}
                                                    pending={false}
                                                    key={keyDevelopmentComponent.component}
                                                    className={styles.priorityComponent}
                                                    withPadding
                                                    withShadow
                                                    withBackground
                                                >
                                                    {keyDevelopmentComponent
                                                        ?.component_details.title}
                                                </Container>
                                            );
                                        }
                                        return (
                                            <Container
                                                empty={false}
                                                errored={false}
                                                filtered={false}
                                                pending={false}
                                                heading={keyDevelopmentComponent
                                                    ?.rating_details?.title}
                                                headingLevel={5}
                                                key={keyDevelopmentComponent.component}
                                                withHeaderBorder
                                                headerIcons={(
                                                    <CheckboxFillIcon className={styles.icon} />
                                                )}
                                                className={styles.priorityComponent}
                                                withPadding
                                                withShadow
                                                withBackground
                                            >
                                                {keyDevelopmentComponent
                                                    ?.component_details.title}
                                            </Container>
                                        );
                                    },
                                )}
                            </ListView>
                        </Container>
                    )}
                </ListView>
            )}
        </TabPage>
    );
}

Component.displayName = 'CountryNsOverviewStrategicPriorities';
