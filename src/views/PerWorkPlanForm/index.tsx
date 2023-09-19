import { useCallback, useMemo } from 'react';
import { AddLineIcon } from '@ifrc-go/icons';
import {
    useOutletContext,
} from 'react-router-dom';
import {
    isNotDefined,
    isDefined,
    listToMap,
    randomString,
} from '@togglecorp/fujs';

import {
    createSubmitHandler,
    useForm,
    useFormArray,
    getErrorObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import useRouting from '#hooks/useRouting';
import Button from '#components/Button';
import Container from '#components/Container';
import BlockLoading from '#components/BlockLoading';
import ConfirmButton from '#components/ConfirmButton';
import TextOutput from '#components/TextOutput';
import Link from '#components/Link';
import Portal from '#components/Portal';
import Message from '#components/Message';
import FormFailedToLoadMessage from '#components/domain/FormFailedToLoadMessage';
import {
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import { type PerProcessOutletContext } from '#utils/outletContext';
import { PER_PHASE_WORKPLAN } from '#utils/domain/per';
import useTranslation from '#hooks/useTranslation';
import useAlert from '#hooks/useAlert';
import {
    transformObjectError,
    matchArray,
    NUM,
} from '#utils/restRequest/error';

import PrioritizedActionInput from './PrioritizedActionInput';
import AdditionalActionInput from './AdditionalActionInput';

import {
    WorkPlanBody,
    workplanSchema,
    PartialWorkPlan,
} from './schema';
import i18n from './i18n.json';
import styles from './styles.module.css';

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
    } = useOutletContext<PerProcessOutletContext>();

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

    const {
        pending: prioritizationPending,
        response: prioritizationResponse,
    } = useRequest({
        skip: isNotDefined(statusResponse?.prioritization),
        url: '/api/v2/per-prioritization/{id}/',
        pathVariables: {
            id: Number(statusResponse?.prioritization),
        },
    });

    const workplanId = statusResponse?.workplan;
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
        pathVariables: statusResponse && isDefined(statusResponse.workplan)
            ? { id: statusResponse.workplan }
            : undefined,
        method: 'PUT',
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
                        return value?.prioritized_action_responses?.[response_index]?.component;
                    }
                    match = matchArray(locations, ['additional_action_responses', NUM]);
                    if (isDefined(match)) {
                        const [response_index] = match;
                        return value?.additional_action_responses?.[response_index]?.client_id;
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

    const {
        setValue: setComponentValue,
    } = useFormArray<'prioritized_action_responses', NonNullable<PartialWorkPlan['prioritized_action_responses']>[number]>(
        'prioritized_action_responses',
        setFieldValue,
    );

    const {
        setValue: setCustomComponentValue,
        removeValue: removeCustomComponentValue,
    } = useFormArray<'additional_action_responses', NonNullable<PartialWorkPlan['additional_action_responses']>[number]>(
        'additional_action_responses',
        setFieldValue,
    );

    const handleSubmit = useCallback(
        (formValues: PartialWorkPlan) => {
            if (isNotDefined(statusResponse?.workplan)) {
                // eslint-disable-next-line no-console
                console.error('WorkPlan id not defined');
                return;
            }

            // TODO: we might have to revisit this logic
            savePerWorkPlan({
                ...formValues,
                is_draft: formValues?.is_draft ?? true,
            } as WorkPlanBody);
        },
        [savePerWorkPlan, statusResponse?.workplan],
    );

    const handleFinalSubmit = useCallback(
        (formValues: PartialWorkPlan) => {
            if (isNotDefined(statusResponse?.workplan)) {
                // eslint-disable-next-line no-console
                console.error('WorkPlan id not defined');
                return;
            }
            savePerWorkPlan({
                ...formValues,
                is_draft: false,
            } as WorkPlanBody);
        },
        [savePerWorkPlan, statusResponse?.workplan],
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

    const error = getErrorObject(formError);

    const handleFormSubmit = createSubmitHandler(validate, setError, handleSubmit);
    const handleFormFinalSubmit = createSubmitHandler(validate, setError, handleFinalSubmit);
    const pending = prioritizationPending
        || fetchingWorkPlan;

    const componentResponseError = getErrorObject(error?.prioritized_action_responses);
    const customComponentError = getErrorObject(error?.additional_action_responses);

    const readOnlyMode = isNotDefined(statusResponse)
        || isNotDefined(statusResponse.phase)
        || statusResponse.phase < PER_PHASE_WORKPLAN;

    if (fetchingStatus || fetchingWorkPlan) {
        return (
            <Message
                pending
            />
        );
    }

    if (isNotDefined(workplanId)) {
        return (
            <FormFailedToLoadMessage
                // FIXME: use translation
                description="Resource not found"
            />
        );
    }

    if (isDefined(workPlanResponseError)) {
        return (
            <FormFailedToLoadMessage
                description={workPlanResponseError.value.messageForNotification}
            />
        );
    }

    return (
        <Container
            className={styles.perWorkPlanForm}
            childrenContainerClassName={styles.content}
            footerActions={value.is_draft !== false && (
                <ConfirmButton
                    name={undefined}
                    variant="secondary"
                    onConfirm={handleFormFinalSubmit}
                    disabled={pending || savePerWorkPlanPending || readOnlyMode}
                    confirmHeading={strings.confirmHeading}
                    confirmMessage={strings.confirmMessage}
                >
                    {strings.saveAndFinalizeWorkPlan}
                </ConfirmButton>
            )}
            spacing="relaxed"
        >
            <NonFieldError
                error={formError}
                withFallbackError
            />
            {pending && (
                <BlockLoading />
            )}
            {!pending && (
                <>
                    <div className={styles.overview}>
                        <TextOutput
                            label={strings.workPlanDate}
                            value={workPlanResponse?.overview_details?.workplan_development_date}
                            strongValue
                        />
                        <div className={styles.responsible}>
                            <TextOutput
                                label={strings.perResponsibleLabel}
                                value={workPlanResponse?.overview_details?.ns_focal_point_name}
                                // eslint-disable-next-line max-len
                                description={workPlanResponse?.overview_details?.ns_focal_point_email}
                                strongValue
                            />
                            {isDefined(statusResponse?.id) && (
                                <Link
                                    to="perOverviewForm"
                                    urlParams={{ perId: statusResponse?.id }}
                                    variant="secondary"
                                >
                                    {strings.editResponsibleButtonLabel}
                                </Link>
                            )}
                        </div>
                    </div>
                    <Container
                        className={styles.prioritizedComponents}
                        heading={strings.prioritizedComponentsHeading}
                        childrenContainerClassName={styles.componentList}
                        withHeaderBorder
                        withInternalPadding
                        spacing="comfortable"
                    >
                        {/* eslint-disable-next-line max-len */}
                        {prioritizationResponse?.prioritized_action_responses?.map((componentResponse) => (
                            <PrioritizedActionInput
                                key={componentResponse.component}
                                index={componentResponseMapping[componentResponse.component]?.index}
                                value={componentResponseMapping[componentResponse.component]?.value}
                                onChange={setComponentValue}
                                component={componentResponse.component_details}
                                error={componentResponseError?.[componentResponse.component]}
                                readOnly={readOnlyMode}
                            />
                        ))}
                    </Container>
                    <Container
                        className={styles.actions}
                        childrenContainerClassName={styles.actionList}
                        heading={strings.actionsHeading}
                        withHeaderBorder
                        withInternalPadding
                        spacing="comfortable"
                        actions={(
                            <Button
                                name={undefined}
                                variant="secondary"
                                onClick={handleAddCustomActivity}
                                icons={<AddLineIcon />}
                                disabled={readOnlyMode}
                            >
                                {strings.addActionButtonLabel}
                            </Button>
                        )}
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
                            />
                        ))}
                        {(value?.additional_action_responses?.length ?? 0) === 0 && (
                            <div>
                                {strings.noActionsLabel}
                            </div>
                        )}
                    </Container>
                    {actionDivRef?.current && (
                        <Portal container={actionDivRef.current}>
                            <Button
                                name={undefined}
                                onClick={handleFormSubmit}
                                variant="secondary"
                                disabled={readOnlyMode}
                            >
                                {strings.saveButtonLabel}
                            </Button>
                        </Portal>
                    )}
                </>
            )}
        </Container>
    );
}

Component.displayName = 'PerWorkPlanForm';
