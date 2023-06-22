import { useCallback, useMemo } from 'react';
import { IoAdd } from 'react-icons/io5';
import { useOutletContext } from 'react-router-dom';
import {
    isDefined,
    isTruthyString,
    isNotDefined,
    listToMap,
    randomString,
} from '@togglecorp/fujs';

import {
    createSubmitHandler,
    useForm,
    useFormArray,
} from '@togglecorp/toggle-form';

import Button from '#components/Button';
import Container from '#components/Container';
import BlockLoading from '#components/BlockLoading';
import {
    compareLabel,
    isValidCountry,
} from '#utils/common';
import {
    useLazyRequest,
    useRequest,
    ListResponse,
} from '#utils/restRequest';
import useTranslation from '#hooks/useTranslation';
import useAlert from '#hooks/useAlert';
import type { GET } from '#types/serverResponse';
import {
    workplanSchema,
    PartialWorkPlan,
} from './common';
import CustomComponentInput from './CustomComponentInput';

import i18n from './i18n.json';

import styles from './styles.module.css';
import ComponentInput from './ComponentInput';

interface CountryResponse {
    id: number;
    iso: string;
    name : string;
    overview: null;
    region: number;
    society_name: string;
    society_url: string;
    independent: boolean | null;
    is_deprecated: boolean | null;
}

interface PerProcessStatusItem {
    id: number;
    assessment: number | null;
    prioritization: number | null;
    workplan: number | null;
}

const defaultValue: PartialWorkPlan = {
};

type WorkPlanResponse = GET['api/v2/per-work-plan/:id'];

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const alert = useAlert();

    const {
        value,
        validate,
        setFieldValue,
        setError,
        setValue,
    } = useForm(
        workplanSchema,
        { value: defaultValue },
    );

    const { statusResponse } = useOutletContext<{ statusResponse: PerProcessStatusItem }>();
    const {
        pending: perOptionsPending,
        response: perOptionsResponse,
    } = useRequest<GET['api/v2/per-options']>({
        url: 'api/v2/per-options/',
    });

    const {
        pending: countryiesPending,
        response: countriesResponse,
    } = useRequest<ListResponse<CountryResponse>>({
        url: 'api/v2/country',
    });

    const nsOptions = countriesResponse?.results.filter(
        (country) => isValidCountry(country) && isTruthyString(country.society_name),
    ).map(
        (country) => ({ value: country.id, label: country.society_name }),
    );

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

    const {
        trigger: savePerWorkPlan,
    } = useLazyRequest<WorkPlanResponse, PartialWorkPlan>({
        url: `api/v2/per-work-plan/${statusResponse?.workplan}`,
        method: 'POST',
        body: (ctx) => ctx,
        onSuccess: () => {
            alert.show(
                strings.perFormSaveRequestSuccessMessage,
                { variant: 'success' },
            );
        },
        onFailure: ({
            value: {
                messageForNotification,
                // formErrors,
            },
            debugMessage,
        }) => {
            alert.show(
                <p>
                    {strings.perFormSaveRequestFailureMessage}
                    &nbsp;
                    <strong>
                        {messageForNotification}
                    </strong>
                </p>,
                {
                    variant: 'danger',
                    debugMessage,
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
        setValue: setCustomComponentValue,
        removeValue: removeCustomComponentValue,
    } = useFormArray<'custom_component_responses', NonNullable<PartialWorkPlan['custom_component_responses']>[number]>(
        'custom_component_responses',
        setFieldValue,
    );

    const handleSubmit = useCallback(
        (formValues: PartialWorkPlan) => {
            if (isDefined(statusResponse?.workplan)) {
                savePerWorkPlan(formValues);
            } else {
                // eslint-disable-next-line no-console
                console.error('WorkPlan id not defined');
            }
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

    const componentResponseMapping = listToMap(
        value?.component_responses ?? [],
        (componentResponse) => componentResponse.component,
        (componentResponse, _, index) => ({
            index,
            value: componentResponse,
        }),
    );

    const customComponentResponseMapping = listToMap(
        value?.custom_component_responses ?? [],
        (customComponentResponse) => customComponentResponse.client_id,
        (customComponentResponse, _, index) => ({
            index,
            value: customComponentResponse,
        }),
    );

    const pending = perOptionsPending
        || prioritizationPending
        || workPlanPending
        || countryiesPending;

    return (
        <form
            className={styles.perWorkPlanForm}
            onSubmit={createSubmitHandler(validate, setError, handleSubmit)}
        >
            {pending && (
                <BlockLoading />
            )}
            {!pending && (
                <>
                    <Container
                        heading="Prioritized Components"
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
                                nsOptions={nsOptions}
                            />
                        ))}
                    </Container>
                    <Container
                        childrenContainerClassName={styles.actionList}
                        heading="Actions"
                        withHeaderBorder
                        actions={(
                            <Button
                                name={undefined}
                                variant="secondary"
                                onClick={handleAddCustomActivity}
                                icons={<IoAdd />}
                            >
                                Add an Action
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
                                nsOptions={nsOptions}
                            />
                        ))}
                        {(value?.custom_component_responses?.length ?? 0) === 0 && (
                            <div>
                                No Actions
                            </div>
                        )}
                    </Container>
                    <div className={styles.formActions}>
                        <Button
                            name="submit"
                            type="submit"
                            variant="secondary"
                        >
                            {strings.perFormSaveAndFinalizeWorkPlan}
                        </Button>
                    </div>
                </>
            )}

        </form>
    );
}

Component.displayName = 'PerWorkPlan';
