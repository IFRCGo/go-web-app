import {
    Checkbox as PureCheckbox,
    CheckboxProps as PureCheckboxProps,
} from '@ifrc-go/ui';

interface CheckboxProps<N> extends PureCheckboxProps<N> {}

function CheckBox<const N>(props: CheckboxProps<N>) {
    return (
        // eslint-disable-next-line max-len
        <PureCheckbox {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default CheckBox;
