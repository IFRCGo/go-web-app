import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import type { ReactNode } from 'react';

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
                { isActive ? <MdCheckBox /> : <MdCheckBoxOutlineBlank /> }
            </div>
            <div className={labelClassName}>
                { children }
            </div>
        </>
    );
}

export default Option;
