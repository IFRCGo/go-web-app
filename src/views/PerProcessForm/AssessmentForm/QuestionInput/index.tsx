import React from 'react';
import {
  PartialForm,
  SetValueArg,
  useFormObject,
} from '@togglecorp/toggle-form';

import usePerProcessOptions from '../../usePerProcessOptions';
import {
  booleanOptionKeySelector,
  optionLabelSelector,
  PerAssessmentForm,
} from '../../common';
import Container from '#components/Container';
import TextArea from '#components/TextArea';
import RadioInput from '#components/RadioInput';

import styles from './styles.module.css';

type Value = PerAssessmentForm;
type InputValue = PartialForm<Value>;

interface Props {
  onChange: (value: SetValueArg<InputValue>, index: number) => void;
  index: number;
  value: InputValue | undefined | null;
}

function QuestionInput(props: Props) {
  const {
    onChange,
    index,
    value,
  } = props;

  const {
    yesNoOptions,
  } = usePerProcessOptions();

  const onFieldChange = useFormObject(index, onChange, {});

  return (
    <>
      <Container
        className={styles.inputSection}
        contentClassName={styles.questionContent}
        description={value?.question}
      >
        <TextArea
          className={styles.noteSection}
          label='Notes'
          name="description"
          value={value?.notes}
          placeholder="This is placeholder"
          onChange={onFieldChange}
          rows={2}
        />
        <div className={styles.answers}>
          <RadioInput
            name="answer"
            options={yesNoOptions}
            keySelector={booleanOptionKeySelector}
            labelSelector={optionLabelSelector}
            value={value?.answer}
            onChange={onFieldChange}
          />
        </div>
      </Container>
    </>
  );
}

export default QuestionInput;
