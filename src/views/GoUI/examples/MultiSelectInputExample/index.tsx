import { useState } from 'react';
import MultiSelectInput from '#components/MultiSelectInput';
import Heading from '#components/Heading';

import styles from './styles.module.css';

interface Option {
  label: string;
  value: number;
}

const randomOptions: Option[] = [
    {
        label: 'Option 1',
        value: 10,
    },
    {
        label: 'Option 2',
        value: 20,
    },
    {
        label: 'Option 3',
        value: 30,
    },
    {
        label: 'Option 4',
        value: 40,
    },
    {
        label: 'Option 5',
        value: 50,
    },
    {
        label: 'Option 6',
        value: 60,
    },
];

function MultiSelectInputExample() {
    const [selectedOption, setSelectedOption] = useState<number[] | null | undefined>(null);

    return (
        <div className={styles.multiSelectExample}>
            <Heading>MultiSelect Input</Heading>
            <MultiSelectInput
                label="Basic MultiSelect"
                name="Country"
                options={randomOptions}
                value={selectedOption}
                labelSelector={(item) => item.label}
                keySelector={(item) => item.value}
                onChange={setSelectedOption}
            />
            <MultiSelectInput
                label="MultiSelect input that is required"
                name="country"
                options={randomOptions}
                value={selectedOption}
                labelSelector={(item) => item.label}
                keySelector={(item) => item.value}
                onChange={setSelectedOption}
                required
            />
            <MultiSelectInput
                label="MultiSelect input that is disabled"
                name="country"
                options={randomOptions}
                value={selectedOption}
                labelSelector={(item) => item.label}
                keySelector={(item) => item.value}
                onChange={setSelectedOption}
                disabled
            />
            <MultiSelectInput
                label="MultiSelect input that is read only"
                name="country"
                options={randomOptions}
                value={selectedOption}
                labelSelector={(item) => item.label}
                keySelector={(item) => item.value}
                onChange={setSelectedOption}
                readOnly
            />
        </div>
    );
}
export default MultiSelectInputExample;
