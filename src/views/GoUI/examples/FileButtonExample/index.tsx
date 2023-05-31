import { useState, useRef, useCallback } from 'react';

import RawFileInput from '#components/RawFileInput';
import Button from '#components/Button';
import Heading from '#components/Heading';

function FileButtonExample() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [file, setFile] = useState<File | undefined>();

    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = useCallback(() => {
        inputRef?.current?.click();
    }, []);

    return (
        <div>
            <Heading>File Button Example</Heading>
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
        </div>
    );
}

export default FileButtonExample;
