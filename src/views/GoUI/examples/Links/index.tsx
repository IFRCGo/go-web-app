import Link from '#components/Link';
import Heading from '#components/Heading';
import { ChevronRightLineIcon, ChevronLeftLineIcon } from '@ifrc-go/icons';
import styles from './styles.module.css';

function Links() {
    return (
        <div className={styles.linkCollection}>
            <div className={styles.linksContainer}>
                <Heading level={5}>
                    VIEW LINK
                </Heading>
                <Link
                    to={{
                        pathname: '/emergencies',
                    }}
                    actions={<ChevronRightLineIcon />}
                >
                    Emergencies
                </Link>
            </div>
            <div className={styles.linksContainer}>
                <Heading level={5}>
                    TITLE LINK
                </Heading>
                <Heading level={2}>
                    <Link
                        to="/deployments/overview"
                        underline
                        actions={<ChevronRightLineIcon />}
                    >
                        Surge
                    </Link>
                </Heading>
            </div>
            <div className={styles.linksContainer}>
                <Heading level={5}>
                    TEXT LINK
                </Heading>
                <Link
                    to="/disaster-preparedness"
                    underline
                >
                    Preparedness
                </Link>
            </div>
            <div className={styles.linksContainer}>
                <Heading level={5}>
                    SECONDARY LINK
                </Heading>
                <Link
                    to="https://www.google.com"
                    target="_blank"
                >
                    Google
                </Link>
            </div>
            <div className={styles.linksContainer}>
                <Heading level={5}>
                    EXTERNAL LINK
                </Heading>
                <Link
                    to="https://www.google.com"
                    external
                    actions={<ChevronLeftLineIcon />}
                >
                    Google
                </Link>
                <Link
                    to="https://www.google.com"
                    external
                    disabled
                    actions={<ChevronLeftLineIcon />}
                >
                    Google
                </Link>
            </div>
        </div>
    );
}

export default Links;
