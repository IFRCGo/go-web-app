import { useCallback } from 'react';
import { ChevronLeftLineIcon } from '@ifrc-go/icons';

import Container from '#components/Container';
import IconButton from '#components/IconButton';
import Image from '#components/Image';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';
import useRouting from '#hooks/useRouting';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const { goBack } = useRouting();

    const handleBackButtonClick = useCallback(() => {
        goBack('logisticsEmergency');
    }, [goBack]);

    return (
        <Container
            className={styles.logisticsEmergency}
            heading={strings.logisticsEmergencyTitle}
            childrenContainerClassName={styles.content}
            icons={(
                <IconButton
                    name={undefined}
                    onClick={handleBackButtonClick}
                    ariaLabel={strings.logisticsEmergencyGoBack}
                    variant="tertiary"
                    title={strings.logisticsEmergencyGoBack}
                >
                    <ChevronLeftLineIcon />
                </IconButton>

            )}
            headingLevel={2}
        >
            <div className={styles.imageList}>
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/logs_01.jpg"
                    caption={strings.logisticsEmergencyImageOneCaption}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/logs_02.jpg"
                    caption={strings.logisticsEmergencyImageTwoCaption}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/logs_03.jpg"
                    caption={strings.logisticsEmergencyImageThreeCaption}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/logs_04.jpg"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/logs_05.jpg"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/logs_06.jpg"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/logs_07.jpg"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/logs_08.jpg"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/logs_09.jpg"
                    caption={strings.logisticsEmergencyImageNineCaption}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/logs_10.jpg"
                    caption={strings.logisticsEmergencyImageTenCaption}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/logs_11.jpg"
                    caption={strings.logisticsEmergencyImageElevenCaption}
                    imageClassName={styles.image}
                />
            </div>
            <Container
                heading={strings.logisticsEmergencyCapacity}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.logisticsEmergencyCapacityDescription}</div>
            </Container>
            <Container
                heading={strings.logisticsEmergencyServices}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.logisticsEmergencyServicesDescription}</div>
                <ul>
                    <li>
                        {strings.logisticsEmergencyServicesItemOne}
                    </li>
                    <li>
                        {strings.logisticsEmergencyServicesItemTwo}
                    </li>
                    <li>
                        {strings.logisticsEmergencyServicesItemThree}
                    </li>
                    <li>
                        {strings.logisticsEmergencyServicesItemFour}
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.logisticsPersonnel}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <TextOutput
                    value={strings.logisticsPersonnelValue}
                    label={strings.logisticsPersonnelLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.logisticsPersonnelCompositionValue}
                    label={strings.logisticsPersonnelCompositionLabel}
                    strongLabel
                />
            </Container>
            <Container
                heading={strings.logisticsStandardComposition}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.logisticsStandardCompositionText}</div>
                <ul>
                    <li>
                        {strings.logisticsStandardCompositionTextListOne}
                    </li>
                    <li>
                        {strings.logisticsStandardCompositionTextListTwo}
                    </li>
                    <li>
                        {strings.logisticsStandardCompositionTextListThree}
                    </li>
                    <li>
                        {strings.logisticsStandardCompositionTextListFour}
                    </li>
                    <li>
                        {strings.logisticsStandardCompositionTextListFive}
                    </li>
                    <li>
                        {strings.logisticsStandardCompositionTextListSix}
                    </li>
                    <li>
                        {strings.logisticsStandardCompositionTextListSeven}
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.logisticsSpecifications}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <TextOutput
                    value={strings.logisticsSpecificationsWeightValue}
                    label={strings.logisticsSpecificationsWeightLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.logisticsSpecificationsVolumeValue}
                    label={strings.logisticsSpecificationsVolumeLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.logisticsSpecificationsCostValue}
                    label={strings.logisticsSpecificationsCostLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.logisticsSpecificationsNSValue}
                    label={strings.logisticsSpecificationsNSLabel}
                    strongLabel
                />
            </Container>
        </Container>
    );
}

Component.displayName = 'LogisticsEmergency';
