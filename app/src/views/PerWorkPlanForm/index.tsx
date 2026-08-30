import {
    useCallback,
    useMemo,
    useRef,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import { AddLineIcon } from '@ifrc-go/icons';
import {
    Button,
    ConfirmButton,
    Container,
    InlineLayout,
    ListView,
    Portal,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
    listToMap,
    randomString,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    useForm,
    useFormArray,
} from '@togglecorp/toggle-form';

import FormFailedToLoadMessage from '#components/domain/FormFailedToLoadMessage';
import Link from '#components/Link';
import NonFieldError from '#components/NonFieldError';
import TabPage from '#components/TabPage';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import { PER_PHASE_WORKPLAN } from '#utils/domain/per';
import { type PerProcessOutletContext } from '#utils/outletContext';
import {
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import {
    matchArray,
    NUM,
    transformObjectError,
} from '#utils/restRequest/error';

import AdditionalActionInput from './AdditionalActionInput';
import PrioritizedActionInput from './PrioritizedActionInput';
import {
    type PartialWorkPlan,
    type WorkPlanBody,
    workplanSchema,
} from './schema';

import i18n from './i18n.json';

const defaultValue: PartialWorkPlan = {};

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { navigate } = useRouting();
    const alert = useAlert();
    const {
        fetchingStatus,
        statusResponse,
        actionDivRef,
        refetchStatusResponse,
        readOnly: readOnlyFromContext,
    } = useOutletContext<PerProcessOutletContext>();
    const formContentRef = useRef<HTMLDivElement>(null);

    const {
        value,
        validate,
        setFieldValue,
        setError,
        setValue,
        error: formError,
    } = useForm(
        workplanSchema,
        { value: defaultValue },
    );

    const id = statusResponse?.id;
    const prioritizationId = statusResponse?.prioritization;
    const workplanId = statusResponse?.workplan;

    const {
        pending: prioritizationPending,
        response: prioritizationResponse,
    } = useRequest({
        skip: isNotDefined(prioritizationId),
        url: '/api/v2/per-prioritization/{id}/',
        pathVariables: {
            id: Number(prioritizationId),
        },
    });

    const {
        pending: fetchingWorkPlan,
        response: workPlanResponse,
        error: workPlanResponseError,
    } = useRequest({
        skip: isNotDefined(workplanId),
        url: '/api/v2/per-work-plan/{id}/',
        pathVariables: {
            id: Number(workplanId),
        },
        onSuccess: (response) => {
            const {
                additional_action_responses,
                ...remainingWorkPlan
            } = response;

            setValue({
                ...remainingWorkPlan,
                additional_action_responses: additional_action_responses?.map(
                    (customResponse) => ({
                        ...customResponse,
                        client_id: String(customResponse.id),
                    }),
                ),
            });
        },
    });

    const componentResponseMapping = useMemo(
        () => (
            listToMap(
                value?.prioritized_action_responses ?? [],
                (componentResponse) => componentResponse.component,
                (componentResponse, _, index) => ({
                    index,
                    value: componentResponse,
                }),
            )
        ),
        [value?.prioritized_action_responses],
    );

    // FIXME: Not sure if this is required
    const customComponentResponseMapping = useMemo(
        () => (
            listToMap(
                value?.additional_action_responses ?? [],
                (customComponentResponse) => customComponentResponse.client_id,
                (customComponentResponse, _, index) => ({
                    index,
                    value: customComponentResponse,
                }),
            )
        ),
        [value?.additional_action_responses],
    );

    const {
        pending: savePerWorkPlanPending,
        trigger: savePerWorkPlan,
    } = useLazyRequest({
        url: '/api/v2/per-work-plan/{id}/',
        pathVariables: isDefined(workplanId)
            ? { id: workplanId }
            : undefined,
        method: 'PATCH',
        body: (ctx: WorkPlanBody) => ctx,
        onSuccess: (response) => {
            refetchStatusResponse();

            alert.show(
                strings.saveRequestSuccessMessage,
                { variant: 'success' },
            );

            if (response.is_draft === false) {
                navigate('accountMyFormsPer');
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
                    let match = matchArray(locations, ['prioritized_action_responses', NUM]);
                    if (isDefined(match)) {
                        const [response_index] = match;
                        return value?.prioritized_action_responses?.[response_index!]?.component;
                    }
                    match = matchArray(locations, ['additional_action_responses', NUM]);
                    if (isDefined(match)) {
                        const [response_index] = match;
                        return value?.additional_action_responses?.[response_index!]?.client_id;
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

    // FIXME: We might need to use useFormArrayWithEmptyCheck
    const {
        setValue: setComponentValue,
    } = useFormArray<'prioritized_action_responses', NonNullable<PartialWorkPlan['prioritized_action_responses']>[number]>(
        'prioritized_action_responses',
        setFieldValue,
    );

    // FIXME: We might need to use useFormArrayWithEmptyCheck
    const {
        setValue: setCustomComponentValue,
        removeValue: removeCustomComponentValue,
    } = useFormArray<'additional_action_responses', NonNullable<PartialWorkPlan['additional_action_responses']>[number]>(
        'additional_action_responses',
        setFieldValue,
    );

    const handleSubmit = useCallback(
        (formValues: PartialWorkPlan) => {
            if (isNotDefined(workplanId)) {
                // eslint-disable-next-line no-console
                console.error('WorkPlan id not defined');
                return;
            }
            formContentRef.current?.scrollIntoView();

            // TODO: we might have to revisit this logic
            savePerWorkPlan({
                ...formValues,
                is_draft: formValues?.is_draft ?? true,
            } as WorkPlanBody);
        },
        [savePerWorkPlan, workplanId],
    );

    const handleFinalSubmit = useCallback(
        (formValues: PartialWorkPlan) => {
            if (isNotDefined(workplanId)) {
                // eslint-disable-next-line no-console
                console.error('WorkPlan id not defined');
                return;
            }
            formContentRef.current?.scrollIntoView();

            savePerWorkPlan({
                ...formValues,
                is_draft: false,
            } as WorkPlanBody);
        },
        [savePerWorkPlan, workplanId],
    );

    const handleAddCustomActivity = useCallback(() => {
        const newCustomActivity: NonNullable<PartialWorkPlan['additional_action_responses']>[number] = {
            client_id: randomString(),
        };

        setFieldValue(
            (oldValue: PartialWorkPlan['additional_action_responses']) => {
                if (oldValue) {
                    return [
                        ...oldValue,
                        newCustomActivity,
                    ];
                }

                return [newCustomActivity];
            },
            'additional_action_responses',
        );
    }, [setFieldValue]);

    const handleFormError = useCallback(() => {
        formContentRef.current?.scrollIntoView();
    }, []);

    // FIXME(frozenhelium): toggle-form submit callbacks are ref-backed
    const handleSave = createSubmitHandler(
        validate,
        setError,
        // eslint-disable-next-line react-hooks/refs
        handleFinalSubmit,
        // eslint-disable-next-line react-hooks/refs
        handleFormError,
    );
    const handleFinalizeWorkplan = createSubmitHandler(
        validate,
        setError,
        // eslint-disable-next-line react-hooks/refs
        handleSubmit,
        // eslint-disable-next-line react-hooks/refs
        handleFormError,
    );

    const error = getErrorObject(formError);

    const dataPending = prioritizationPending
        || fetchingWorkPlan
        || fetchingStatus;

    const componentResponseError = getErrorObject(error?.prioritized_action_responses);
    const customComponentError = getErrorObject(error?.additional_action_responses);

    const currentPerStep = statusResponse?.phase;
    const readOnlyMode = readOnlyFromContext
        || isNotDefined(currentPerStep)
        || currentPerStep < PER_PHASE_WORKPLAN;

    const disabled = dataPending || savePerWorkPlanPending;

    if (!dataPending && isNotDefined(workplanId)) {
        return (
            <FormFailedToLoadMessage
                description={strings.perWorkPlanResource}
            />
        );
    }

    return (
        <TabPage
            pending={dataPending}
            errored={isDefined(workPlanResponseError)}
            errorMessage={workPlanResponseError?.value.messageForNotification}
            elementRef={formContentRef}
        >
            {/* eslint-disable-next-line max-len */}
            {/* FIXME(frozenhelium): actionDivRef.current read in render to conditionally mount a Portal — valid DOM pattern */}
            {/* eslint-disable-next-line react-hooks/refs */}
            {actionDivRef?.current && (
                // eslint-disable-next-line react-hooks/refs
                <Portal container={actionDivRef.current}>
                    <Button
                        name={undefined}
                        onClick={handleFinalizeWorkplan}
                        disabled={savePerWorkPlanPending || readOnlyMode}
                    >
                        {strings.saveButtonLabel}
                    </Button>
                </Portal>
            )}
            <NonFieldError
                error={formError}
                withFallbackError
            />
            <ListView
                layout="block"
                withBackground
                spacing="lg"
                withPadding
                withSpacingOpticalCorrection
            >
                <TextOutput
                    label={strings.workPlanDate}
                    value={workPlanResponse?.overview_details?.workplan_development_date}
                    strongValue
                />
                <ListView>
                    <TextOutput
                        label={strings.perResponsibleLabel}
                        value={workPlanResponse?.overview_details?.ns_focal_point_name}
                        description={workPlanResponse?.overview_details?.ns_focal_point_email}
                        strongValue
                    />
                    {isDefined(id) && (
                        <Link
                            to="perOverviewForm"
                            urlParams={{ perId: id }}
                            colorVariant="primary"
                            styleVariant="outline"
                            spacing="sm"
                        >
                            {strings.editResponsibleButtonLabel}
                        </Link>
                    )}
                </ListView>
            </ListView>
            <Container
                heading={strings.prioritizedComponentsHeading}
                withHeaderBorder
                headerDescription={(
                    <NonFieldError error={componentResponseError} />
                )}
            >
                <ListView
                    layout="block"
                    spacing="sm"
                >
                    {prioritizationResponse?.prioritized_action_responses?.map(
                        (componentResponse) => (
                            <PrioritizedActionInput
                                key={componentResponse.component}
                                index={componentResponseMapping[componentResponse.component]?.index}
                                value={componentResponseMapping[componentResponse.component]?.value}
                                onChange={setComponentValue}
                                component={componentResponse.component_details}
                                error={componentResponseError?.[componentResponse.component]}
                                readOnly={readOnlyMode}
                                disabled={disabled}
                            />
                        ),
                    )}
                </ListView>
            </Container>
            <Container
                heading={strings.actionsHeading}
                withHeaderBorder
                headerActions={(
                    <Button
                        name={undefined}
                        onClick={handleAddCustomActivity}
                        before={<AddLineIcon />}
                        disabled={readOnlyMode}
                    >
                        {strings.addActionButtonLabel}
                    </Button>
                )}
                headerDescription={(
                    <NonFieldError error={customComponentError} />
                )}
                empty={(value?.additional_action_responses?.length ?? 0) === 0}
                emptyMessage={strings.noActionsLabel}
            >
                <ListView
                    layout="block"
                    spacing="sm"
                >
                    {value?.additional_action_responses?.map((customComponent, i) => (
                        <AdditionalActionInput
                            key={customComponent.client_id}
                            actionNumber={i + 1}
                            index={
                                customComponentResponseMapping[customComponent.client_id]?.index
                            }
                            value={
                                customComponentResponseMapping[customComponent.client_id]?.value
                            }
                            onChange={setCustomComponentValue}
                            onRemove={removeCustomComponentValue}
                            error={customComponentError?.[customComponent.client_id]}
                            readOnly={readOnlyMode}
                            disabled={disabled}
                        />
                    ))}
                </ListView>
            </Container>
            <InlineLayout
                after={value.is_draft !== false && (
                    <ConfirmButton
                        name={undefined}
                        onConfirm={handleSave}
                        disabled={savePerWorkPlanPending || readOnlyMode}
                        confirmHeading={strings.confirmHeading}
                        confirmMessage={strings.confirmMessage}
                    >
                        {strings.saveAndFinalizeWorkPlan}
                    </ConfirmButton>
                )}
            />
        </TabPage>
    );
}

Component.displayName = 'PerWorkPlanForm';
