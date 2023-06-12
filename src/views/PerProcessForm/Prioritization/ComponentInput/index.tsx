import { _cs } from '@togglecorp/fujs';
import { SetValueArg, useFormArray, useFormObject } from '@togglecorp/toggle-form';

import ExpandableContainer from '#components/ExpandableContainer';
import {
    PerFormComponentItem,
     PerFormQuestionItem,
} from '../../common';
import TextInput from '#components/TextInput';
import { PartialPrioritization } from '#views/PerProcessForm/usePerProcessOptions';
import Container from '#components/Container';

import styles from './styles.module.css';

type Value = NonNullable<PartialPrioritization['component_responses']>[number];

interface Props {
    value?: Value;
    questions: PerFormQuestionItem[];
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    index: number;
    component: PerFormComponentItem;
}

function ComponentsInput(props: Props) {
    const {
        index,
        value,
        questions,
        onChange,
        component,
    } = props;

    const onFieldChange = useFormObject(
        index,
        onChange,
        () => ({
            component_id: component.id,
        })
    );

    return (
        <ExpandableContainer
            className={_cs(styles.customActivity, styles.errored)}
            key={component.component_id}
            heading={`${component?.component_num}. ${component.title}`}
            actions={
                <TextInput
                    className={styles.improvementSelect}
                    name="justification"
                    value={value?.justification}
                    onChange={onFieldChange}
                />
            }
        >
            {questions?.map((question) => (
                <Container
                    headerDescription={`${question?.question_num + 1}: ${question?.question}`}
                    className={styles.inputSection}
                >
                </Container>
            ))}
        </ExpandableContainer>

    );
}

export default ComponentsInput;
