import React from 'react';
import RadioInput from '#components/RadioInput';
import Heading from '#components/Heading';

import styles from './styles.module.scss';

interface TestOption {
  label: string;
  value: 'people' | 'households';
}

const testOptions: TestOption[] = [
    { label: 'People', value: 'people' },
    { label: 'Households', value: 'households' },
  ];
function valueSelector<T>(d: { value: T }) {
  return d.value;
}

function labelSelector<T>(d: { label: T }) {
  return d.label;
}

function RadioInputExample() {
  const [radioInput, setRadioInput] = React.useState('');

  const handleRadioChange = React.useCallback((value?: string) => {
    setRadioInput(value as string);
  }, [setRadioInput]);

  return (
    <div className={styles.radioInput}>
      <Heading>
        RadioInput
      </Heading>
      <RadioInput
        name="test"
        options={testOptions}
        value={radioInput}
        keySelector={valueSelector}
        labelSelector={labelSelector}
        onChange={handleRadioChange}
      />
    </div>
  );
}

export default RadioInputExample;
