import type { ReactNode } from 'react';
import {
    CheckboxBlankLineIcon,
    CheckboxLineIcon,
} from '@ifrc-go/icons';

interface OptionProps {
    children: ReactNode;
    isActive: boolean;
    iconClassName?: string;
    labelClassName?: string;
}
function Option(props: OptionProps) {
    const {
        children,
        isActive,
        iconClassName,
        labelClassName,
    } = props;

    return (
        <>
            <div className={iconClassName}>
                { isActive ? <CheckboxLineIcon /> : <CheckboxBlankLineIcon /> }
            </div>
            <div className={labelClassName}>
                { children }
            </div>
        </>
    );
}

export default Option;
