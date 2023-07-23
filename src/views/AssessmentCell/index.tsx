import { useCallback, useContext } from 'react';
import { generatePath } from 'react-router-dom';

import RouteContext from '#contexts/route';
import { ChevronLeftLineIcon } from '@ifrc-go/icons';
import Container from '#components/Container';
import IconButton from '#components/IconButton';
import Image from '#components/Image';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';
import useGoBack from '#hooks/useGoBack';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        catalogueEmergency: catalogueEmergencyRoute,
    } = useContext(RouteContext);

    const goBack = useGoBack();

    const handleBackButtonClick = useCallback(() => {
        goBack(generatePath(catalogueEmergencyRoute.absolutePath));
    }, [goBack, catalogueEmergencyRoute.absolutePath]);

    return (
        <Container
            className={styles.assessmentCell}
            heading={strings.assessmentCellTitle}
            childrenContainerClassName={styles.content}
            icons={(
                <IconButton
                    name={undefined}
                    onClick={handleBackButtonClick}
                    ariaLabel={strings.goBack}
                    variant="tertiary"
                    title={strings.goBack}
                >
                    <ChevronLeftLineIcon />
                </IconButton>

            )}
            headingLevel={2}
        >
            <div className={styles.imageList}>
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/assessment-cell_01.jpg"
                    caption={strings.assessmentCellImageOne}
                    height="16rem"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/assessment-cell_02.jpg"
                    caption={strings.assessmentCellImageTwo}
                    height="16rem"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/assessment-cell_03.jpg"
                    caption={strings.assessmentCellImageThree}
                    height="16rem"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/assessment-cell_04.jpg"
                    caption={strings.assessmentCellImageFour}
                    height="16rem"
                    imageClassName={styles.image}
                />
            </div>
            <Container
                heading={strings.capacity}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.content}
            >
                <div>{strings.capacityDetailsSectionOne}</div>
                <div>{strings.capacityDetailsSectionTwo}</div>
                <div>{strings.capacityDetailsSectionThree}</div>
            </Container>
            <Container
                heading={strings.emergencyServices}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                {strings.supportTo}
                <ul>
                    <li>
                        {strings.assessmentEmergencyListItemOne}
                    </li>
                    <li>
                        {strings.assessmentEmergencyListItemTwo}
                    </li>
                    <li>
                        {strings.assessmentEmergencyListItemThree}
                    </li>
                    <li>
                        {strings.assessmentEmergencyListItemFour}
                    </li>
                    <li>
                        {strings.assessmentEmergencyListItemFive}
                    </li>
                    <li>
                        {strings.assessmentEmergencyListItemSix}
                    </li>
                    <li>
                        {strings.assessmentEmergencyListItemSeven}
                    </li>
                    <li>
                        {strings.assessmentEmergencyListItemEight}
                    </li>
                    <li>
                        {strings.assessmentEmergencyListItemNine}
                    </li>
                    <li>
                        {strings.assessmentEmergencyListItemTen}
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.designedFor}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.designedForDetailsSectionOne}</div>
                <div>{strings.designedForDetailsSectionTwo}</div>
            </Container>
            <Container
                heading={strings.personnel}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <TextOutput
                    value={strings.totalPersonnelValue}
                    label={strings.totalPersonnelLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.compositionValue}
                    label={strings.compositionLabel}
                    strongLabel
                />
            </Container>
            <Container
                heading={strings.variationOnConfiguration}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                {strings.variationOnConfigurationDetails}
            </Container>
        </Container>
    );
}

Component.displayName = 'AssessmentCell';
