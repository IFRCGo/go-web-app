import {
    CheckboxBlankLineIcon,
    CheckboxFillIcon,
    CheckboxIndeterminateLineIcon,
} from '@ifrc-go/icons';

export interface CheckmarkProps {
    className?: string;
    value: boolean | undefined | null;
    indeterminate?: boolean;
}

function Checkmark(props: CheckmarkProps) {
    const {
        className,
        indeterminate,
        value,
    } = props;

    return (
        <>
            {indeterminate && (
                <CheckboxIndeterminateLineIcon
                    className={className}
                />
            )}
            {value && !indeterminate && (
                <CheckboxFillIcon
                    className={className}
                />
            )}
            {!value && !indeterminate && (
                <CheckboxBlankLineIcon
                    className={className}
                />
            )}
        </>
    );
}

export default Checkmark;
