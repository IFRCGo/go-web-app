import {
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import {
    generatePath,
    useNavigate,
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
import RouteContext from '#contexts/route';

import { prioritizationSchema, PrioritizationRequestBody } from './schema';
import type { PartialPrioritization } from './schema';
import ComponentInput from './ComponentInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

type SortKey = 'component' | 'rating' | 'benchmark';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { perId } = useParams<{ perId: string }>();
    const navigate = useNavigate();
    const alert = useAlert();
    const strings = useTranslation(i18n);
    const { perWorkPlanForm: perWorkPlanFormRoute } = useContext(RouteContext);
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
            limit: 500,
        },
    });

    const {
        response: questionsResponse,
    } = useRequest({
        url: '/api/v2/per-formquestion/',
        query: {
            limit: 500,
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
    } = useFormArray('component_responses', setFieldValue);

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
                        generatePath(
                            perWorkPlanFormRoute.absolutePath,
                            { perId: String(perId) },
                        ),
                    );
                }
            }
        },
        onFailure: ({
            value: {
                messageForNotification,
                // formErrors,
            },
            debugMessage,
        }) => {
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
            is_draft: true,
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
        value?.component_responses ?? [],
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

    const readOnlyMode = statusResponse?.phase !== PER_PHASE_PRIORITIZATION;

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
                <PerAssessmentSummary
                    perOptionsResponse={perOptionsResponse}
                    areaResponses={perAssessmentResponse?.area_responses}
                    totalQuestionCount={questionsResponse?.count}
                    areaIdToTitleMap={areaIdToTitleMap}
                />
            )}
            <Container
                heading={strings.prioritizationHeading}
                headingLevel={2}
                withHeaderBorder
                spacing="loose"
                actions={(
                    <DropdownMenu
                        label={resolveToString(
                            strings.sortButtonLabel,
                            { sort: sortKeyToLabel[sortBy] },
                        )}
                        variant="tertiary"
                        dropdownContainerClassName={styles.sortByDropdownContent}
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
                footerActions={(
                    <ConfirmButton
                        name={undefined}
                        variant="secondary"
                        onConfirm={handleFormFinalSubmit}
                        disabled={savePerPrioritizationPending
                            || statusResponse?.phase !== PER_PHASE_PRIORITIZATION}
                        confirmHeading={strings.confirmHeading}
                        confirmMessage={strings.confirmMessage}
                    >
                        {strings.perSelectAndAddToWorkPlan}
                    </ConfirmButton>
                )}
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
            {actionDivRef.current && (
                <Portal container={actionDivRef?.current}>
                    <Button
                        name={undefined}
                        variant="secondary"
                        onClick={handleFormSubmit}
                        disabled={savePerPrioritizationPending
                            || readOnlyMode}
                    >
                        {strings.saveLabel}
                    </Button>
                </Portal>
            )}
        </div>
    );
}

Component.displayName = 'PerPrioritizationForm';
