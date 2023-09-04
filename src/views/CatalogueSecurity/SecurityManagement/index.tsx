import { useCallback } from 'react';
import { ChevronLeftLineIcon } from '@ifrc-go/icons';
import useRouting from '#hooks/useRouting';
import useTranslation from '#hooks/useTranslation';
import Container from '#components/Container';
import IconButton from '#components/IconButton';
import TextOutput from '#components/TextOutput';
import Image from '#components/Image';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { goBack } = useRouting();

    const handleBackButtonClick = useCallback(() => {
        goBack('catalogueSecurity');
    }, [goBack]);

    return (
        <Container
            heading={strings.securityManagementTitle}
            headingLevel={2}
            icons={(
                <IconButton
                    name={undefined}
                    onClick={handleBackButtonClick}
                    variant="tertiary"
                    ariaLabel={strings.goBack}
                    title={strings.goBack}
                >
                    <ChevronLeftLineIcon />
                </IconButton>
            )}
            className={styles.catalogueSecurity}
            childrenContainerClassName={styles.content}
        >
            <div className={styles.imageList}>
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/security-management_01.jpg"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/security-management_02.jpg"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/security-management_03.jpg"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/security-management_04.jpg"
                    imageClassName={styles.image}
                />
            </div>
            <Container
                heading={strings.capacityTitle}
                headingLevel={3}
                withHeaderBorder
            >
                <div>{strings.capacityDetails}</div>
            </Container>
            <Container
                heading={strings.emergencyTitle}
                headingLevel={3}
                withHeaderBorder
            >
                <div>{strings.emergencyContent}</div>
            </Container>
            <Container
                heading={strings.designedForTitle}
                headingLevel={3}
                withHeaderBorder
            >
                <ul>
                    <li>
                        <TextOutput
                            label={strings.strategic}
                            strongLabel
                            value={strings.strategicContent}
                        />
                    </li>
                    <li>
                        <TextOutput
                            label={strings.operational}
                            strongLabel
                            value={strings.operationalContent}
                        />
                    </li>
                    <li>
                        <TextOutput
                            label={strings.compliance}
                            strongLabel
                            value={strings.complianceContent}
                        />
                    </li>
                    <li>
                        <TextOutput
                            label={strings.coordination}
                            strongLabel
                            value={strings.coordinationContent}
                        />
                    </li>
                    <li>
                        <TextOutput
                            label={strings.training}
                            strongLabel
                            value={strings.trainingContent}
                        />
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.variationTitle}
                headingLevel={3}
                withHeaderBorder
            >
                <div>{strings.variationContent}</div>
            </Container>
        </Container>
    );
}

Component.displayName = 'SecurityManagement';
