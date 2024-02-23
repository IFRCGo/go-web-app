import {
    Checklist as PureChecklist,
    ChecklistProps as PureChecklistProps,
    ListKey,
} from '@ifrc-go/ui';

interface ChecklistProps<KEY extends ListKey, NAME, OPTION extends object>
extends PureChecklistProps<KEY, NAME, OPTION> {}

function WrappedChecklist
<KEY extends ListKey, NAME, OPTION extends object>(props: ChecklistProps<KEY, NAME, OPTION>) {
    return (

        // eslint-disable-next-line react/jsx-props-no-spreading
        <PureChecklist {...props} />
    );
}

export default WrappedChecklist;
