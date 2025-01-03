import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    className?: string;
    children?: React.ReactNode;
}

function FormGrid(props: Props) {
    const {
        className,
        children,
    } = props;

    return (
        <div className={_cs(styles.formGrid, className)}>
            {children}
        </div>
    );
}

export default FormGrid;
