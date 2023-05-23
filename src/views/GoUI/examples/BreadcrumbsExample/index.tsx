import Breadcrumbs from '#components/Breadcrumbs';
import Link from '#components/Link';
import Heading from '#components/Heading';

import styles from './styles.module.css';

function BreadcrumbsExample() {
    return (
        <div className={styles.breadcrumbsExample}>
            <Heading level={3}>
                Breadcrumbs
            </Heading>
            <div className={styles.breadcrumb}>
                <Breadcrumbs>
                    <Link to="/">
                        Home
                    </Link>
                    <Link to="/about">
                        About
                    </Link>
                    <div>
                        Contact
                    </div>
                </Breadcrumbs>
            </div>
            <div className={styles.breadcrumb}>
                <Breadcrumbs separator="/">
                    <Link to="/">
                        Home
                    </Link>
                    <Link to="/about">
                        About
                    </Link>
                    <div>
                        Contact
                    </div>
                </Breadcrumbs>
            </div>
            <div className={styles.breadcrumb}>
                <Breadcrumbs>
                    <div>
                        Home
                    </div>
                </Breadcrumbs>
            </div>
        </div>
    );
}

export default BreadcrumbsExample;
