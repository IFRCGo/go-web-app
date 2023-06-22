import { useCallback, useContext } from 'react';
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
} from '@togglecorp/toggle-form';
import { isDefined, isNotDefined, listToMap } from '@togglecorp/fujs';
import {
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import { STEP_PRIORITIZATION } from '#utils/per';
import RouteContext from '#contexts/route';
import useTranslation from '#hooks/useTranslation';
import Button from '#components/Button';
import BlockLoading from '#components/BlockLoading';
import PerAssessmentSummary from '#components/PerAssessmentSummary';
import useAlert from '#hooks/useAlert';
import type { GET } from '#types/serverResponse';

import { prioritizationSchema } from './common';
import type { PartialPrioritization } from './common';
import ComponentInput from './ComponentInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { perId } = useParams<{ perId: string }>();
    const navigate = useNavigate();
    const alert = useAlert();
    const strings = useTranslation(i18n);
    const { perWorkPlanForm: perWorkPlanFormRoute } = useContext(RouteContext);

    type StatusContextValue = {
        statusResponse: GET['api/v2/per-process-status/:id'],
        refetchStatusResponse: () => void,
    }

    const {
        statusResponse,
        refetchStatusResponse,
    } = useOutletContext<StatusContextValue>();

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
        pending: formComponentPending,
        response: formComponentResponse,
    } = useRequest<GET['api/v2/per-formcomponent']>({
        url: 'api/v2/per-formcomponent/',
        query: {
            limit: 500,
        },
    });

    type PerFormQuestionResponse = GET['api/v2/per-formquestion'];
    const {
        response: perOptionsResponse,
    } = useRequest<GET['api/v2/per-options']>({
        url: 'api/v2/per-options',
        onSuccess: (response) => {
            setValue(response);
        },
    });
    const {
        response: questionsResponse,
    } = useRequest<PerFormQuestionResponse>({
        url: 'api/v2/per-formquestion/',
        query: {
            limit: 500,
        },
    });

    const { pending: prioritizationPending } = useRequest<GET['api/v2/per-prioritization/:id']>({
        skip: isNotDefined(statusResponse?.prioritization),
        url: `api/v2/per-prioritization/${statusResponse?.prioritization}`,
        onSuccess: (response) => {
            setValue(response);
        },
    });
    const {
        pending: perAssesmentPending,
        response: perAssessmentResponse,
    } = useRequest<GET['api/v2/per-assessment/:id']>({
        skip: isNotDefined(statusResponse?.assessment),
        url: `api/v2/per-assessment/${statusResponse?.assessment}`,
    });
    const {
        setValue: setComponentValue,
        removeValue: removeComponentValue,
    } = useFormArray('component_responses', setFieldValue);

    const {
        pending: savePerPrioritizationPending,
        trigger: savePerPrioritization,
    } = useLazyRequest<GET['api/v2/per-prioritization/:id'], PartialPrioritization>({
        url: `api/v2/per-prioritization/${statusResponse?.prioritization}/`,
        method: 'PUT',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            if (response && isDefined(response.id)) {
                alert.show(
                    strings.perFormSaveRequestSuccessMessage,
                    { variant: 'success' },
                );

                refetchStatusResponse();

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

    const componentResponses = perAssessmentResponse?.area_responses.flatMap(
        (areaResponse) => areaResponse.component_responses,
    ) ?? [];

    const questionResponsesByComponent = listToMap(
        componentResponses,
        (componentResponse) => componentResponse.component,
        (componentResponse) => componentResponse.question_responses,
    );

    const handleSubmit = useCallback((formValues: PartialPrioritization) => {
        const prioritization = statusResponse?.prioritization;
        if (isNotDefined(prioritization)) {
            // eslint-disable-next-line no-console
            console.error('Prioritization id not defined');
        }
        savePerPrioritization(formValues);
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

    return (
        <form
            onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
            className={styles.perPrioritizationForm}
        >
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
                        disabled={savePerPrioritizationPending
                            || statusResponse?.phase !== STEP_PRIORITIZATION}
                    >
                        {strings.perSelectAndAddToWorkPlan}
                    </Button>
                </div>
            )}
        </form>
    );
}

Component.displayName = 'PerPrioritizationForm';
