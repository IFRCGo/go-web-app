import { isNotDefined } from '@togglecorp/fujs';
import { useCallback } from 'react';
import { useSearchParams, NavigateOptions } from 'react-router-dom';

type ValueOrSetter = string | null | undefined | ((prevValue: string) => string | null | undefined);

function useUrlSearchState(key: string, navigateOptions?: NavigateOptions) {
    const [searchParams, setSearchParams] = useSearchParams();

    const value = searchParams.get(key);
    const setValue = useCallback(
        (newValueOrGetNewValue: ValueOrSetter) => {
            if (isNotDefined(newValueOrGetNewValue)) {
                setSearchParams((prevParams) => {
                    prevParams.delete(key);

                    return prevParams;
                }, navigateOptions);

                return;
            }

            if (typeof newValueOrGetNewValue === 'function') {
                const getNewValue = newValueOrGetNewValue;
                setSearchParams((oldSearchParams) => {
                    const prevValue = oldSearchParams.get(key);
                    const newValue = getNewValue(prevValue ?? '');

                    if (isNotDefined(newValue)) {
                        oldSearchParams.delete(key);
                        return oldSearchParams;
                    }

                    return { [key]: newValue };
                }, navigateOptions);

                return;
            }

            const newValue = newValueOrGetNewValue;
            setSearchParams({ [key]: newValue }, navigateOptions);
        },
        [setSearchParams, key, navigateOptions],
    );

    return [value, setValue] as const;
}

export default useUrlSearchState;
