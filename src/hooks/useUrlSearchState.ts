import { useCallback } from 'react';
import { encodeDate, isNotDefined } from '@togglecorp/fujs';
import { isCallable } from '@togglecorp/toggle-form';
import { useSearchParams, NavigateOptions } from 'react-router-dom';

type SearchValueFromUrl = string | null | undefined;
type SearchValueFromUser = string | number | boolean | Date | undefined | null;

type ValueOrSetter<VALUE> = VALUE | ((prevValue: VALUE) => VALUE);

function useUrlSearchState<VALUE>(
    key: string,
    deserialize: (value: SearchValueFromUrl) => VALUE,
    serialize: (value: VALUE) => SearchValueFromUser,
    navigateOptions: NavigateOptions = { replace: true },
) {
    const [searchParams, setSearchParams] = useSearchParams();

    const potentialValue = searchParams.get(key);
    const value = deserialize(potentialValue);

    const setValue = useCallback(
        (newValueOrGetNewValue: ValueOrSetter<VALUE>) => {
            setSearchParams(
                (prevParams) => {
                    const encodedValue = isCallable(newValueOrGetNewValue)
                        ? newValueOrGetNewValue(deserialize(prevParams.get(key)))
                        : newValueOrGetNewValue;

                    const newValue = serialize(encodedValue);
                    if (isNotDefined(newValue)) {
                        prevParams.delete(key);
                    } else {
                        let serializedValue: string;

                        if (typeof newValue === 'number') {
                            serializedValue = String(newValue);
                        } else if (typeof newValue === 'boolean') {
                            // TODO: verify this
                            serializedValue = newValue ? 'true' : 'false';
                        } else if (newValue instanceof Date) {
                            serializedValue = encodeDate(newValue);
                        } else {
                            serializedValue = newValue;
                        }

                        prevParams.set(key, serializedValue);
                    }

                    return prevParams;
                },
                navigateOptions,
            );
        },
        [setSearchParams, key, serialize, deserialize, navigateOptions],
    );

    return [value, setValue] as const;
}

export default useUrlSearchState;
