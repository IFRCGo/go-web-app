import { useCallback, useState } from 'react';
import SingleFileInput from '#components/SingleFileInput';
import Heading from '#components/Heading';
import styles from './styles.module.css';

function SingleFileInputExample() {
    const [value, setValue] = useState<File | undefined>();

    const handleChange = useCallback((val: File | undefined) => {
        setValue(val);
    }, [setValue]);

    return (
        <div className={styles.fileInputs}>
            <Heading level={5}>File Input Variations</Heading>
            <SingleFileInput
                className={styles.fileInput}
                name="file"
                label="Simple File Input"
                hint="This is hint"
                value={value}
                onChange={handleChange}
                placeholder="Select an image"
            />
            <SingleFileInput
                className={styles.fileInput}
                name="file"
                label="Simple File Input (Clearable)"
                hint="This is hint"
                value={value}
                onChange={handleChange}
                placeholder="Select an image"
                clearable
            />
            <SingleFileInput
                variant="general"
                className={styles.fileInput}
                name="file"
                label="File Input Required"
                hint="This is hint"
                value={value}
                required
                onChange={handleChange}
            />
            <SingleFileInput
                variant="general"
                className={styles.fileInput}
                name="file"
                label="Read-Only File Input"
                hint="This is hint"
                value={value}
                onChange={handleChange}
                readOnly
            />
            <SingleFileInput
                className={styles.fileInput}
                name="file"
                label="Disabled File Input"
                value={value}
                onChange={handleChange}
                disabled
            />
            <SingleFileInput
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
export default SingleFileInputExample;
