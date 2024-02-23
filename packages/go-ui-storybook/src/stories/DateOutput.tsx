import {
    DateOutput as PureDateOutput,
    DateOutputProps as PureDateOutputProps,
} from '@ifrc-go/ui';

interface DateOutputProps extends PureDateOutputProps {}

function WrappedDateOut(props: DateOutputProps) {
    return (
        <PureDateOutput {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedDateOut;
