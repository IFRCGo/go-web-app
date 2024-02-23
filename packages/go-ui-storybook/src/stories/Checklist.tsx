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

        <PureChecklist {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedChecklist;
