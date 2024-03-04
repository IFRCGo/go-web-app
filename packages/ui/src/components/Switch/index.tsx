import Checkbox, { Props as CheckboxProps } from '#components/Checkbox';

import SwitchIcon from './SwitchIcon';

import styles from './styles.module.css';

export type SwitchProps<N extends string> = Omit<CheckboxProps<N>, 'indeterminate' | 'checkmark'>

function Switch<N extends string>(props: SwitchProps<N>) {
    return (
        <Checkbox
            {...props} // eslint-disable-line react/jsx-props-no-spreading
            checkmarkContainerClassName={styles.container}
            checkmark={SwitchIcon}
        />
    );
}

export default Switch;
