import { useCallback } from 'react';
import {
    createSubmitHandler,
    useForm,
    useFormArray
} from '@togglecorp/toggle-form';
import {
    _cs,
    listToGroupList,
    listToMap,
    mapToList,
} from '@togglecorp/fujs';
import {
    ListResponse,
    useRequest,
} from '#utils/restRequest';
import {
    PartialPrioritization,
    Prioritization,
    prioritizationSchema
} from '../usePerProcessOptions';
import { PerFormQuestionItem } from '../common';
import ComponentsInput from './ComponentInput';
import useTranslation from '#hooks/useTranslation';
import Button from '#components/Button';
import BlockLoading from '#components/BlockLoading';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    className?: string;
}

function PrioritizationForm(props: Props) {
    const strings = useTranslation(i18n);

    const {
        className,
    } = props;

    const {
        value,
        validate,
        setFieldValue,
        setError: onErrorSet,
    } = useForm(prioritizationSchema,
        {
            value: {},
        },
    );

    const {
        pending: questionsPending,
        response: questionsResponse,
    } = useRequest<ListResponse<PerFormQuestionItem>>({
        url: 'api/v2/per-formquestion/',
        query: {
            limit: 500,
        },
    });

    const {
        setValue: setBenchmarkValue,
        // removeValue: removeBenchmarkValue,
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

    const componentGroupedQuestion = listToGroupList(
        questionsResponse?.results ?? [],
        (component) => component.id,
    );

    const componentGroupedQuestionList = mapToList(
        componentGroupedQuestion,
        (list) => ({
            component: list[0].component,
            question: list,
        }),
    );

    return (
        <form
            onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
            className={styles.prioritizationTable}
        >
            {questionsPending && (
                <BlockLoading />
            )}
            {questionsResponse?.results?.map((component) => (
                <ComponentsInput
                    key={component.id}
                    questions={componentGroupedQuestion[component.id]}
                    index={componentResponseMapping[component.id]?.index}
                    value={componentResponseMapping[component.id]?.value}
                    onChange={setBenchmarkValue}
                    component={component}
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

export default PrioritizationForm;
