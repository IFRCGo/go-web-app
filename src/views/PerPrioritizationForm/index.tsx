import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { useCallback, useContext } from 'react';
import {
    createSubmitHandler,
    useForm,
    useFormArray,
} from '@togglecorp/toggle-form';
import { isDefined, isNotDefined, listToMap } from '@togglecorp/fujs';
import {
    ListResponse,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import RouteContext from '#contexts/route';
import useTranslation from '#hooks/useTranslation';
import Button from '#components/Button';
import BlockLoading from '#components/BlockLoading';
import useAlert from '#hooks/useAlert';

import {
    PartialPrioritization,
    Prioritization,
    prioritizationSchema,
    PerFormComponentItem,
    PrioritizationResponseFields,
} from './common';
import ComponentInput from './ComponentInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface PerProcessStatusItem {
    assessment: number | null;
    prioritization: number | null;
    workplan: number | null;

    assessment_number: number;
    country: number;
    country_details: {
        iso3: string | null;
        name: string;
    };
    date_of_assessment: string;
    id: number;
}

interface AssessmentResponse {
    area_responses: {
        component_responses: {
            component: number
            question_responses: {
                id: number;
                question: number;
                answer: number;
                notes: string;
            }[];
        }[];
    }[];
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { perId } = useParams<{ perId: string }>();
    const navigate = useNavigate();
    const alert = useAlert();
    const strings = useTranslation(i18n);
    const { perWorkPlanForm: perWorkPlanFormRoute } = useContext(RouteContext);

    const {
        value,
        validate,
        setValue,
        setFieldValue,
        setError: onErrorSet,
    } = useForm(
        prioritizationSchema,
        {
            value: {
                overview: isDefined(perId) ? Number(perId) : undefined,
            },
        },
    );

    const {
        setValue: setComponentValue,
        removeValue: removeComponentValue,
    } = useFormArray('component_responses', setFieldValue);

    const {
        pending: statusPending,
        response: statusRepsonse,
    } = useRequest<PerProcessStatusItem>({
        skip: isNotDefined(perId),
        url: `api/v2/per-process-status/${perId}`,
    });

    const {
        pending: formComponentPending,
        response: formComponentResponse,
    } = useRequest<ListResponse<PerFormComponentItem>>({
        url: 'api/v2/per-formcomponent/',
        query: {
            limit: 500,
        },
    });

    const { pending: prioritizationPending } = useRequest<PrioritizationResponseFields>({
        skip: isNotDefined(statusRepsonse?.prioritization),
        url: `api/v2/per-prioritization/${statusRepsonse?.prioritization}`,
        onSuccess: (response) => {
            setValue(response);
        },
    });
    const {
        pending: perAssesmentPending,
        response: perAssessmentResponse,
    } = useRequest<AssessmentResponse>({
        skip: isNotDefined(statusRepsonse?.assessment),
        url: `api/v2/per-assessment/${statusRepsonse?.assessment}`,
    });

    const componentResponses = perAssessmentResponse?.area_responses.flatMap(
        (areaResponse) => areaResponse.component_responses,
    ) ?? [];

    const questionResponsesByComponent = listToMap(
        componentResponses,
        (componentResponse) => componentResponse.component,
        (componentResponse) => componentResponse.question_responses,
    );

    const {
        pending: savePerPrioritizationPending,
        trigger: savePerPrioritization,
    } = useLazyRequest<PrioritizationResponseFields, Partial<Prioritization>>({
        url: `api/v2/per-prioritization/${statusRepsonse?.prioritization}`,
        method: 'PUT',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            if (response && isDefined(response.id)) {
                alert.show(
                    strings.perFormSaveRequestSuccessMessage,
                    { variant: 'success' },
                );

                navigate(
                    generatePath(
                        perWorkPlanFormRoute.absolutePath,
                        { perId: String(perId) },
                    ),
                );
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

    const handleSubmit = useCallback((formValues: PartialPrioritization) => {
        const prioritization = statusRepsonse?.prioritization;
        if (isNotDefined(prioritization)) {
            // eslint-disable-next-line no-console
            console.error('Prioritization id not defined');
        }
        savePerPrioritization(formValues as Prioritization);
    }, [savePerPrioritization, statusRepsonse]);

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
        || statusPending
        || perAssesmentPending
        || prioritizationPending;

    return (
        <form
            onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
            className={styles.perPrioritizationForm}
        >
            {pending && (
                <BlockLoading />
            )}
            {!pending && formComponentResponse?.results?.map((component) => (
                <ComponentInput
                    key={component.id}
                    index={componentResponseMapping[component.id]?.index}
                    value={componentResponseMapping[component.id]?.value}
                    onChange={setComponentValue}
                    component={component}
                    onSelectionChange={handleSelectionChange}
                    questionResponses={questionResponsesByComponent[component.id]}
                />
            ))}
            {!pending && (
                <div className={styles.actions}>
                    <Button
                        type="submit"
                        name="submit"
                        variant="secondary"
                        disabled={savePerPrioritizationPending}
                    >
                        {strings.perSelectAndAddToWorkPlan}
                    </Button>
                </div>
            )}
        </form>
    );
}

Component.displayName = 'PerPrioritizationForm';
