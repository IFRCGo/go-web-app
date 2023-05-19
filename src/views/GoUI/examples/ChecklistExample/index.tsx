import { useState, useCallback } from 'react';
import Checklist from '#components/Checklist';
import Heading from '#components/Heading';

import styles from './styles.module.css';

const labelSelector = (d: { label: string }) => d.label;
const keySelector = (d: { value: number }) => d.value;

interface ChecklistOption {
    value: number;
    label: string;
}

const checklistOption: ChecklistOption[] = [
    {
        value: 1,
        label: '1st option',
    },
    {
        value: 2,
        label: '2nd option',
    },
    {
        value: 3,
        label: '3rd option',
    },
    {
        value: 4,
        label: '4th option',
    },
];

function ChecklistExample() {
    const [checklistNumber, setChecklistNumber] = useState<number[]>();

    const handleChecklistChange = useCallback((checklistValue: number[] | undefined) => {
        setChecklistNumber(checklistValue);
    }, []);

    return (
        <div className={styles.checklist}>
            <Heading level={3}>
                Checklist
            </Heading>
            <Checklist
                name="test-checklist"
                label="Checklist"
                options={checklistOption}
                value={checklistNumber}
                onChange={handleChecklistChange}
                keySelector={keySelector}
                labelSelector={labelSelector}
                hint="Select any item"
            />
            <Checklist
                name="test-checklist"
                label="Checklist Disabled"
                options={checklistOption}
                value={checklistNumber}
                onChange={handleChecklistChange}
                keySelector={keySelector}
                labelSelector={labelSelector}
                disabled
                hint="Select any item"
            />
            <Checklist
                name="test-checklist"
                label="Checklist Errored"
                options={checklistOption}
                value={checklistNumber}
                onChange={handleChecklistChange}
                keySelector={keySelector}
                labelSelector={labelSelector}
                error="This is error"
            />
            <Checklist
                name="test-checklist"
                label="Checklist read only"
                options={checklistOption}
                value={checklistNumber}
                onChange={handleChecklistChange}
                keySelector={keySelector}
                labelSelector={labelSelector}
                readOnly
                hint="Select any item"
            />
            <Checklist
                name="test-checklist"
                label="Vertical Checklist"
                options={checklistOption}
                value={checklistNumber}
                onChange={handleChecklistChange}
                keySelector={keySelector}
                labelSelector={labelSelector}
                hint="Select any item"
                direction="vertical"
            />
        </div>
    );
}

export default ChecklistExample;
