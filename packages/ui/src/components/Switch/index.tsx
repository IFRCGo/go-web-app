import { _cs } from '@togglecorp/fujs';

import Checkbox, { Props as CheckboxProps } from '#components/Checkbox';

import SwitchIcon from './SwitchIcon';

import styles from './styles.module.css';

export interface SwitchProps<N extends string | number> extends Omit<CheckboxProps<N>, 'indeterminate' | 'checkmark'> {
    withInvertedView?: boolean;
}

/**
 * Boolean toggle rendered as a switch (a Checkbox with a switch
 * checkmark) (specific layer).
 */
function Switch<N extends string | number>(props: SwitchProps<N>) {
    const {
        className,
        checkmarkContainerClassName,
        withInvertedView,
        ...otherProps
    } = props;

    return (
        <Checkbox
            className={_cs(styles.switch, withInvertedView && styles.withInvertedView, className)}
            {...otherProps} // eslint-disable-line react/jsx-props-no-spreading
            checkmarkContainerClassName={_cs(
                styles.checkmarkContainer,
                checkmarkContainerClassName,
            )}
            checkmark={SwitchIcon}
        />
    );
}

export default Switch;
