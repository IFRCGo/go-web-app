import React, {
    useEffect,
    useState,
} from 'react';
import { Heading } from '@ifrc-go/ui/printable';
import { _cs } from '@togglecorp/fujs';

import ifrcLogo from '#assets/icons/ifrc-square.png';

import styles from './styles.module.css';

interface Props {
    className?: string;
    children: React.ReactNode;
    heading: React.ReactNode;
    description: React.ReactNode;
    dataReady?: boolean;
    mainRef: React.RefObject<HTMLDivElement | null>;
}

function PrintablePage(props: Props) {
    const {
        className,
        children,
        heading,
        description,
        dataReady = false,
        mainRef,
    } = props;

    const [previewReady, setPreviewReady] = useState(false);

    useEffect(() => {
        if (!dataReady) {
            return;
        }

        const mainContainer = mainRef.current;

        async function waitForImages() {
            if (!mainContainer) {
                return;
            }

            const images = mainContainer.querySelectorAll('img');

            if (images.length === 0) {
                setPreviewReady(true);
                return;
            }

            const promises = Array.from(images).map(
                (image) => {
                    if (image.complete) {
                        return undefined;
                    }

                    return new Promise((accept) => {
                        image.addEventListener('load', () => {
                            accept(true);
                        });
                    });
                },
            );

            await Promise.all(promises);
            setPreviewReady(true);
        }

        waitForImages();
    }, [dataReady, mainRef]);

    return (
        <main
            className={_cs(styles.printablePage, className)}
            ref={mainRef}
        >
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
            {previewReady && <div id="pdf-preview-ready" />}
        </main>
    );
}

export default PrintablePage;
