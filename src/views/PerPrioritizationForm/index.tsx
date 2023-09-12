import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    useParams,
    useOutletContext,
} from 'react-router-dom';
import {
    createSubmitHandler,
    useForm,
    useFormArray,
    removeNull,
} from '@togglecorp/toggle-form';
import {
    _cs,
    compareNumber,
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';
import { CheckLineIcon } from '@ifrc-go/icons';

import useRouting from '#hooks/useRouting';
import Container from '#components/Container';
import Portal from '#components/Portal';
import Button from '#components/Button';
import ConfirmButton from '#components/ConfirmButton';
import BlockLoading from '#components/BlockLoading';
import PerAssessmentSummary from '#components/domain/PerAssessmentSummary';
import DropdownMenu from '#components/DropdownMenu';
import DropdownMenuItem from '#components/DropdownMenuItem';
import useTranslation from '#hooks/useTranslation';
import useAlert from '#hooks/useAlert';
import { resolveToString } from '#utils/translation';
import type { PerProcessOutletContext } from '#utils/outletContext';
import { PER_PHASE_PRIORITIZATION } from '#utils/domain/per';
import {
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import {
    prioritizationSchema,
    type PrioritizationRequestBody,
    type PartialPrioritization,
} from './schema';
import ComponentInput from './ComponentInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

type SortKey = 'component' | 'rating' | 'benchmark';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { perId } = useParams<{ perId: string }>();
    const { navigate } = useRouting();
    const alert = useAlert();
    const strings = useTranslation(i18n);
    const [sortBy, setSortBy] = useState<SortKey>('component');

    const {
        statusResponse,
        refetchStatusResponse,
        actionDivRef,
    } = useOutletContext<PerProcessOutletContext>();

    const {
        value,
        validate,
        setValue,
        setFieldValue,
        setError,
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

    const { pending: prioritizationPending } = useRequest({
        skip: isNotDefined(statusResponse?.prioritization),
        url: '/api/v2/per-prioritization/{id}/',
        pathVariables: {
            id: Number(statusResponse?.prioritization),
        },
        onSuccess: (response) => {
            setValue(removeNull(response));
        },
    });

    const {
        pending: perAssesmentPending,
        response: perAssessmentResponse,
    } = useRequest({
        skip: isNotDefined(statusResponse?.assessment),
        url: '/api/v2/per-assessment/{id}/',
        pathVariables: {
            id: Number(statusResponse?.assessment),
        },
    });

    const {
        setValue: setComponentValue,
        removeValue: removeComponentValue,
    } = useFormArray('prioritized_action_responses', setFieldValue);

    const {
        pending: savePerPrioritizationPending,
        trigger: savePerPrioritization,
    } = useLazyRequest({
        url: '/api/v2/per-prioritization/{id}/',
        pathVariables: statusResponse && isDefined(statusResponse.prioritization)
            ? { id: statusResponse.prioritization }
            : undefined,
        method: 'PUT',
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
            // FIXME:
            // getKey for
            // 1. prioritized_action_responses
            setError(transformObjectError(formErrors, () => undefined));
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
        const prioritization = statusResponse?.prioritization;
        if (isNotDefined(prioritization)) {
            // eslint-disable-next-line no-console
            console.error('Prioritization id not defined');
        }
        savePerPrioritization({
            ...formValues,
            is_draft: formValues?.is_draft ?? true,
        } as PrioritizationRequestBody);
    }, [savePerPrioritization, statusResponse]);

    const handleFinalSubmit = useCallback((formValues: PartialPrioritization) => {
        const prioritization = statusResponse?.prioritization;
        if (isNotDefined(prioritization)) {
            // eslint-disable-next-line no-console
            console.error('Prioritization id not defined');
        }
        savePerPrioritization({
            ...formValues,
            is_draft: false,
        } as PrioritizationRequestBody);
    }, [savePerPrioritization, statusResponse]);

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

    const pending = formComponentPending
        || perAssesmentPending
        || prioritizationPending;

    const areaIdToTitleMap = listToMap(
        questionsResponse?.results ?? [],
        (question) => question.component.area.id,
        (question) => question.component.area.title,
    );

    const handleFormSubmit = createSubmitHandler(validate, setError, handleSubmit);
    const handleFormFinalSubmit = createSubmitHandler(validate, setError, handleFinalSubmit);

    const readOnlyMode = isNotDefined(statusResponse)
        || isNotDefined(statusResponse.phase)
        || statusResponse.phase < PER_PHASE_PRIORITIZATION;

    const sortedFormComponents = useMemo(
        () => (
            [...formComponentResponse?.results ?? []].sort(
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
        [strings],
    );

    // FIXME: use memo
    const sortKeyToLabel = listToMap(
        sortOptions,
        (sortOption) => sortOption.key,
        (sortOption) => sortOption.label,
    );

    return (
        <div className={styles.perPrioritizationForm}>
            {pending && (
                <BlockLoading />
            )}
            {!pending && (
                <>
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
                                disabled={pending || savePerPrioritizationPending || readOnlyMode}
                                confirmHeading={strings.submitConfirmHeading}
                                confirmMessage={strings.submitConfirmMessage}
                            >
                                {strings.perSelectAndAddToWorkPlan}
                            </ConfirmButton>
                        ) : undefined}
                        childrenContainerClassName={styles.componentList}
                    >
                        {!pending && sortedFormComponents.map((component) => {
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
                                    onSelectionChange={handleSelectionChange}
                                    questionResponses={
                                        assessmentQuestionResponsesByComponent[component.id]
                                    }
                                    ratingDisplay={ratingDisplay}
                                    readOnly={readOnlyMode}
                                />
                            );
                        })}
                    </Container>
                </>
            )}
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
        </div>
    );
}

Component.displayName = 'PerPrioritizationForm';
