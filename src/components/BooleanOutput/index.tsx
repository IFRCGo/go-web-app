import {
    _cs,
} from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    value?: boolean | null;
    invalidText?: React.ReactNode;
}

function BooleanOutput(props: Props) {
    const {
        className,
        invalidText,
        value,
    } = props;

    let content;
    if (value === true) {
        // FIXME: use translation
        content = 'Yes';
    } else if (value === false) {
        // FIXME: use translation
        content = 'No';
    } else {
        content = invalidText;
    }

    return (
        <div className={_cs(styles.booleanOutput, className)}>
            {content}
        </div>
    );
}

export default BooleanOutput;
