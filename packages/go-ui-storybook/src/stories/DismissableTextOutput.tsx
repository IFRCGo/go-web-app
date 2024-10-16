import {
    DismissableTextOutput as PureDismissableTextOutput,
    DismissableTextOutputProps,
} from '@ifrc-go/ui';

function DismissableTextOutput<T extends string | number>(
    props: DismissableTextOutputProps<T>,
) {
    return (
        <PureDismissableTextOutput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default DismissableTextOutput;
