import { MdCheck } from 'react-icons/md';
import type { ReactNode } from 'react';

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
                <MdCheck />
            </div>
            <div className={labelClassName}>
                { children }
            </div>
        </>
    );
}
export default Option;
