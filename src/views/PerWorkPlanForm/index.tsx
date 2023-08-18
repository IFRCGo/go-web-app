import { useCallback, useMemo, useContext } from 'react';
import { AddLineIcon } from '@ifrc-go/icons';
import {
    useOutletContext,
    useNavigate,
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

import Button from '#components/Button';
import Container from '#components/Container';
import BlockLoading from '#components/BlockLoading';
import ConfirmButton from '#components/ConfirmButton';
import TextOutput from '#components/TextOutput';
import Portal from '#components/Portal';
import {
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import { type PerProcessOutletContext } from '#utils/outletContext';
import { PER_PHASE_WORKPLAN } from '#utils/domain/per';
import useTranslation from '#hooks/useTranslation';
import useAlert from '#hooks/useAlert';
import RouteContext from '#contexts/route';

import CustomComponentInput from './CustomComponentInput';
import ComponentInput from './ComponentInput';

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
    const navigate = useNavigate();
    const alert = useAlert();
    const {
        statusResponse,
        actionDivRef,
        refetchStatusResponse,
    } = useOutletContext<PerProcessOutletContext>();
    const {
        accountPerForms: accountPerFromsRoute,
    } = useContext(RouteContext);

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

    const {
        response: workPlanResponse,
        pending: workPlanPending,
    } = useRequest({
        skip: isNotDefined(statusResponse?.workplan),
        url: '/api/v2/per-work-plan/{id}/',
        pathVariables: {
            id: Number(statusResponse?.workplan),
        },
        onSuccess: (response) => {
            const {
                custom_component_responses,
                ...remainingWorkPlan
            } = response;

            setValue({
                ...remainingWorkPlan,
                custom_component_responses: custom_component_responses?.map(
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
                value?.component_responses ?? [],
                (componentResponse) => componentResponse.component,
                (componentResponse, _, index) => ({
                    index,
                    value: componentResponse,
                }),
            )
        ),
        [value?.component_responses],
    );

    const customComponentResponseMapping = useMemo(
        () => (
            listToMap(
                value?.custom_component_responses ?? [],
                (customComponentResponse) => customComponentResponse.client_id,
                (customComponentResponse, _, index) => ({
                    index,
                    value: customComponentResponse,
                }),
            )
        ),
        [value?.custom_component_responses],
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
            if (!response) {
                // TODO: show proper error message
                return;
            }

            refetchStatusResponse();

            alert.show(
                strings.saveRequestSuccessMessage,
                { variant: 'success' },
            );

            if (response.is_draft === false) {
                navigate(accountPerFromsRoute.absolutePath);
            }
        },
        onFailure: ({
            value: {
                messageForNotification,
                formErrors,
            },
            debugMessage,
        }) => {
            const componentIndexMapping = listToMap(
                value?.component_responses ?? [],
                (_, index) => index,
                (componentResponse, _, index) => ({
                    index,
                    value: componentResponse,
                }),
            );

            const customComponentIndexMapping = listToMap(
                value?.custom_component_responses ?? [],
                (_, index) => index,
                (customComponentResponse, _, index) => ({
                    index,
                    value: customComponentResponse,
                }),
            );

            // TODO: add proper typing for errors
            const transformedError = {
                component_responses: listToMap(
                    formErrors?.component_responses as Record<string, string[]>[] ?? [],
                    (_, index) => (
                        componentIndexMapping?.[index].value.component
                    ),
                ),
                custom_component_responses: listToMap(
                    formErrors?.custom_component_responses as Record<string, string[]>[] ?? [],
                    (_, index) => (
                        customComponentIndexMapping?.[index].value.client_id
                    ),
                ),
            };
            setError(transformedError);
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
    } = useFormArray<'component_responses', NonNullable<PartialWorkPlan['component_responses']>[number]>(
        'component_responses',
        setFieldValue,
    );

    const {
        setValue: setCustomComponentValue,
        removeValue: removeCustomComponentValue,
    } = useFormArray<'custom_component_responses', NonNullable<PartialWorkPlan['custom_component_responses']>[number]>(
        'custom_component_responses',
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
                is_draft: true,
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
        const newCustomActivity: NonNullable<PartialWorkPlan['custom_component_responses']>[number] = {
            client_id: randomString(),
        };

        setFieldValue(
            (oldValue?: PartialWorkPlan['custom_component_responses']) => {
                if (oldValue) {
                    return [
                        ...oldValue,
                        newCustomActivity,
                    ];
                }

                return [newCustomActivity];
            },
            'custom_component_responses',
        );
    }, [setFieldValue]);

    const error = getErrorObject(formError);

    const handleFormSubmit = createSubmitHandler(validate, setError, handleSubmit);
    const handleFormFinalSubmit = createSubmitHandler(validate, setError, handleFinalSubmit);
    const pending = prioritizationPending
        || workPlanPending;

    const componentResponseError = getErrorObject(error?.component_responses);
    const customComponentError = getErrorObject(error?.custom_component_responses);

    const readOnlyMode = statusResponse?.phase !== PER_PHASE_WORKPLAN;

    return (
        <Container
            className={styles.perWorkPlanForm}
            childrenContainerClassName={styles.content}
            footerActions={(
                <ConfirmButton
                    name={undefined}
                    variant="secondary"
                    onConfirm={handleFormFinalSubmit}
                    disabled={savePerWorkPlanPending
                        || readOnlyMode}
                    confirmHeading={strings.confirmHeading}
                    confirmMessage={strings.confirmMessage}
                >
                    {strings.saveAndFinalizeWorkPlan}
                </ConfirmButton>
            )}
            spacing="loose"
        >
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
                        <TextOutput
                            label={strings.perResponsibleLabel}
                            value={workPlanResponse?.overview_details?.ns_focal_point_name}
                            description={workPlanResponse?.overview_details?.ns_focal_point_email}
                            strongValue
                        />
                    </div>
                    <Container
                        className={styles.prioritizedComponents}
                        heading={strings.prioritizedComponentsHeading}
                        childrenContainerClassName={styles.componentList}
                        withHeaderBorder
                        withInternalPadding
                        spacing="loose"
                    >
                        {prioritizationResponse?.component_responses?.map((componentResponse) => (
                            <ComponentInput
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
                        spacing="loose"
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
                        {value?.custom_component_responses?.map((customComponent, i) => (
                            <CustomComponentInput
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
                        {(value?.custom_component_responses?.length ?? 0) === 0 && (
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

Component.displayName = 'PerWorkPlan';
