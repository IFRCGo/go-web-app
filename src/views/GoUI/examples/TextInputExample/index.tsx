import React, { useCallback, useState } from 'react';
import TextInput from '#components/TextInput';
import Heading from '#components/Heading';
import styles from './styles.module.css';

function TextInputExample() {
    const [textGroup, setTextGroup] = useState<string | undefined>('');

    const handleTextChange = useCallback((val: string | undefined) => {
        setTextGroup(val);
    }, [setTextGroup]);

    return (
        <div className={styles.textInputs}>
            <Heading level={5}>Text Input Variations</Heading>
            <TextInput
                className={styles.textInput}
                name="inputData"
                label="Simple Input with hint"
                hint="This is hint"
                value={textGroup}
                onChange={handleTextChange}
            />
            <TextInput
                variant="general"
                className={styles.textInput}
                name="inputData"
                label="Input Required Example"
                hint="This is hint"
                value={textGroup}
                required
                onChange={handleTextChange}
            />
            <TextInput
                variant="general"
                className={styles.textInput}
                name="inputData"
                label="Read-Only Input Field"
                hint="This is hint"
                value={textGroup}
                onChange={handleTextChange}
                readOnly
            />
            <TextInput
                className={styles.textInput}
                name="inputData"
                label="Disabled Input Field"
                value={textGroup}
                onChange={handleTextChange}
                disabled
            />
            <TextInput
                className={styles.textInput}
                name="inputData"
                label="Input with error message"
                value={textGroup}
                onChange={handleTextChange}
                error="Is that your real name ?"
            />
        </div>
    );
}
export default TextInputExample;
