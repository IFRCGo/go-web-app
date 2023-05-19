import { _cs } from '@togglecorp/fujs';

import Spinner from '#components/Spinner';
import styles from './styles.module.css';

interface Props {
    className?: string;
}

function BlockLoading(props: Props) {
    const { className } = props;

    return (
        <div className={_cs(className, styles.blockLoading)}>
            <div className={styles.inner}>
                <Spinner />
            </div>
        </div>
    );
}

export default BlockLoading;
