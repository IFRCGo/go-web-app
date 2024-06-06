import {
    DateInput as PureDateInput,
    DateInputProps as PureDateInputProps,
} from '@ifrc-go/ui';

export interface DateInputProps<T> extends PureDateInputProps<T> {}

function DateInput<T>(props: DateInputProps<T>) {
    return (
        <PureDateInput {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default DateInput;
