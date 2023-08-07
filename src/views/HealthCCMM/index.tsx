import { useCallback, useContext } from 'react';
import { generatePath } from 'react-router-dom';
import { ChevronLeftLineIcon } from '@ifrc-go/icons';

import useTranslation from '#hooks/useTranslation';
import useGoBack from '#hooks/useGoBack';
import RouteContext from '#contexts/route';
import Container from '#components/Container';
import IconButton from '#components/IconButton';
import TextOutput from '#components/TextOutput';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        catalogueHealth: catalogueHealthRoute,
    } = useContext(RouteContext);

    const goBack = useGoBack();

    const handleBackButtonClick = useCallback(() => {
        goBack(generatePath(catalogueHealthRoute.absolutePath));
    }, [goBack, catalogueHealthRoute.absolutePath]);

    return (
        <Container
            className={styles.choleraTreatmentHealth}
            heading={strings.healthCCMMTitle}
            childrenContainerClassName={styles.content}
            icons={(
                <IconButton
                    name={undefined}
                    onClick={handleBackButtonClick}
                    ariaLabel={strings.healthCCMMGoBack}
                    variant="tertiary"
                    title={strings.healthCCMMGoBack}
                >
                    <ChevronLeftLineIcon />
                </IconButton>

            )}
            headingLevel={2}
        >
            <Container
                heading={strings.healthCCMMCapacityTitle}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.content}
            >
                <div>{strings.healthCCMMCapacityDetail}</div>
            </Container>
            <Container
                heading={strings.healthCCMMEmergencyServices}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.healthCCMMEmergencyServicesDetail}</div>
            </Container>
            <Container
                heading={strings.healthCCMMDesignedFor}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.healthCCMMDesignedForDetail}</div>
            </Container>
            <Container
                heading={strings.healthCCMMDesignedSpecification}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <TextOutput
                    value={strings.healthCCMMNsValue}
                    label={strings.healthCCMMNsLabel}
                    strongLabel
                />
            </Container>
        </Container>
    );
}

Component.displayName = 'HealthCCMM';
