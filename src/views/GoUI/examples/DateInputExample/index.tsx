import { useState, useCallback } from 'react';

import Heading from '#components/Heading';
import DateInput from '#components/DateInput';

import styles from './styles.module.css';

function DateInputExample() {
    const [dateInput, setDateInput] = useState<string | undefined>('');

    const handleDateChange = useCallback((val: string | undefined) => {
        setDateInput(val);
    }, [setDateInput]);

    return (
        <div className={styles.dateInput}>
            <Heading level={3}>
                DateInput
            </Heading>
            <Heading level={5}>
                Active
            </Heading>
            <DateInput
                name="date-input"
                value={dateInput}
                onChange={handleDateChange}
            />
            <Heading level={5}>
                Disabled
            </Heading>
            <DateInput
                name="date-input"
                value={dateInput}
                onChange={handleDateChange}
                disabled
            />
            <Heading level={5}>
                Errored
            </Heading>
            <DateInput
                name="date-input"
                value={dateInput}
                onChange={handleDateChange}
                error="This is test error"
                disabled
            />
        </div>
    );
}

export default DateInputExample;
