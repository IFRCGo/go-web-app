import type { ReactNode } from 'react';
import { CheckLineIcon } from '@ifrc-go/icons';

interface OptionProps {
    children: ReactNode;
    iconClassName?: string;
    labelClassName?: string;
}
function Option(props: OptionProps) {
    const {
        children,
        iconClassName,
        labelClassName,
    } = props;

    return (
        <>
            <div className={iconClassName}>
                <CheckLineIcon />
            </div>
            <div className={labelClassName}>
                { children }
            </div>
        </>
    );
}
export default Option;
