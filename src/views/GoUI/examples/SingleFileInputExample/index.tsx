import { useCallback, useState } from 'react';
import SingleFileInput from '#components/SingleFileInput';
import Heading from '#components/Heading';
import styles from './styles.module.css';

function SingleFileInputExample() {
    const [value, setValue] = useState<File | null>(null);

    const handleTextChange = useCallback((val: File | null) => {
        setValue(val);
    }, [setValue]);

    return (
        <div className={styles.textInputs}>
            <Heading level={5}>File Input Variations</Heading>
            <SingleFileInput
                className={styles.textInput}
                name="file"
                label="Simple File Input"
                hint="This is hint"
                value={value}
                onChange={handleTextChange}
                placeholder="Select an image"
            />
            <SingleFileInput
                className={styles.textInput}
                name="file"
                label="Simple File Input (Clearable)"
                hint="This is hint"
                value={value}
                onChange={handleTextChange}
                placeholder="Select an image"
                clearable
            />
            <SingleFileInput
                variant="general"
                className={styles.textInput}
                name="file"
                label="File Input Required"
                hint="This is hint"
                value={value}
                required
                onChange={handleTextChange}
            />
            <SingleFileInput
                variant="general"
                className={styles.textInput}
                name="file"
                label="Read-Only File Input"
                hint="This is hint"
                value={value}
                onChange={handleTextChange}
                readOnly
            />
            <SingleFileInput
                className={styles.textInput}
                name="file"
                label="Disabled File Input"
                value={value}
                onChange={handleTextChange}
                disabled
            />
            <SingleFileInput
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
export default SingleFileInputExample;
