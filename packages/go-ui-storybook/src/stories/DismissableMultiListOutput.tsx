import {
    DismissableMultiListOutput as PureDismissableMultiListOutput,
    DismissableMultiListOutputProps,
} from '@ifrc-go/ui';

function DismissableMultiListOutput<O, V extends string | number, N extends string | number>(
    props:DismissableMultiListOutputProps<O, V, N>,
) {
    return (
        <PureDismissableMultiListOutput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default DismissableMultiListOutput;
