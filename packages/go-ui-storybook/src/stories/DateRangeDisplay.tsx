import {
    DateRangeDisplay as PureDateRangeDisplay,
    DateRangeDisplayProps,
} from '@ifrc-go/ui';

function DateRangeDisplay(props: DateRangeDisplayProps) {
    return (
    // eslint-disable-next-line react/jsx-props-no-spreading
        <PureDateRangeDisplay {...props} />
    );
}

export default DateRangeDisplay;
