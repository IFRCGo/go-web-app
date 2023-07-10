import { useCallback, useState } from 'react';
import MultiFileInput from '#components/MultiFileInput';
import Heading from '#components/Heading';
import styles from './styles.module.css';

function MultiFileInputExample() {
    const [value, setValue] = useState<File[] | undefined>();

    const handleChange = useCallback((val: File[] | undefined) => {
        setValue(val);
    }, [setValue]);

    return (
        <div className={styles.fileInputs}>
            <Heading level={5}>File Input Variations</Heading>
            <MultiFileInput
                className={styles.fileInput}
                name="file"
                label="Simple File Input"
                hint="This is hint"
                value={value}
                onChange={handleChange}
                placeholder="Select an image"
            />
            <MultiFileInput
                className={styles.fileInput}
                name="file"
                label="Simple File Input (Clearable)"
                hint="This is hint"
                value={value}
                onChange={handleChange}
                placeholder="Select an image"
                clearable
            />
            <MultiFileInput
                className={styles.fileInput}
                name="file"
                label="File Input Required"
                hint="This is hint"
                value={value}
                required
                onChange={handleChange}
            />
            <MultiFileInput
                className={styles.fileInput}
                name="file"
                label="Read-Only File Input"
                hint="This is hint"
                value={value}
                onChange={handleChange}
                readOnly
            />
            <MultiFileInput
                className={styles.fileInput}
                name="file"
                label="Disabled File Input"
                value={value}
                onChange={handleChange}
                disabled
            />
            <MultiFileInput
                className={styles.fileInput}
                name="file"
                label="File Input with error message"
                value={value}
                onChange={handleChange}
                error="Is this a file ?"
            />
        </div>
    );
}
export default MultiFileInputExample;
