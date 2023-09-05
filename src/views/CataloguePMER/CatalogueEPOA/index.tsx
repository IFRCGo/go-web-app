import { useCallback } from 'react';
import { ChevronLeftLineIcon } from '@ifrc-go/icons';
import useRouting from '#hooks/useRouting';
import useTranslation from '#hooks/useTranslation';
import Container from '#components/Container';
import IconButton from '#components/IconButton';
import TextOutput from '#components/TextOutput';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { goBack } = useRouting();

    const handleBackButtonClick = useCallback(() => {
        goBack('cataloguePMER');
    }, [goBack]);

    return (
        <Container
            heading={strings.EPOATitle}
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
            className={styles.catalogueEpoa}
            childrenContainerClassName={styles.content}
        >
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
                <li>{strings.emergencyDetailsOne}</li>
                <li>{strings.emergencyDetailsTwo}</li>
                <li>{strings.emergencyDetailsThree}</li>
            </Container>
            <Container
                heading={strings.designedForTitle}
                headingLevel={3}
                withHeaderBorder
            >
                <div>{strings.designedForDetails}</div>
            </Container>
            <Container
                heading={strings.personnelTitle}
                headingLevel={3}
                withHeaderBorder
            >
                <div>{strings.personnelDetails}</div>
            </Container>
            <Container
                heading={strings.specificationsTitle}
                headingLevel={3}
                withHeaderBorder
                className={styles.specification}
                childrenContainerClassName={styles.specificationContent}
            >
                <TextOutput
                    label={strings.specificationsCostTitle}
                    strongLabel
                    value={strings.specificationsCostDetails}
                />
                <TextOutput
                    label={strings.specificationsNSTitle}
                    strongLabel
                    value={strings.specificationsNSDetails}
                />
            </Container>
            <Container
                heading={strings.additionalTitle}
                headingLevel={3}
                withHeaderBorder
            >
                <div>{strings.additionalDetails}</div>
            </Container>
        </Container>
    );
}

Component.displayName = 'CatalogueEPOA';
