import { useOutletContext } from 'react-router-dom';
import { isDefined } from '@togglecorp/fujs';

import Link from '#components/Link';
import TextOutput from '#components/TextOutput';
import Container from '#components/Container';
import Image from '#components/Image';
import useTranslation from '#hooks/useTranslation';
import type { EmergencyOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { emergencyResponse } = useOutletContext<EmergencyOutletContext>();

    return (
        <div className={styles.emergencyReportAndDocument}>
            {isDefined(emergencyResponse)
                && isDefined(emergencyResponse.featured_documents)
                && emergencyResponse.featured_documents.length > 0 && (
                <Container
                    heading={strings.featuredDocuments}
                    childrenContainerClassName={styles.featuredDocumentList}
                    withHeaderBorder
                >
                    {emergencyResponse.featured_documents.map(
                        (featuredDocument) => (
                            <Container
                                className={styles.featuredDocument}
                                key={featuredDocument.id}
                                childrenContainerClassName={styles.documentDetails}
                            >
                                <Image
                                    className={styles.image}
                                    src={featuredDocument.thumbnail}
                                    alt={featuredDocument.title ?? undefined}
                                />
                                <TextOutput
                                    className={styles.documentTitle}
                                    value={(
                                        <Link
                                            to={featuredDocument.file}
                                        >
                                            {featuredDocument.title}
                                        </Link>
                                    )}
                                    descriptionClassName={styles.description}
                                    description={featuredDocument.description}
                                />
                            </Container>
                        ),
                    )}
                </Container>
            )}
        </div>
    );
}

Component.displayName = 'EmergencyReportAndDocument';
