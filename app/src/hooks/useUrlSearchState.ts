import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
} from 'react';
import {
    type NavigateOptions,
    useSearchParams,
} from 'react-router-dom';
import {
    encodeDate,
    isNotDefined,
} from '@togglecorp/fujs';
import { isCallable } from '@togglecorp/toggle-form';

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
    const serializerRef = useRef(serialize);
    const deserializerRef = useRef(deserialize);

    useEffect(
        () => {
            serializerRef.current = serialize;
        },
        [serialize],
    );

    useEffect(
        () => {
            deserializerRef.current = deserialize;
        },
        [deserialize],
    );

    const potentialValue = searchParams.get(key);
    const value = useMemo(
        () => deserializerRef.current(potentialValue),
        [potentialValue],
    );

    const setValue = useCallback(
        (newValueOrGetNewValue: ValueOrSetter<VALUE>) => {
            setSearchParams(
                (prevParams) => {
                    const encodedValue = isCallable(newValueOrGetNewValue)
                        ? newValueOrGetNewValue(deserializerRef.current(prevParams.get(key)))
                        : newValueOrGetNewValue;

                    const newValue = serializerRef.current(encodedValue);
                    if (isNotDefined(newValue)) {
                        prevParams.delete(key);
                    } else {
                        let serializedValue: string;

                        if (typeof newValue === 'number') {
                            serializedValue = String(newValue);
                        } else if (typeof newValue === 'boolean') {
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
        [setSearchParams, key, navigateOptions],
    );

    return [value, setValue] as const;
}

export default useUrlSearchState;
