import {
    DateInput as PureDateInput,
    DateInputProps as PureDateInputProps,
} from '@ifrc-go/ui';

interface DateInputProps<T> extends PureDateInputProps<T> {}

function WrappedDateInput<const T>(props: DateInputProps<T>) {
    return (
        <PureDateInput {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedDateInput;
