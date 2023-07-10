import { useCallback, useMemo, useContext } from 'react';
import { AddLineIcon } from '@ifrc-go/icons';
import {
    useOutletContext,
    useNavigate,
} from 'react-router-dom';
import {
    isNotDefined,
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
import Portal from '#components/Portal';
import { compareLabel } from '#utils/common';
import {
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import { STEP_WORKPLAN, PerProcessOutletContext } from '#utils/per';
import useTranslation from '#hooks/useTranslation';
import useAlert from '#hooks/useAlert';
import RouteContext from '#contexts/route';
import type { GET } from '#types/serverResponse';
import { paths } from '#generated/types';

import {
    workplanSchema,
    PartialWorkPlan,
} from './common';
import CustomComponentInput from './CustomComponentInput';
import ComponentInput from './ComponentInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

type CountryResponse = paths['/api/v2/country/']['get']['responses']['200']['content']['application/json'];

const defaultValue: PartialWorkPlan = {};
type WorkPlanResponse = GET['api/v2/per-work-plan/:id'];

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
        pending: perOptionsPending,
        response: perOptionsResponse,
    } = useRequest<GET['api/v2/per-options']>({
        url: 'api/v2/per-options/',
    });

    const {
        pending: countriesPending,
        response: countriesResponse,
    } = useRequest<CountryResponse>({
        url: 'api/v2/country',
        query: { limit: 500 },
    });

    const {
        pending: prioritizationPending,
        response: prioritizationResponse,
    } = useRequest<GET['api/v2/per-prioritization/:id']>({
        skip: isNotDefined(statusResponse?.prioritization),
        url: `api/v2/per-prioritization/${statusResponse?.prioritization}`,
    });

    const {
        pending: workPlanPending,
    } = useRequest<WorkPlanResponse>({
        skip: isNotDefined(statusResponse?.workplan),
        url: `api/v2/per-work-plan/${statusResponse?.workplan}`,
        onSuccess: (response) => {
            const {
                custom_component_responses,
                ...remainingWorkPlan
            } = response;

            setValue({
                ...remainingWorkPlan,
                custom_component_responses: custom_component_responses.map(
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
    } = useLazyRequest<WorkPlanResponse, PartialWorkPlan>({
        url: `api/v2/per-work-plan/${statusResponse?.workplan}/`,
        method: 'PUT',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            if (!response) {
                // TODO: show proper error message
                return;
            }

            refetchStatusResponse();

            alert.show(
                strings.perFormSaveRequestSuccessMessage,
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
                strings.perFormSaveRequestFailureMessage,
                {
                    variant: 'danger',
                    debugMessage,
                    description: messageForNotification,
                },
            );
        },
    });

    const workPlanStatusOptions = useMemo(
        () => (
            perOptionsResponse?.workplanstatus.map((d) => ({
                value: d.key,
                label: d.value,
            })).sort(compareLabel) ?? []
        ),
        [perOptionsResponse],
    );

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
            });
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
            });
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
    const pending = perOptionsPending
        || prioritizationPending
        || workPlanPending
        || countriesPending;

    const componentResponseError = getErrorObject(error?.component_responses);
    const customComponentError = getErrorObject(error?.custom_component_responses);

    return (
        <form className={styles.perWorkPlanForm}>
            {pending && (
                <BlockLoading />
            )}
            {!pending && (
                <>
                    <Container
                        heading={strings.perFormPrioritizedComponentsHeading}
                        childrenContainerClassName={styles.componentList}
                        withHeaderBorder
                    >
                        {prioritizationResponse?.component_responses?.map((componentResponse) => (
                            <ComponentInput
                                key={componentResponse.component}
                                index={componentResponseMapping[componentResponse.component]?.index}
                                value={componentResponseMapping[componentResponse.component]?.value}
                                onChange={setComponentValue}
                                component={componentResponse.component_details}
                                workPlanStatusOptions={workPlanStatusOptions}
                                countryResults={countriesResponse?.results}
                                error={componentResponseError?.[componentResponse.component]}
                            />
                        ))}
                    </Container>
                    <Container
                        childrenContainerClassName={styles.actionList}
                        heading={strings.perFormActionsHeading}
                        withHeaderBorder
                        actions={(
                            <Button
                                name={undefined}
                                variant="secondary"
                                onClick={handleAddCustomActivity}
                                icons={<AddLineIcon />}
                            >
                                {strings.perFormAddAnActionButton}
                            </Button>
                        )}
                    >
                        {value?.custom_component_responses?.map((customComponent) => (
                            <CustomComponentInput
                                key={customComponent.client_id}
                                index={
                                    customComponentResponseMapping[customComponent.client_id]?.index
                                }
                                value={
                                    customComponentResponseMapping[customComponent.client_id]?.value
                                }
                                onChange={setCustomComponentValue}
                                onRemove={removeCustomComponentValue}
                                workPlanStatusOptions={workPlanStatusOptions}
                                countryResults={countriesResponse?.results}
                                error={customComponentError?.[customComponent.client_id]}
                            />
                        ))}
                        {(value?.custom_component_responses?.length ?? 0) === 0 && (
                            <div>
                                {strings.perFormNoActionsLabel}
                            </div>
                        )}
                    </Container>
                    <div className={styles.formActions}>
                        <ConfirmButton
                            name={undefined}
                            variant="secondary"
                            onConfirm={handleFormFinalSubmit}
                            disabled={savePerWorkPlanPending
                                || statusResponse?.phase !== STEP_WORKPLAN}
                            confirmHeading={strings.perWorkPlanConfirmHeading}
                            confirmMessage={strings.perWorkPlanConfirmMessage}
                        >
                            {strings.perFormSaveAndFinalizeWorkPlan}
                        </ConfirmButton>
                    </div>
                    {actionDivRef?.current && (
                        <Portal container={actionDivRef.current}>
                            <Button
                                name={undefined}
                                onClick={handleFormSubmit}
                                variant="secondary"
                                disabled={statusResponse?.phase !== STEP_WORKPLAN}
                            >
                                Save
                            </Button>
                        </Portal>
                    )}
                </>
            )}
        </form>
    );
}

Component.displayName = 'PerWorkPlan';
