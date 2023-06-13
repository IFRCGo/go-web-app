import { useCallback } from 'react';
import {
    createSubmitHandler,
    useForm,
    useFormArray,
} from '@togglecorp/toggle-form';
import { listToMap } from '@togglecorp/fujs';
import {
    ListResponse,
    useRequest,
} from '#utils/restRequest';
import useTranslation from '#hooks/useTranslation';
import Button from '#components/Button';
import BlockLoading from '#components/BlockLoading';
import {
    PartialPrioritization,
    Prioritization,
    prioritizationSchema,
    PerFormComponentItem,
} from './common';
import ComponentInput from './ComponentInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        value,
        validate,
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

    const handleSubmit = useCallback((finalValues: PartialPrioritization) => {
        console.warn('Final values', finalValues as Prioritization);
        // TODO: transform the values
    }, []);

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
