import {
    DismissableListOutput as PureDismissableListOutput,
    DismissableListOutputProps,
} from '@ifrc-go/ui';

function DismissableListOutput<O, V extends
 string | number, N extends string | number>(props: DismissableListOutputProps<O, V, N>) {
    return (
    // eslint-disable-next-line react/jsx-props-no-spreading
        <PureDismissableListOutput {...props} />
    );
}

export default DismissableListOutput;
