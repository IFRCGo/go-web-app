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
            heading={strings.safeAndDignifiedBurialsTitle}
            childrenContainerClassName={styles.content}
            icons={(
                <IconButton
                    name={undefined}
                    onClick={handleBackButtonClick}
                    ariaLabel={strings.healthBurialsGoBack}
                    variant="tertiary"
                    title={strings.healthBurialsGoBack}
                >
                    <ChevronLeftLineIcon />
                </IconButton>

            )}
            headingLevel={2}
        >
            <Container
                heading={strings.healthBurialsCapacity}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.content}
            >
                <div>{strings.healthBurialsDetail}</div>
            </Container>
            <Container
                heading={strings.healthBurialsEmergencyServicesTitle}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.healthBurialsEmergencyServicesDetail}</div>
            </Container>
            <Container
                heading={strings.healthBurialsPersonnel}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <TextOutput
                    value={strings.healthBurialsTotalValue}
                    label={strings.healthBurialsTotalLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.healthBurialsCompositionValue}
                    label={strings.healthBurialsCompositionLabel}
                    strongLabel
                />
            </Container>
            <Container
                heading={strings.healthBurialsStandardComponentsLabel}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <ul>
                    <li>
                        {strings.healthBurialsStandardComponentsListItemOne}
                    </li>
                    <li>
                        {strings.healthBurialsStandardComponentsListItemTwo}
                    </li>
                    <li>
                        {strings.healthBurialsStandardComponentsListItemThree}
                    </li>
                    <li>
                        {strings.healthBurialsStandardComponentsListItemFour}
                    </li>
                    <li>
                        {strings.healthBurialsStandardComponentsListItemFive}
                    </li>
                    <li>
                        {strings.healthBurialsStandardComponentsListItemSix}
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.healthBurialsSpecificationsLabel}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <TextOutput
                    value={strings.healthBurialsSpecificationsWeightValue}
                    label={strings.healthBurialsSpecificationsWeightLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.healthBurialsSpecificationsVolumeValue}
                    label={strings.healthBurialsSpecificationsVolumeLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.healthBurialsSpecificationsCostValue}
                    label={strings.healthBurialsSpecificationsCostLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.healthBurialsSpecificationsNsValue}
                    label={strings.healthBurialsSpecificationsNsLabel}
                    strongLabel
                />
            </Container>
            <Container
                heading={strings.healthBurialsVariationLabel}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.healthBurialsVariationDescription}</div>
            </Container>

        </Container>
    );
}

Component.displayName = 'HealthBurials';
