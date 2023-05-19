import { useState } from 'react';
import Pager from '#components/Pager';

import Heading from '#components/Heading';
import styles from './styles.module.css';

function PagerExample() {
    const [activePage, setActivePage] = useState(1);
    return (
        <div className={styles.pager}>
            <Heading>
                Pager
            </Heading>
            <Heading level={3}>
                Active
            </Heading>
            <Pager
                activePage={activePage}
                onActivePageChange={setActivePage}
                itemsCount={48}
                maxItemsPerPage={6}
            />
            <Heading level={3}>
                Disabled
            </Heading>
            <Pager
                activePage={activePage}
                onActivePageChange={setActivePage}
                itemsCount={48}
                maxItemsPerPage={6}
                disabled
            />
        </div>
    );
}

export default PagerExample;
