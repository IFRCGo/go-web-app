import {
    type ElementRef,
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    useOutletContext,
    useParams,
} from 'react-router-dom';
import { CheckLineIcon } from '@ifrc-go/icons';
import {
    Button,
    ConfirmButton,
    Container,
    DropdownMenu,
    Message,
    Portal,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    _cs,
    compareNumber,
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    removeNull,
    useForm,
    useFormArray,
} from '@togglecorp/toggle-form';

import FormFailedToLoadMessage from '#components/domain/FormFailedToLoadMessage';
import PerAssessmentSummary from '#components/domain/PerAssessmentSummary';
import DropdownMenuItem from '#components/DropdownMenuItem';
import NonFieldError from '#components/NonFieldError';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import { PER_PHASE_PRIORITIZATION } from '#utils/domain/per';
import type { PerProcessOutletContext } from '#utils/outletContext';
import {
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import {
    matchArray,
    NUM,
    transformObjectError,
} from '#utils/restRequest/error';

import ComponentInput from './ComponentInput';
import {
    type PartialPrioritization,
    type PrioritizationRequestBody,
    prioritizationSchema,
} from './schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type SortKey = 'component' | 'rating' | 'benchmark';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { perId } = useParams<{ perId: string }>();
    const { navigate } = useRouting();
    const alert = useAlert();
    const strings = useTranslation(i18n);
    const [sortBy, setSortBy] = useState<SortKey>('component');
    const formContentRef = useRef<ElementRef<'div'>>(null);

    const {
        fetchingStatus,
        statusResponse,
        refetchStatusResponse,
        actionDivRef,
        readOnly: readOnlyFromContext,
    } = useOutletContext<PerProcessOutletContext>();

    const {
        value,
        validate,
        setValue,
        setFieldValue,
        setError,
        error: formError,
    } = useForm(
        prioritizationSchema,
        {
            value: {
                overview: isDefined(perId) ? Number(perId) : undefined,
            },
        },
    );

    const {
        response: perOptionsResponse,
    } = useRequest({
        url: '/api/v2/per-options/',
    });

    const {
        pending: formComponentPending,
        response: formComponentResponse,
    } = useRequest({
        url: '/api/v2/per-formcomponent/',
        query: {
            limit: 9999,
        },
    });

    const {
        response: questionsResponse,
    } = useRequest({
        url: '/api/v2/per-formquestion/',
        query: {
            limit: 9999,
        },
    });

    const prioritizationId = statusResponse?.prioritization;
    const assessmentId = statusResponse?.assessment;

    const {
        pending: fetchingPrioritization,
        error: prioritizationResponseError,
    } = useRequest({
        skip: isNotDefined(prioritizationId),
        url: '/api/v2/per-prioritization/{id}/',
        pathVariables: {
            id: Number(prioritizationId),
        },
        onSuccess: (response) => {
            setValue(removeNull(response));
        },
    });

    const {
        pending: perAssessmentPending,
        response: perAssessmentResponse,
    } = useRequest({
        skip: isNotDefined(assessmentId),
        url: '/api/v2/per-assessment/{id}/',
        pathVariables: {
            id: Number(assessmentId),
        },
    });

    // FIXME: We might need to use useFormArrayWithEmptyCheck
    const {
        setValue: setComponentValue,
        removeValue: removeComponentValue,
    } = useFormArray('prioritized_action_responses', setFieldValue);

    const {
        pending: savePerPrioritizationPending,
        trigger: savePerPrioritization,
    } = useLazyRequest({
        url: '/api/v2/per-prioritization/{id}/',
        pathVariables: isDefined(prioritizationId)
            ? { id: prioritizationId }
            : undefined,
        method: 'PATCH',
        body: (ctx: PrioritizationRequestBody) => ctx,
        onSuccess: (response) => {
            if (response && isDefined(response.id)) {
                alert.show(
                    strings.saveRequestSuccessMessage,
                    { variant: 'success' },
                );

                refetchStatusResponse();

                if (response.is_draft === false) {
                    navigate(
                        'perWorkPlanForm',
                        { params: { perId } },
                    );

                    // Move the page position to top when moving on to next step
                    window.scrollTo(0, 0);
                }
            }
        },
        onFailure: ({
            value: {
                messageForNotification,
                formErrors,
            },
            debugMessage,
        }) => {
            setError(transformObjectError(
                formErrors,
                (locations) => {
                    const match = matchArray(locations, ['prioritized_action_responses', NUM]);
                    if (isDefined(match)) {
                        const [response_index] = match;
                        return value?.prioritized_action_responses?.[response_index]?.component;
                    }
                    return undefined;
                },
            ));
            alert.show(
                strings.saveRequestFailureMessage,
                {
                    variant: 'danger',
                    debugMessage,
                    description: messageForNotification,
                },
            );
        },
    });

    const assessmentComponentResponses = useMemo(
        () => (
            perAssessmentResponse?.area_responses?.flatMap(
                (areaResponse) => areaResponse.component_responses,
            ) ?? []
        ),
        [perAssessmentResponse],
    );

    const assessmentComponentResponseMap = useMemo(
        () => (
            listToMap(
                assessmentComponentResponses?.filter(isDefined),
                (componentResponse) => componentResponse.component,
            )
        ),
        [assessmentComponentResponses],
    );

    const assessmentQuestionResponsesByComponent = useMemo(
        () => (
            listToMap(
                assessmentComponentResponses?.filter(isDefined),
                (componentResponse) => componentResponse.component,
                (componentResponse) => componentResponse.question_responses,
            )
        ),
        [assessmentComponentResponses],
    );

    const handleSubmit = useCallback((formValues: PartialPrioritization) => {
        formContentRef.current?.scrollIntoView();

        if (isNotDefined(prioritizationId)) {
            // eslint-disable-next-line no-console
            console.error('Prioritization id not defined');
        }
        savePerPrioritization({
            ...formValues,
            is_draft: formValues?.is_draft ?? true,
        } as PrioritizationRequestBody);
    }, [savePerPrioritization, prioritizationId]);

    const handleFinalSubmit = useCallback((formValues: PartialPrioritization) => {
        formContentRef.current?.scrollIntoView();

        if (isNotDefined(prioritizationId)) {
            // eslint-disable-next-line no-console
            console.error('Prioritization id not defined');
        }
        savePerPrioritization({
            ...formValues,
            is_draft: false,
        } as PrioritizationRequestBody);
    }, [savePerPrioritization, prioritizationId]);

    const componentResponseMapping = listToMap(
        value?.prioritized_action_responses ?? [],
        (componentResponse) => componentResponse.component,
        (componentResponse, _, index) => ({
            index,
            value: componentResponse,
        }),
    );

    const handleSelectionChange = useCallback(
        (checked: boolean, index: number, componentId: number) => {
            if (!checked) {
                removeComponentValue(index);
                return;
            }

            setComponentValue({
                justification_text: '',
                component: componentId,
            }, index);
        },
        [removeComponentValue, setComponentValue],
    );

    const dataPending = formComponentPending
        || perAssessmentPending
        || fetchingPrioritization
        || fetchingStatus;

    const disabled = dataPending || savePerPrioritizationPending;

    const areaIdToTitleMap = listToMap(
        questionsResponse?.results ?? [],
        (question) => question.component.area.id,
        (question) => question.component.area.title ?? undefined,
    );

    const error = useMemo(
        () => getErrorObject(formError),
        [formError],
    );

    const componentInputError = useMemo(
        () => getErrorObject(error?.prioritized_action_responses),
        [error],
    );

    const handleFormError = useCallback(() => {
        formContentRef.current?.scrollIntoView();
    }, []);

    const handleFormSubmit = createSubmitHandler(
        validate,
        setError,
        handleSubmit,
        handleFormError,
    );
    const handleFormFinalSubmit = createSubmitHandler(
        validate,
        setError,
        handleFinalSubmit,
        handleFormError,
    );

    const currentPerStep = statusResponse?.phase;
    const readOnlyMode = readOnlyFromContext
        || isNotDefined(currentPerStep)
        || currentPerStep < PER_PHASE_PRIORITIZATION;

    const sortedFormComponents = useMemo(
        () => (
            [...formComponentResponse?.results?.filter(
                // NOTE:  filter out parent components
                (formComponent) => !formComponent.is_parent,
            ) ?? []].sort(
                (a, b) => {
                    if (sortBy === 'rating') {
                        const ratingA = assessmentComponentResponseMap
                            ?.[a.id]?.rating_details?.value ?? 0;
                        const ratingB = assessmentComponentResponseMap
                            ?.[b.id]?.rating_details?.value ?? 0;
                        return compareNumber(ratingA, ratingB, -1);
                    }

                    if (sortBy === 'benchmark') {
                        const benchmarkA = assessmentComponentResponseMap
                            ?.[a.id]?.question_responses?.length ?? 0;
                        const benchmarkB = assessmentComponentResponseMap
                            ?.[b.id]?.question_responses?.length ?? 0;

                        return compareNumber(benchmarkA, benchmarkB, -1);
                    }

                    return compareNumber(a.component_num, b.component_num);
                },
            )
        ),
        [formComponentResponse, assessmentComponentResponseMap, sortBy],
    );

    const sortOptions = useMemo<{
        key: SortKey;
        label: string;
    }[]>(
        () => ([
            { key: 'component', label: strings.sortByComponentLabel },
            { key: 'rating', label: strings.sortByRatingLabel },
            { key: 'benchmark', label: strings.sortByBenchmarkLabel },
        ]),
        [
            strings.sortByComponentLabel,
            strings.sortByRatingLabel,
            strings.sortByBenchmarkLabel,
        ],
    );

    const sortKeyToLabel = useMemo(() => listToMap(
        sortOptions,
        (sortOption) => sortOption.key,
        (sortOption) => sortOption.label,
    ), [sortOptions]);

    if (dataPending) {
        return (
            <Message
                pending
            />
        );
    }

    if (isNotDefined(prioritizationId)) {
        return (
            <FormFailedToLoadMessage
                description={strings.resourceNotFound}
            />
        );
    }

    if (isDefined(prioritizationResponseError)) {
        return (
            <FormFailedToLoadMessage
                description={prioritizationResponseError.value.messageForNotification}
            />
        );
    }

    return (
        <div
            className={styles.perPrioritizationForm}
            ref={formContentRef}
        >
            {actionDivRef.current && (
                <Portal container={actionDivRef?.current}>
                    {value.is_draft === false ? (
                        <ConfirmButton
                            name={undefined}
                            variant="secondary"
                            onConfirm={handleFormSubmit}
                            confirmHeading={strings.postSubmitEditConfirmHeading}
                            confirmMessage={strings.postSubmitEditConfirmMessage}
                            disabled={savePerPrioritizationPending || readOnlyMode}
                        >
                            {strings.saveLabel}
                        </ConfirmButton>
                    ) : (
                        <Button
                            name={undefined}
                            variant="secondary"
                            onClick={handleFormSubmit}
                            disabled={savePerPrioritizationPending || readOnlyMode}
                        >
                            {strings.saveLabel}
                        </Button>
                    )}
                </Portal>
            )}
            <NonFieldError
                error={error}
                withFallbackError
            />
            <PerAssessmentSummary
                perOptionsResponse={perOptionsResponse}
                areaResponses={perAssessmentResponse?.area_responses}
                totalQuestionCount={questionsResponse?.count}
                areaIdToTitleMap={areaIdToTitleMap}
            />
            <Container
                heading={strings.prioritizationHeading}
                headingLevel={2}
                withHeaderBorder
                actions={(
                    <DropdownMenu
                        label={resolveToString(
                            strings.sortButtonLabel,
                            { sort: sortKeyToLabel[sortBy] },
                        )}
                        variant="tertiary"
                        popupClassName={styles.sortByDropdownContent}
                    >
                        {sortOptions.map(
                            (sortOption) => (
                                <DropdownMenuItem
                                    type="button"
                                    key={sortOption.key}
                                    name={sortOption.key}
                                    onClick={setSortBy}
                                    icons={(
                                        <CheckLineIcon
                                            className={_cs(
                                                styles.checkmark,
                                                sortOption.key === sortBy && styles.active,
                                            )}
                                        />
                                    )}
                                >
                                    {sortOption.label}
                                </DropdownMenuItem>
                            ),
                        )}
                    </DropdownMenu>
                )}
                footerActions={value?.is_draft !== false ? (
                    <ConfirmButton
                        name={undefined}
                        variant="secondary"
                        onConfirm={handleFormFinalSubmit}
                        disabled={disabled || readOnlyMode}
                        confirmHeading={strings.submitConfirmHeading}
                        confirmMessage={strings.submitConfirmMessage}
                    >
                        {strings.perSelectAndAddToWorkPlan}
                    </ConfirmButton>
                ) : undefined}
                childrenContainerClassName={styles.componentList}
            >
                <NonFieldError
                    error={error}
                    withFallbackError
                />
                <NonFieldError error={componentInputError} />
                {sortedFormComponents.map((component) => {
                    const rating = assessmentComponentResponseMap
                        ?.[component.id]?.rating_details;
                    const ratingDisplay = isDefined(rating)
                        ? `${rating.value} - ${rating.title}`
                        : undefined;

                    return (
                        <ComponentInput
                            key={component.id}
                            index={componentResponseMapping[component.id]?.index}
                            value={componentResponseMapping[component.id]?.value}
                            onChange={setComponentValue}
                            component={component}
                            error={componentInputError?.[component.id]}
                            onSelectionChange={handleSelectionChange}
                            questionResponses={
                                assessmentQuestionResponsesByComponent[component.id]
                            }
                            ratingDisplay={ratingDisplay}
                            readOnly={readOnlyMode}
                            disabled={disabled}
                        />
                    );
                })}
            </Container>
        </div>
    );
}

Component.displayName = 'PerPrioritizationForm';
