import { useCallback, useState } from 'react';
import GoFileInput from '#components/GoFileInput';
import Heading from '#components/Heading';
import styles from './styles.module.css';

function GoFileInputExample() {
    const [value, setValue] = useState<number | undefined>(undefined);

    const handleFileSelect = useCallback((val: number | undefined) => {
        setValue(val);
    }, [setValue]);

    return (
        <div className={styles.fileInputs}>
            <Heading level={5}>Go File Input Variations</Heading>
            <GoFileInput
                className={styles.textInput}
                name="file"
                value={value}
                onChange={handleFileSelect}
                url="www.google.com"
                clearable
            >
                Upload a file
            </GoFileInput>
        </div>
    );
}
export default GoFileInputExample;
