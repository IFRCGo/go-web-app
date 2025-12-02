import React from 'react';
import { Heading } from '@ifrc-go/ui/printable';
import { _cs } from '@togglecorp/fujs';

import ifrcLogo from '#assets/icons/ifrc-square.png';

import styles from './styles.module.css';

interface Props {
    className?: string;
    children: React.ReactNode;
    heading: React.ReactNode;
    description: React.ReactNode;
}

function PrintablePage(props: Props) {
    const {
        className,
        children,
        heading,
        description,
    } = props;

    return (
        <main className={_cs(styles.printablePage, className)}>
            <div className={styles.headerSection}>
                <img
                    className={styles.ifrcLogo}
                    src={ifrcLogo}
                    alt="IFRC"
                />
                <Heading
                    level={1}
                    className={styles.heading}
                >
                    {heading}
                </Heading>
                <div className={styles.description}>
                    {description}
                </div>
            </div>
            {children}
        </main>
    );
}

export default PrintablePage;
