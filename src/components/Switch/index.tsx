import React from 'react';

import Checkbox, { Props as CheckboxProps } from '#components/Checkbox';
import SwitchIcon from './SwitchIcon';

export interface SwitchProps<N extends string> extends Omit<CheckboxProps<N>, 'indeterminate' | 'checkmark'> {
}

function Switch<N extends string>(props: SwitchProps<N>) {
  return (
    <Checkbox
      {...props}
      checkmark={SwitchIcon}
    />
  );
}

export default Switch;
