import TextOutput, { type Props as TextOutputProps } from '#components/TextOutput';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

function BlockTextOutput(props: TextOutputProps) {
    const {
        className,
        labelClassName,
        valueClassName,
        ...otherProps
    } = props;

    return (
        <TextOutput
            className={_cs(styles.blockTextOutput, className)}
            labelClassName={_cs(styles.label, labelClassName)}
            valueClassName={_cs(valueClassName, styles.value)}
            withoutLabelColon
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
        />
    );
}

export default BlockTextOutput;
