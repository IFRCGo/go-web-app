import {
    CheckboxBlankLineIcon,
    CheckboxIndeterminateLineIcon,
    CheckboxLineIcon,
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
                <CheckboxLineIcon
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
