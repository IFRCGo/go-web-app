import React from 'react';
import Link from '#components/Link';
import Heading from '#components/Heading';
import { IoChevronForward, IoOpenOutline } from 'react-icons/io5';
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
                    actions={<IoChevronForward />}
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
                        actions={<IoChevronForward />}
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
                    to="www.gooogle.com"
                    target="_blank"
                >
                    im@ifrc.org
                </Link>
            </div>
            <div className={styles.linksContainer}>
                <Heading level={5}>
                    EXTERNAL LINK
                </Heading>
                <Link
                    to="https://www.gooogle.com"
                    external
                    actions={<IoOpenOutline />}
                >
                    Google
                </Link>
                <Link
                    to="https://www.gooogle.com"
                    external
                    disabled
                    actions={<IoOpenOutline />}
                >
                    Google
                </Link>
            </div>
        </div>
    );
}

export default Links;
