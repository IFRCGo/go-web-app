import { _cs } from '@togglecorp/fujs';

import Button from '#components/Button';
import PageContainer from '#components/PageContainer';
import Link from '#components/Link';
import TextInput from '#components/TextInput';
import goLogo from '#assets/icons/go-logo-2020.svg';

import styles from './styles.module.css';

interface Props {
    className?: string;
}

function Navbar(props: Props) {
    const {
        className,
    } = props;

    return (
        <nav className={_cs(styles.navbar, className)}>
            <PageContainer
                className={styles.top}
                contentClassName={styles.topContent}
            >
                <Link
                    to="/"
                    className={styles.brand}
                >
                    <img
                        className={styles.goIcon}
                        src={goLogo}
                        alt='GO | IFRC'
                    />
                </Link>
                <div className={styles.actions}>
                    <div className={styles.actionItem}>
                        Resources
                    </div>
                    <Link
                        to='login'
                        className={styles.actionItem}
                    >
                        Login
                    </Link>
                    <div className={styles.actionItem}>
                        Register
                    </div>
                    <Button name={undefined}>
                        Create a report
                    </Button>
                </div>
            </PageContainer>
            <PageContainer>
                <div className={styles.bottom}>
                    <div className={styles.menuItems}>
                        <div className={styles.menuItem}>
                            Home
                        </div>
                        <div className={styles.menuItem}>
                            Emergencies
                        </div>
                    </div>
                    <div className={styles.searchContainer}>
                        <TextInput
                            placeholder="Search"
                            name={undefined}
                        />
                    </div>
                </div>
            </PageContainer>
        </nav>
    );
}

export default Navbar;
