import {
    DateRangeOutput as PureDateRangeOutput,
    DateRangeOutputProps as PureDateRangeOutputProps,
} from '@ifrc-go/ui';

interface DateRangeOutputProps extends PureDateRangeOutputProps{}

function WrappedDateRangeOutput(props: DateRangeOutputProps) {
    return (
    // eslint-disable-next-line react/jsx-props-no-spreading
        <PureDateRangeOutput {...props} />
    );
}

export default WrappedDateRangeOutput;
