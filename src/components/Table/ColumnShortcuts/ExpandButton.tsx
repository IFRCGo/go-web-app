import {
    IoChevronDown,
    IoChevronForward,
} from 'react-icons/io5';
import Button from '#components/Button';
import type { Props as ButtonProps } from '#components/Button';

export interface ExpandButtonProps<K extends number | string | undefined> {
    className?: string;
    rowId: K;
    onClick: ButtonProps<K>['onClick'];
    expanded?: boolean;
}

function ExpandButton<K extends number | string | undefined>(props : ExpandButtonProps<K>) {
    const {
        className,
        rowId,
        onClick,
        expanded = false,
    } = props;

    return (
        <Button
            className={className}
            name={rowId}
            onClick={onClick}
            variant="tertiary"
        >
            {expanded ? (
                <IoChevronDown title="Expand row" />
            ) : (
                <IoChevronForward title="Collapse row" />
            )}
        </Button>
    );
}

export default ExpandButton;
