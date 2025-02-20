import {
    Checkbox as PureCheckbox,
    CheckboxProps,
} from '@ifrc-go/ui';

function CheckBox<const N>(props: CheckboxProps<N>) {
    return (

        <PureCheckbox {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default CheckBox;
