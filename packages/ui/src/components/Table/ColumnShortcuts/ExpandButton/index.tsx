import {
    ChevronDownLineIcon,
    ChevronUpLineIcon,
} from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import type { Props as ButtonProps } from '#components/Button';
import Button from '#components/Button';

import styles from './styles.module.css';

export interface ExpandButtonProps<ROW> {
    className?: string;
    row: ROW;
    onClick: ButtonProps<ROW>['onClick'];
    expanded?: boolean;
    disabled?: boolean;
}

function ExpandButton<K>(props : ExpandButtonProps<K>) {
    const {
        className,
        row,
        onClick,
        expanded = false,
        disabled,
    } = props;

    return (
        <Button
            className={_cs(
                styles.expandButton,
                className,
            )}
            name={row}
            onClick={onClick}
            variant="tertiary"
            disabled={disabled}
        >
            {expanded ? (
                <ChevronUpLineIcon className={styles.icon} />
            ) : (
                <ChevronDownLineIcon className={styles.icon} />
            )}
        </Button>
    );
}

export default ExpandButton;
