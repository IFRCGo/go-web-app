import {
    DateRangeOutput as PureDateRangeOutput,
    DateRangeOutputProps,
} from '@ifrc-go/ui';

function DateRangeOutput(props: DateRangeOutputProps) {
    return (
    // eslint-disable-next-line react/jsx-props-no-spreading
        <PureDateRangeOutput {...props} />
    );
}

export default DateRangeOutput;
