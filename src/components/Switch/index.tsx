import React from 'react';

import Checkbox, { Props as CheckboxProps } from '#components/Checkbox';
import SwitchIcon from './SwitchIcon';

export type SwitchProps<N extends string> = Omit<CheckboxProps<N>, 'indeterminate' | 'checkmark'>

function Switch<N extends string>(props: SwitchProps<N>) {
    return (
        <Checkbox
            {...props}
            checkmark={SwitchIcon}
        />
    );
}

export default Switch;
