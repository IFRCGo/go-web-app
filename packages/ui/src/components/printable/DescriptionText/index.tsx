import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface DescriptionTextProps {
    children?: React.ReactNode;
    className?: string;
}

function DescriptionText(props: DescriptionTextProps) {
    const { children, className } = props;

    return (
        <div className={_cs(styles.descriptionText, className)}>
            {children}
        </div>
    );
}

export default DescriptionText;
