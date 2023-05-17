import React, { useState, useCallback } from 'react';
import NumberInput from '#components/NumberInput';
import Heading from '#components/Heading';
import styles from './styles.module.css';

function NumberInputExample() {
    const [numberData, setDataGroup] = useState<number | null | undefined>();

    const handleTextChange = useCallback((val: number | null | undefined) => {
        setDataGroup(val);
    }, [setDataGroup]);

    return (
        <div className={styles.numberBox}>
            <Heading level={5}>
                Number Input example
            </Heading>
            <NumberInput
                className={styles.numberExample}
                label="Number of Random Count"
                name="randomCount"
                value={numberData}
                onChange={handleTextChange}
            />
            <Heading level={5}>
                Disabled mode example
            </Heading>
            <NumberInput
                className={styles.numberExample}
                label="Number of Random Count"
                name="randomCount"
                value={numberData}
                onChange={handleTextChange}
                disabled
            />
            <Heading level={5}>
                Error mode example
            </Heading>
            <NumberInput
                className={styles.numberExample}
                label="Number of Random Count"
                name="randomCount"
                value={numberData}
                onChange={handleTextChange}
                error="Please enter numbers"
            />
        </div>
    );
}
export default NumberInputExample;
