import { useCallback } from 'react';
import {
    type EntriesAsList,
    isCallable,
} from '@togglecorp/toggle-form';

function useSetFieldValue<T extends object>(
    setValue: React.Dispatch<React.SetStateAction<T>>,
) {
    const setFieldValue = useCallback((...entries: EntriesAsList<T>) => {
        setValue((oldState) => {
            const newValue = isCallable(entries[0])
                ? entries[0](oldState[entries[1]])
                : entries[0];
            return {
                ...oldState,
                [entries[1]]: newValue,
            };
        });
    }, [setValue]);

    return setFieldValue;
}

export default useSetFieldValue;
