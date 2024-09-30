import {
    DateInput as PureDateInput,
    type DateInputProps,
} from '@ifrc-go/ui';

function DateInput<T>(props: DateInputProps<T>) {
    return (
        <PureDateInput {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default DateInput;
