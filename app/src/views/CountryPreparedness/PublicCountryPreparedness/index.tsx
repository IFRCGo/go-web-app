import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeftLineIcon } from '@ifrc-go/icons';
import {
    Container,
    Label,
    ListView,
    Message,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    compareNumber,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import TabPage from '#components/TabPage';
import { getFormattedComponentName } from '#utils/domain/per';
import { useGoRequest } from '#utils/restRequest';

import i18n from './i18n.json';

function PublicCountryPreparedness() {
    const strings = useTranslation(i18n);

    const { perId, countryId } = useParams<{ perId: string, countryId: string }>();

    const {
        pending: perStatsResponsePending,
        response: perStatsResponse,
    } = useGoRequest({
        skip: isNotDefined(countryId),
        url: '/api/v2/public-per-stats/',
        query: isDefined(countryId) && isDefined(perId) ? {
            country: [Number(countryId)],
            id: Number(perId),
        } : undefined,
    });

    const {
        pending: processStatusPending,
        response: processStatusResponse,
    } = useGoRequest({
        skip: isNotDefined(perId),
        url: '/api/v2/public-per-process-status/{id}/',
        pathVariables: {
            id: Number(perId),
        },
    });
    const {
        pending: assessmentResponsePending,
        response: assessmentResponse,
    } = useGoRequest({
        skip: isNotDefined(processStatusResponse?.assessment),
        url: '/api/v2/public-per-assessment/{id}/',
        pathVariables: {
            id: Number(processStatusResponse?.assessment),
        },
    });

    const {
        pending: prioritizationResponsePending,
        response: prioritizationResponse,
    } = useGoRequest({
        skip: isNotDefined(processStatusResponse?.prioritization),
        url: '/api/v2/public-per-prioritization/{id}/',
        pathVariables: {
            id: Number(processStatusResponse?.prioritization),
        },
    });

    const perStats = perStatsResponse?.results?.[0];

    const topFiveRatedComponents = useMemo(
        () => {
            if (isNotDefined(assessmentResponse)
                || isNotDefined(assessmentResponse.area_responses)
                || assessmentResponse.area_responses.length === 0
            ) {
                return undefined;
            }

            const componentList = assessmentResponse.area_responses.flatMap(
                (areaResponse) => (
                    areaResponse.component_responses?.map(
                        (componentResponse) => ({
                            rating: componentResponse.rating_details,
                            details: componentResponse.component_details,
                        }),
                    )
                ),
            ).filter(isDefined) ?? [];

            const topFiveComponents = [...componentList].sort(
                (a, b) => (
                    compareNumber(a.rating?.value ?? 0, b.rating?.value ?? 0, -1)
                ),
            ).slice(0, 5);

            return topFiveComponents;
        },
        [assessmentResponse],
    );

    const componentsToBeStrengthened = useMemo(
        () => {
            if (isNotDefined(prioritizationResponse)) {
                return undefined;
            }

            const componentsWithRating = prioritizationResponse.prioritized_action_responses?.map(
                (componentResponse) => ({
                    id: componentResponse.id,
                    details: componentResponse.component_details,
                }),
            ) ?? [];

            const components = componentsWithRating.map(
                (component) => ({
                    id: component.id,
                    label: component.details.title,
                    componentNumber: component.details.component_num,
                    componentLetter: component.details.component_letter,
                }),
            );

            return components;
        },
        [prioritizationResponse],
    );

    const pending = perStatsResponsePending
        || processStatusPending
        || assessmentResponsePending
        || prioritizationResponsePending;

    return (
        <TabPage
            wikiLinkPathName="user_guide/Preparedness#how-to-use-it"
            pending={pending}
        >
            <Link
                to="countryNsOverviewCapacity"
                urlParams={{ countryId }}
                styleVariant="action"
                before={<ArrowLeftLineIcon />}
            >
                {strings.publicGoBackButtonTitle}
            </Link>
            <Container
                heading={strings.publicNsPreparednessAndResponseCapacityHeading}
                withHeaderBorder
            >
                <Container
                    headerDescription={(
                        <TextOutput
                            label={strings.publicLastUpdatedLabel}
                            value={processStatusResponse?.updated_at}
                            valueType="date"
                            textSize="sm"
                        />
                    )}
                >
                    <ListView
                        layout="grid"
                        numPreferredGridColumns={3}
                    >
                        <TextOutput
                            label={strings.publicStartDateLabel}
                            value={perStats?.date_of_assessment}
                            valueType="date"
                            strongValue
                        />
                        <TextOutput
                            label={strings.publicPerPhaseLabel}
                            value={processStatusResponse?.phase_display}
                            strongValue
                        />
                        <TextOutput
                            label={strings.publicFocalPointNameLabel}
                            value={perStats?.ns_focal_point_name}
                            strongValue
                        />
                        <TextOutput
                            label={strings.publicPerCycleLabel}
                            value={perStats?.assessment_number}
                            valueType="number"
                            strongValue
                        />
                        <TextOutput
                            label={strings.publicTypeOfAssessmentLabel}
                            value={perStats?.type_of_assessment?.name}
                            strongValue
                        />
                        <TextOutput
                            label={strings.publicFocalPointEmailTitle}
                            value={perStats?.ns_focal_point_email}
                            strongValue
                        />
                    </ListView>
                </Container>
            </Container>
            {(isDefined(topFiveRatedComponents) || isDefined(componentsToBeStrengthened)) && (
                <ListView layout="grid">
                    {isDefined(topFiveRatedComponents) && (
                        <Container
                            heading={strings.publicHighlightedTopRatedComponentHeading}
                            withHeaderBorder
                        >
                            <ListView
                                layout="grid"
                                numPreferredGridColumns={2}
                            >
                                {topFiveRatedComponents.map(
                                    (component) => (
                                        <Container
                                            key={component.details.id}
                                            withDarkBackground
                                            withPadding
                                        >
                                            {component.details.title}
                                        </Container>
                                    ),
                                )}
                            </ListView>
                        </Container>
                    )}
                    {isDefined(componentsToBeStrengthened) && (
                        <Container
                            heading={strings.publicPriorityComponentToBeStrengthenedHeading}
                            withHeaderBorder
                        >
                            <ListView
                                layout="block"
                                withSpacingOpticalCorrection
                            >
                                {componentsToBeStrengthened.map(
                                    (priorityComponent) => (
                                        <Label
                                            key={priorityComponent.id}
                                            strong
                                        >
                                            {getFormattedComponentName({
                                                component_num: priorityComponent.componentNumber,
                                                component_letter: priorityComponent.componentLetter,
                                                title: priorityComponent.label,
                                            })}
                                        </Label>
                                    ),
                                )}
                            </ListView>
                        </Container>
                    )}
                </ListView>
            )}
            <Message
                title={strings.publicComponentLimitedAccess}
                description={strings.publicComponentLimitedAccessDescription}
                actions={(
                    <Link
                        href="mailto:PER.Team@ifrc.org"
                        external
                        colorVariant="primary"
                        styleVariant="outline"
                    >
                        {strings.publicComponentRequestSeeMore}
                    </Link>
                )}
            />
        </TabPage>
    );
}

export default PublicCountryPreparedness;
