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
import { STEP_PRIORITIZATION, PerProcessOutletContext } from '#utils/per';
import RouteContext from '#contexts/route';
import useTranslation from '#hooks/useTranslation';
import Portal from '#components/Portal';
import Button from '#components/Button';
import ConfirmButton from '#components/ConfirmButton';
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
                strings.perFormSaveRequestFailureMessage,
                {
                    variant: 'danger',
                    debugMessage,
                    description: messageForNotification,
                },
            );
        },
    });

    const assessmentComponentResponses = perAssessmentResponse?.area_responses.flatMap(
        (areaResponse) => areaResponse.component_responses,
    ) ?? [];

    const assessmentComponentResponseMap = listToMap(
        assessmentComponentResponses,
        (componentResponse) => componentResponse.component,
    );

    const assessmentQuestionResponsesByComponent = listToMap(
        assessmentComponentResponses,
        (componentResponse) => componentResponse.component,
        (componentResponse) => componentResponse.question_responses,
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
        });
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
        });
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

    return (
        <form
            onSubmit={handleFormSubmit}
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
            <div className={styles.componentList}>
                {!pending && formComponentResponse?.results?.map((component) => {
                    const rating = assessmentComponentResponseMap?.[component.id]?.rating_details;
                    const ratingDisplay = rating ? `${rating.value} - ${rating.title}` : undefined;

                    return (
                        <ComponentInput
                            key={component.id}
                            index={componentResponseMapping[component.id]?.index}
                            value={componentResponseMapping[component.id]?.value}
                            onChange={setComponentValue}
                            component={component}
                            onSelectionChange={handleSelectionChange}
                            questionResponses={assessmentQuestionResponsesByComponent[component.id]}
                            ratingDisplay={ratingDisplay}
                        />
                    );
                })}
            </div>
            {!pending && (
                <div className={styles.actions}>
                    <ConfirmButton
                        name={undefined}
                        variant="secondary"
                        onConfirm={handleFormFinalSubmit}
                        disabled={savePerPrioritizationPending
                            || statusResponse?.phase !== STEP_PRIORITIZATION}
                        confirmHeading={strings.perPrioritizationConfirmHeading}
                        confirmMessage={strings.perPrioritizationConfirmMessage}
                    >
                        {strings.perSelectAndAddToWorkPlan}
                    </ConfirmButton>
                </div>
            )}
            {actionDivRef.current && (
                <Portal container={actionDivRef?.current}>
                    <Button
                        name={undefined}
                        variant="secondary"
                        onClick={handleFormSubmit}
                        disabled={savePerPrioritizationPending
                            || statusResponse?.phase !== STEP_PRIORITIZATION}
                    >
                        {strings.perPrioritizationSaveLabel}
                    </Button>
                </Portal>
            )}
        </form>
    );
}

Component.displayName = 'PerPrioritizationForm';
