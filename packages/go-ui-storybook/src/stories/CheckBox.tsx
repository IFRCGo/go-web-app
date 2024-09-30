import {
    Checkbox as PureCheckbox,
    type CheckboxProps,
} from '@ifrc-go/ui';

function CheckBox<const N>(props: CheckboxProps<N>) {
    return (
        // eslint-disable-next-line max-len
        <PureCheckbox {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default CheckBox;
