import { useCallback, useState } from 'react';
import FileInput from '#components/FileInput';
import Heading from '#components/Heading';
import styles from './styles.module.css';

function FileInputExample() {
    const [value, setValue] = useState<File | null>(null);

    const handleTextChange = useCallback((val: File | null) => {
        setValue(val);
    }, [setValue]);

    return (
        <div className={styles.textInputs}>
            <Heading level={5}>File Input Variations</Heading>
            <FileInput
                className={styles.textInput}
                name="file"
                label="Simple File Input"
                hint="This is hint"
                value={value}
                onChange={handleTextChange}
                placeholder="Select an image"
            />
            <FileInput
                className={styles.textInput}
                name="file"
                label="Simple File Input (Clearable)"
                hint="This is hint"
                value={value}
                onChange={handleTextChange}
                placeholder="Select an image"
                clearable
            />
            <FileInput
                variant="general"
                className={styles.textInput}
                name="file"
                label="File Input Required"
                hint="This is hint"
                value={value}
                required
                onChange={handleTextChange}
            />
            <FileInput
                variant="general"
                className={styles.textInput}
                name="file"
                label="Read-Only File Input"
                hint="This is hint"
                value={value}
                onChange={handleTextChange}
                readOnly
            />
            <FileInput
                className={styles.textInput}
                name="file"
                label="Disabled File Input"
                value={value}
                onChange={handleTextChange}
                disabled
            />
            <FileInput
                className={styles.textInput}
                name="file"
                label="File Input with error message"
                value={value}
                onChange={handleTextChange}
                error="Is this a file ?"
            />
        </div>
    );
}
export default FileInputExample;
