import {
    Fragment,
    useCallback,
    useMemo,
} from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeftLineIcon } from '@ifrc-go/icons';
import {
    BlockLoading,
    Button,
    Container,
    Heading,
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
import WikiLink from '#components/WikiLink';
import useRouting from '#hooks/useRouting';
import { getFormattedComponentName } from '#utils/domain/per';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

function PublicCountryPreparedness() {
    const strings = useTranslation(i18n);

    const { perId, countryId } = useParams<{ perId: string, countryId: string }>();

    const {
        pending: perStatsResponsePending,
        response: perStatsResponse,
    } = useRequest({
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
        skip: isNotDefined(processStatusResponse?.assessment),
        url: '/api/v2/public-per-assessment/{id}/',
        pathVariables: {
            id: Number(processStatusResponse?.assessment),
        },
    });

    const {
        pending: prioritizationResponsePending,
        response: prioritizationResponse,
    } = useRequest({
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

    const { goBack } = useRouting();
    const handleBackButtonClick = useCallback(() => {
        goBack();
    }, [goBack]);

    const pending = perStatsResponsePending
        || processStatusPending
        || assessmentResponsePending
        || prioritizationResponsePending;

    return (
        <Container
            className={styles.publicCountryPreparedness}
            childrenContainerClassName={styles.preparednessContent}
            heading={strings.nsPreparednessAndResponseCapacityHeading}
            actionsContainerClassName={styles.actionsContainer}
            headingLevel={2}
            withHeaderBorder
            actions={(
                <div className={styles.perAction}>
                    <TextOutput
                        label={strings.lastUpdatedLabel}
                        value={processStatusResponse?.updated_at}
                        valueType="date"
                        strongValue
                    />
                    <WikiLink
                        href="user_guide/Preparedness#how-to-use-it"
                    />
                </div>
            )}
            icons={(
                <Button
                    name={undefined}
                    onClick={handleBackButtonClick}
                    variant="tertiary"
                    title={strings.goBackButtonTitle}
                >
                    <ArrowLeftLineIcon className={styles.backIcon} />
                </Button>
            )}
        >
            <div className={styles.perOverviewDetails}>
                <TextOutput
                    label={strings.startDateLabel}
                    value={perStats?.date_of_assessment}
                    valueType="date"
                    strongValue
                />
                <TextOutput
                    label={strings.perPhaseLabel}
                    value={processStatusResponse?.phase_display}
                    strongValue
                />
                <TextOutput
                    label={strings.focalPointNameLabel}
                    value={perStats?.ns_focal_point_name}
                    strongValue
                />
                <TextOutput
                    label={strings.perCycleLabel}
                    value={perStats?.assessment_number}
                    valueType="number"
                    strongValue
                />
                <TextOutput
                    label={strings.typeOfAssessmentLabel}
                    value={perStats?.type_of_assessment.name}
                    strongValue
                />
                <TextOutput
                    label={strings.focalPointEmailTitle}
                    value={perStats?.ns_focal_point_email}
                    strongValue
                />
            </div>
            {pending && (
                <BlockLoading className={styles.pendingMessage} />
            )}
            {isDefined(topFiveRatedComponents) && (
                <Container
                    heading={strings.publicHighlightedTopRatedComponentHeading}
                    withHeaderBorder
                    childrenContainerClassName={styles.topRatedComponentContent}
                >
                    {topFiveRatedComponents.map(
                        (component) => (
                            <Container
                                key={component.details.id}
                                className={styles.topRatedComponent}
                                withInternalPadding
                                withoutWrapInHeading
                                spacing="cozy"
                            >
                                {component.details.title}
                            </Container>
                        ),
                    )}
                </Container>
            )}
            {isDefined(componentsToBeStrengthened) && (
                <Container
                    heading={strings.publicPriorityComponentToBeStrengthenedHeading}
                    childrenContainerClassName={styles.priorityComponentsContent}
                    withHeaderBorder
                >
                    {componentsToBeStrengthened.map(
                        (priorityComponent) => (
                            <Fragment key={priorityComponent.id}>
                                <Heading
                                    className={styles.heading}
                                    level={5}
                                >
                                    {getFormattedComponentName({
                                        component_num: priorityComponent.componentNumber,
                                        component_letter: priorityComponent.componentLetter,
                                        title: priorityComponent.label,
                                    })}
                                </Heading>
                            </Fragment>
                        ),
                    )}
                </Container>
            )}
            <div className={styles.limitedAccess}>
                <Message
                    title={strings.componentLimitedAccess}
                    description={strings.componentLimitedAccessDescription}
                    actions={(
                        <div className={styles.contactContainer}>
                            <Link
                                href="mailto:PER.Team@ifrc.org"
                                external
                                variant="secondary"
                            >
                                {strings.componentRequestSeeMore}
                            </Link>
                        </div>
                    )}
                />
            </div>
        </Container>
    );
}

export default PublicCountryPreparedness;
