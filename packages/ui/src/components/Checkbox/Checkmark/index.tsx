import {
    CheckboxBlankLineIcon,
    CheckboxFillIcon,
    CheckboxIndeterminateFillIcon,
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
                <CheckboxIndeterminateFillIcon
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
