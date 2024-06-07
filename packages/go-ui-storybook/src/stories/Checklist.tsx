import {
    Checklist as PureChecklist,
    ChecklistProps as PureChecklistProps,
} from '@ifrc-go/ui';

type ListKey = string | number;
interface ChecklistProps<KEY extends ListKey, NAME, OPTION extends object>
extends PureChecklistProps<KEY, NAME, OPTION> {}

function Checklist
<KEY extends ListKey, NAME, OPTION extends object>(props: ChecklistProps<KEY, NAME, OPTION>) {
    return (

        <PureChecklist {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Checklist;
