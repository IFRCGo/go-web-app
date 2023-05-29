import { useCallback, useState } from 'react';
import GoSingleFileInput from '#components/GoSingleFileInput';
import Heading from '#components/Heading';

function GoFileInputExample() {
    const [value, setValue] = useState<number | undefined | null>(undefined);

    const handleFileSelect = useCallback((val: number | undefined | null) => {
        setValue(val);
    }, [setValue]);

    return (
        <div>
            <Heading level={5}>Go File Input Variations</Heading>
            <GoSingleFileInput
                name="file"
                value={value}
                onChange={handleFileSelect}
                url="www.google.com"
                clearable
            >
                Upload a file
            </GoSingleFileInput>
        </div>
    );
}

export default GoFileInputExample;
