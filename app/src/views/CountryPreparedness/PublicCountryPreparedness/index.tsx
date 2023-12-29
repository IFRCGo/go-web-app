import {
    Fragment,
    useMemo,
} from 'react';
import {
    Container,
    Heading,
    Message,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    compareNumber,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import useAuth from '#hooks/domain/useAuth';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    perId?: number;
}

function PublicCountryPreparedness(props: Props) {
    const {
        perId,
    } = props;
    const { isAuthenticated } = useAuth();
    const strings = useTranslation(i18n);
    const {
        pending: processStatusPending,
        response: processStatusResponse,
    } = useRequest({
        skip: isNotDefined(perId) || isAuthenticated,
        url: '/api/v2/public-per-process-status/{id}/',
        pathVariables: {
            id: Number(perId),
        },
    });

    const {
        pending: assessmentResponsePending,
        response: assessmentResponse,
    } = useRequest({
        skip: isNotDefined(processStatusResponse?.assessment) || isAuthenticated,
        url: '/api/v2/public-per-assessment/{id}/',
        pathVariables: {
            id: Number(processStatusResponse?.assessment),
        },
    });

    const {
        pending: prioritizationResponsePending,
        response: prioritizationResponse,
    } = useRequest({
        skip: isNotDefined(processStatusResponse?.prioritization) || isAuthenticated,
        url: '/api/v2/public-per-prioritization/{id}/',
        pathVariables: {
            id: Number(processStatusResponse?.prioritization),
        },
    });

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

    const pending = processStatusPending
        || assessmentResponsePending
        || prioritizationResponsePending;

    if (pending) {
        return (
            <Message
                className={styles.pendingMessage}
                pending
                description={strings.publicComponentFetchingData}
            />
        );
    }

    return (
        <Container
            className={styles.publicCountryPreparedness}
            childrenContainerClassName={styles.preparednessContent}
            withHeaderBorder
        >
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
                                    {resolveToString(strings.publicPriorityComponentHeading, {
                                        componentNumber: priorityComponent.componentNumber,
                                        componentLetter: priorityComponent.componentLetter,
                                        componentName: priorityComponent.label,
                                    })}
                                </Heading>
                            </Fragment>
                        ),
                    )}
                </Container>
            )}
        </Container>
    );
}

export default PublicCountryPreparedness;
