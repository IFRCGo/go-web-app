import { useState, useRef, useCallback } from 'react';

import RawFileInput from '#components/RawFileInput';
import Button from '#components/Button';

function FileButtonExample() {
    const [file, setFile] = useState<File | undefined>();

    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = useCallback(() => {
        inputRef?.current?.click();
    }, []);

    return (
        <RawFileInput
            name="file"
            onChange={setFile}
            inputRef={inputRef}
        >
            <Button
                name={undefined}
                onClick={handleClick}
            >
                Upload image
            </Button>
        </RawFileInput>
    );
}

export default FileButtonExample;
