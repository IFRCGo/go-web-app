import React from 'react';
import BlockLoading from '#components/BlockLoading';

import styles from './styles.module.css';

function BlockLoadingExample() {
    return (
        <div className={styles.blockLoading}>
            <BlockLoading />
        </div>
    );
}

export default BlockLoadingExample;
