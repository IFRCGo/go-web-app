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
import {
    PartialPrioritization,
    Prioritization,
    prioritizationSchema,
    PerFormComponentItem,
    PrioritizationResponseFields,
} from './common';
import ComponentInput from './ComponentInput';
import useAlert from '#hooks/useAlert';

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

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { perId } = useParams<{ perId: string }>();
    const navigate = useNavigate();

    const {
        pending: perProcessStatusPending,
        response: perProcessStatusResponse,
    } = useRequest<PerProcessStatusItem>({
        skip: isNotDefined(perId),
        url: `api/v2/per-process-status/${perId}`,
    });

    const strings = useTranslation(i18n);

    const {
        perWorkPlanForm: perWorkPlanFormRoute,
    } = useContext(RouteContext);

    const {
        value,
        validate,
        setValue,
        setFieldValue,
        setError: onErrorSet,
    } = useForm(
        prioritizationSchema,
        {
            value: {},
        },
    );

    const {
        pending: perFormComponentPending,
        response: perFormComponentResponse,
    } = useRequest<ListResponse<PerFormComponentItem>>({
        url: 'api/v2/per-formcomponent/',
        query: {
            limit: 500,
        },
    });

    const {
        setValue: setComponentValue,
        removeValue: removeComponentValue,
    } = useFormArray('component_responses', setFieldValue);

    const alert = useAlert();

    const {
        trigger: savePerPrioritization,
    } = useLazyRequest<PrioritizationResponseFields, Partial<Prioritization>>({
        url: `api/v2/per-prioritization/${perProcessStatusResponse?.prioritization}`,
        method: 'POST',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            if (response && isNotDefined(perId) && isDefined(response.id)) {
                navigate(
                    generatePath(
                        perWorkPlanFormRoute.absolutePath,
                        { perId: String(response.id) },
                    ),
                );
            }

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

    const handleSubmit = useCallback(
        (formValues: PartialPrioritization) => {
            console.warn('Final values', formValues as Prioritization);
            if (isDefined(perProcessStatusResponse?.assessment)) {
                savePerPrioritization(formValues as Prioritization);
            } else {
                console.error('Prioritization id not defined');
            }
        }, [savePerPrioritization]);

    const componentResponseMapping = listToMap(
        value?.component_responses ?? [],
        (componentResponse) => componentResponse.component_id,
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
                justification: '',
                component_id: componentId,
            }, index);
        },
        [removeComponentValue, setComponentValue],
    );

    return (
        <form
            onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
            className={styles.perPrioritizationForm}
        >
            {perFormComponentPending && (
                <BlockLoading />
            )}
            {perFormComponentResponse?.results?.map((component) => (
                <ComponentInput
                    key={component.id}
                    index={componentResponseMapping[component.id]?.index}
                    value={componentResponseMapping[component.id]?.value}
                    onChange={setComponentValue}
                    component={component}
                    onSelectionChange={handleSelectionChange}
                />
            ))}
            <div className={styles.actions}>
                <Button
                    type="submit"
                    name="submit"
                    variant="secondary"
                >
                    {strings.perSelectAndAddToWorkPlan}
                </Button>
            </div>
        </form>
    );
}

Component.displayName = 'PerPrioritizationForm';
