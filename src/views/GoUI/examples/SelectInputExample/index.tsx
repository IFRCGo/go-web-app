import { useState } from 'react';
import SelectInput from '#components/SelectInput';
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
        label: 'Option 23',
        value: 23,
    },
];

function SelectInputExample() {
    const [selectedOption, setSelectedOption] = useState<number | null | undefined>(null);

    return (
        <div className={styles.selectExample}>
            <Heading>Single Select Input</Heading>
            <SelectInput
                label="Basic Single Select"
                name="Country"
                options={randomOptions}
                keySelector={(item) => item.value}
                labelSelector={(item) => item.label}
                value={selectedOption}
                onChange={setSelectedOption}
            />
            <SelectInput
                label="Single Select input that is required"
                name="country"
                options={randomOptions}
                value={selectedOption}
                keySelector={(item) => item.value}
                labelSelector={(item) => item.label}
                onChange={setSelectedOption}
                required
            />
            <SelectInput
                label="Single Select input that is disabled"
                name="country"
                options={randomOptions}
                value={selectedOption}
                keySelector={(item) => item.value}
                labelSelector={(item) => item.label}
                onChange={setSelectedOption}
                disabled
            />
            <SelectInput
                label="Single Select input that is read only"
                name="country"
                options={randomOptions}
                value={selectedOption}
                keySelector={(item) => item.value}
                labelSelector={(item) => item.label}
                onChange={setSelectedOption}
                readOnly
            />
        </div>
    );
}
export default SelectInputExample;
