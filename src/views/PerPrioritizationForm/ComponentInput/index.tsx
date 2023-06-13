import { useState, useCallback } from 'react';
import { SetValueArg, useFormObject } from '@togglecorp/toggle-form';

import ExpandableContainer from '#components/ExpandableContainer';
import BlockLoading from '#components/BlockLoading';
import TextInput from '#components/TextInput';
import Checkbox from '#components/Checkbox';
import {
    ListResponse,
    useRequest,
} from '#utils/restRequest';

import {
    PartialPrioritization,
    PerFormComponentItem,
} from '../common';
import QuestionOutput from './QuestionOutput';

import styles from './styles.module.css';

type Value = NonNullable<PartialPrioritization['component_responses']>[number];

interface PerFormQuestionItem {
    id: number;
    question: string;
}

interface Props {
    value?: Value;
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    index: number;
    component: PerFormComponentItem;
    onSelectionChange: (checked: boolean, index: number, componentId: number) => void;
}

function ComponentsInput(props: Props) {
    const {
        index,
        value,
        onChange,
        component,
        onSelectionChange,
    } = props;

    const [expanded, setExpanded] = useState(false);
    const {
        pending: perFormQuestionPending,
        response: perFormQuestionResponse,
    } = useRequest<ListResponse<PerFormQuestionItem>>({
        skip: !expanded,
        url: 'api/v2/per-formquestion/',
        query: {
            limit: 500,
            component: component.id,
        },
    });

    const onFieldChange = useFormObject(
        index,
        onChange,
        () => ({
            component_id: component.id,
        }),
    );

    const handleCheck = useCallback((checked: boolean, checkIndex: number) => {
        onSelectionChange(checked, checkIndex, component.id);
    }, [component.id, onSelectionChange]);

    return (
        <ExpandableContainer
            className={styles.componentInput}
            onExpansionChange={setExpanded}
            headingContainerClassName={styles.header}
            heading={`${component?.component_num}. ${component.title}`}
            icons={(
                <Checkbox
                    name={index}
                    value={!!value}
                    onChange={handleCheck}
                />
            )}
            actions={(
                <TextInput
                    name="justification"
                    value={value?.justification}
                    onChange={onFieldChange}
                    placeholder="Enter Justification"
                    disabled={!value}
                />
            )}
        >
            {perFormQuestionPending && (
                <BlockLoading />
            )}
            {perFormQuestionResponse && perFormQuestionResponse.results.map(
                (perFormQuestion) => (
                    <QuestionOutput
                        key={perFormQuestion.id}
                        question={perFormQuestion}
                    />
                ),
            )}
        </ExpandableContainer>
    );
}

export default ComponentsInput;
