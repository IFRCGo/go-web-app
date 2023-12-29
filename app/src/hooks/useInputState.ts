import React, {
    useEffect,
    useRef,
} from 'react';

type ValueOrSetterFn<T> = T | ((value: T) => T);
function isSetterFn<T>(value: ValueOrSetterFn<T>): value is ((value: T) => T) {
    return typeof value === 'function';
}

function useInputState<T>(
    initialValue: T,
    sideEffect?: (newValue: T, oldValue: T) => T,
) {
    const [value, setValue] = React.useState<T>(initialValue);
    const sideEffectRef = useRef(sideEffect);

    useEffect(
        () => {
            sideEffectRef.current = sideEffect;
        },
        [sideEffect],
    );

    type SetValue = React.Dispatch<React.SetStateAction<T>>;
    const setValueSafe: SetValue = React.useCallback((newValueOrSetter) => {
        setValue((oldValue) => {
            const newValue = isSetterFn(newValueOrSetter)
                ? newValueOrSetter(oldValue)
                : newValueOrSetter;

            if (sideEffectRef.current) {
                return sideEffectRef.current(newValue, oldValue);
            }

            return newValue;
        });
    }, []);

    return [value, setValueSafe] as const;
}

export default useInputState;
