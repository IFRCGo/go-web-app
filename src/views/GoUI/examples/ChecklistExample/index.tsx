import React from 'react';
import Checklist from '#components/Checklist';
import Heading from '#components/Heading';

import styles from './styles.module.scss';

const labelSelector = (d: { label: string }) => d.label;
const keySelector = (d: { value: number }) => d.value;

interface ChecklistOption {
  value: number;
  label: string;
}

const checklistOption: ChecklistOption[] = [
  {
    value: 1,
    label: "1st option"
  },
  {
    value: 2,
    label: "2nd option"
  },
  {
    value: 3,
    label: "3rd option"
  },
  {
    value: 4,
    label: "4th option"
  }
];

function ChecklistExample() {
  const [checklistNumber, setChecklistNumber] = React.useState<number[]>();

  const handleChecklistChange = React.useCallback((checklistValue: number[] | undefined) => {
    setChecklistNumber(checklistValue);
  }, []);

  return (
    <div className={styles.checklist}>
      <Heading level={3}>
        Checklist
      </Heading>
      <Heading level={5}>
        Active
      </Heading>
      <Checklist
        name="test-checklist"
        options={checklistOption}
        value={checklistNumber}
        onChange={handleChecklistChange}
        keySelector={keySelector}
        labelSelector={labelSelector}
      />
      <Heading level={5}>
        Disabled
      </Heading>
      <Checklist
        name="test-checklist"
        options={checklistOption}
        value={checklistNumber}
        onChange={handleChecklistChange}
        keySelector={keySelector}
        labelSelector={labelSelector}
        disabled
      />
    </div>
  );
}

export default ChecklistExample;
